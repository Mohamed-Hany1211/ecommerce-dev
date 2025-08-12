// modules imports
import slugify from "slugify";
// files imports
import Brand from "../../../DB/models/brand.model.js";
import Category from "../../../DB/models/category.model.js";
import subCategroyModel from "../../../DB/models/sub-category.model.js";
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/Generate-unique-string.js';
// =========================== add brand ====================== //

/*
    // 1 - destructing the brand name from the body
    // 2 - destructing the category id and the sub category id from the query
    // 3 - destructing the id of the signed in user from the auth user
    // 4 - check if the sub Category exist in the DB 
    // 5 - check if the brand document duplicated
    // 6 - check if the category exist by using categoryId
    // 7 - generate the slug
    // 8 - check if the user upload a brand logo or not
    // 9 - generate unique folder for the brand  
    // 10 - upload the brand logo
    // 11 - store the folder of the brand logo in cloudinary for rollback in case of failuer
    // 12 - make the brand object
    // 13 - create the new brand document 
    // 14 - save the brand document for rollback in the case of failur 
    // 15 - check if the brand created
    // 16 - return the response
*/

export const addBrand = async (req,res,next)=>{
    // 1 - destructing the brand name from the body
    const {name} = req.body;
    // 2 - destructing the category id and the sub category id from the query
    const {categoryId,subCategoryId} = req.query;
    // 3 - destructing the id of the signed in user from the auth user
    const {_id} = req.authUser;
    // 4 - check if the sub Category exist in the DB 
    const subCategoryCheck = await subCategroyModel.findById(subCategoryId).populate('categoryId','folderId');
    if(!subCategoryCheck){
        return next({message:'Sub Category Not Found',cause:404});
    }
    // 5 - check if the brand document duplicated
    const isBrandExist = await Brand.findOne({ name , subCategoryId });
    if (isBrandExist) {
        return next({message:'Brand is Already Exist For This Sub Category',cause:400});
    }
    // 6 - check if the category exist by using categoryId
    if(categoryId != subCategoryCheck.categoryId._id ){
        return next({message:'Category Not found',cause:404});
    }
    // 7 - generate the slug
    const slug = slugify(name, '-');
    // 8 - check if the user upload a brand logo or not
    if (!req.file) {
        return next({message:'Please Upload The Brand Logo',cause:400});
    }
    // 9 - generate unique folder for the brand  
    const folderId = generateUniqueString(7);
    // 10 - upload the brand logo
    const {secure_url , public_id } = await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:`${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`
    })
    // 11 - store the folder of the brand logo in cloudinary for rollback in case of failuer
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`;
    // 12 - make the brand object
    const BrandObject = {
        name,
        slug,
        img:{
            secure_url,
            public_id
        },
        folderId,
        subCategoryId,
        categoryId,
        addedBy:_id,
    }
    // 13 - create the new brand document 
    const newBrand = await Brand.create(BrandObject);
    // 14 - save the brand document for rollback in the case of failur 
    req.savedDocument = { model : Brand , _id : newBrand._id };
    // 15 - check if the brand created
    if(!newBrand){
        return next(new Error('unable to create brand',{cause:500}));
    }
    // 16 - return the response
    res.status(201).json({
        success: true,
        message: 'Brand Added Successfully',
        data: newBrand
    })
}


// ========================= delete brand ========================= // 

/*
    // 1 - destructing the brand id from the params
    // 2 - delete the brand
    // 3 - check if the brand deleted from the DB
    // 4 - get the category 
    // 5 - get the SubCategory 
    // 6 - delete the brand's media from cloudinary
    // 7 - delete the brand's folder from cloudinary
    // 8 - return the response
*/

export const deleteBrand = async (req,res,next)=>{
    // 1 - destructing the brand id from the params
    const {brandId} = req.params;
    // 2 - delete the brand
    const deletedBrand = await Brand.findByIdAndDelete(brandId);
    // 3 - check if the brand deleted from the DB
    if(!deletedBrand){
        return next({message:'Breand Not Found',cause:404});
    }

    // 4 - get the category 
    const RelatedCategory = await Category.findById(deletedBrand.categoryId);
    if(!RelatedCategory){
        return next({message:'Category Not Found',cause:404});
    }

    // 5 - get the SubCategory 
    const RelatedSubCategory = await subCategroyModel.findById(deletedBrand.subCategoryId);
    if(!RelatedSubCategory){
        return next({message:'SubCategory Not Found',cause:404});
    }
    // 6 - delete the brand's media from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${RelatedCategory.folderId}/SubCategories/${RelatedSubCategory.folderId}/Brands/${deletedBrand.folderId}`);
    // 7 - delete the brand's folder from cloudinary
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${RelatedCategory.folderId}/SubCategories/${RelatedSubCategory.folderId}/Brands/${deletedBrand.folderId}`);
    // 8 - return the response
    res.status(200).json({
        success: true,
        message: 'brand deleted successfully'
    })
}

// ========================= update brand ========================= // 
/*
    // 1 - destructing the new brand name and the old public id of the brand image
    // 2 - destructing the user id
    // 3 - destructing the brand id from the param
    // 4 - find the required brand 
    // 5 - check if the brand is exist
    // 6 - check if the user is the brand owner
    // 7 - check if the user want to update the name feild
        // 7.1 - check if the new name is diffrent from the nem one
        // 7.2 - update the name
        // 7.3 - update the slug
    // 8 - check if the user want to update the image
        // 8.1 - check if the user upload an image
        // 8.2 - update the public id of the image 
        // 8.3 - update the folder path of the brand's image
        // 8.4 - upload the image
        // 8.5 - update the imag's secure url
    // 9 - set value for updatedBy feild
    // 10 - save the updates
    // 11 - return the response
*/

export const updateBrand = async (req,res,next)=>{
    // 1 - destructing the new brand name and the old public id of the brand image
    const {newName , oldPublicId} = req.body;
    // 2 - destructing the user id
    const {_id} = req.authUser;
    // 3 - destructing the brand id from the param
    const {brandId} = req.query;

    // 4 - find the required brand 
    const requiredBrand = await Brand.findById(brandId);
    // 5 - check if the brand is exist
    if(!requiredBrand){
        return next({message:'Brand Not Found',cause:404});
    }
    // 6 - check if the user is the brand owner
    if(_id.toString() != requiredBrand.addedBy.toString()){
        return next({message:'UnAuthorized Action , Brand Owner Only Can Perform This Action',cause:401})
    }
    // 7 - check if the user want to update the name feild
    if(newName){
        // 7.1 - check if the new name is diffrent from the nem one
        if(newName === requiredBrand.name){
            return next({message:'Please Enter Different Brand Name From The Existing One',cause:400})
        }
        // 7.2 - update the name
        requiredBrand.name = newName;
        // 7.3 - update the slug
        requiredBrand.slug = slugify(newName, '-');
    }
    // 8 - check if the user want to update the image
    if(oldPublicId){
        // 8.1 - check if the user upload an image
        if(!req.file){
            return next({message:'Please Upload An Image',cause:400});
        }
        // 8.2 - update the public id of the image 
        const newPublicId = oldPublicId.split(`${requiredBrand.folderId}/`)[1];
        // 8.3 - update the folder path of the brand's image
        const folderPath = oldPublicId.split(`${requiredBrand.folderId}/`)[0];
        // 8.4 - upload the image
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${folderPath}${requiredBrand.folderId}/`,
            public_id:newPublicId
        })
        // 8.5 - update the imag's secure url
        requiredBrand.img.secure_url = secure_url;
    }
    // 9 - set value for updatedBy feild
    requiredBrand.updatedBy = _id;
    // 10 - save the updates
    await requiredBrand.save();
    // 11 - return the response
    res.status(200).json({
        success: true,
        message: 'brand updated successfully',
        data: requiredBrand
    })
}


// ========================= get all brands ========================= //
/*
    // 1 - get all brands from DB
    // 2 - check if the brands exist
    // 3 - return the response
*/
export const getAllBrands = async (req,res,next)=>{
    // 1 - get all brands from DB
    const allBrands = await Brand.find();
    // 2 - check if the brands exist
    if(!allBrands.length){
        return next({message:'No Brand Found',cause:404});
    }
    // 3 - return the response
    res.status(200).json({
        success: true,
        message:'All Brands Fetched Successfully',
        data: allBrands
    })
}

