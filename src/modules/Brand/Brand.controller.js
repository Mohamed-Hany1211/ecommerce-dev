// modules imports
import slugify from "slugify";
// files imports
import Brand from "../../../DB/models/brand.model.js";
import cloudinaryConnection from '../../utils/cloudinary.js';
import subCategory from '../../../DB/models/sub-category.model.js';
import generateUniqueString from '../../utils/Generate-unique-string.js';
// =========================== add brand ====================== //

/*
    // 1 - destructing the required data from request object
    // 2 - subCategory check
    // 3 - check if the brand document duplicated
    // 4 - check if the category exist by using categoryId
    // 5 - generate the slug
    // 6 - upload image to cloudinary
    // 7 - make the brand object
    // 8 - check if the brand created
    // 9 - return the response
*/

export const addBrand = async (req,res,next)=>{
    // 1 - destructing the required data from request object
    const {name} = req.body;
    const {categoryId,subCategoryId} = req.query;
    const {_id} = req.authUser;
    // 2 - subCategory check
    const subCategoryCheck = await subCategory.findById(subCategoryId).populate('categoryId','folderId');
    if(!subCategoryCheck){
        return next(new Error('subCategory not found ',{cause:404}));
    }
    // 3 - check if the brand document duplicated
    const isBrandExist = await Brand.findOne({ name , subCategoryId });
    if (isBrandExist) {
        return next(new Error('brand is Already exist for this subCategory', { cause: 400 }));
    }
    // 4 - check if the category exist by using categoryId
    if(categoryId != subCategoryCheck.categoryId._id ){
        return next(new Error('Category not found', { cause: 404 }));
    }
    // 5 - generate the slug
    const slug = slugify(name, '-');
    // 6 - upload image to cloudinary
    if (!req.file) {
        return next(new Error('please upload the Brand logo', { cause: 400 }));
    }
    const folderId = generateUniqueString(7); 
    const {secure_url , public_id } = await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:`${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`
    })
    // 7 - make the brand object
    const BrandObject = {
        name,
        slug,
        img:{
            secure_url,
            public_id
        },
        subCategoryId,
        addedBy:_id,
        categoryId,
        folderId
    }

    const newBrand = await Brand.create(BrandObject);

    // 8 - check if the brand created
    if(!newBrand){
        return next(new Error('unable to create brand',{cause:500}));
    }
    // 9 - return the response
    res.status(201).json({
        success: true,
        Msg: 'brand added successfully',
        data: newBrand
    })

}


// ========================= delete brand ========================= // 

/*
    // 1 - destructing the required data
    // 2 - delete the brand
    // 3 - return the response
*/

export const deleteBrand = async (req,res,next)=>{
    // 1 - destructing the required data
    const {brandId} = req.params;
    // 2 - delete the brand
    const deletedBrand = await Brand.findByIdAndDelete(brandId);
    if(!deletedBrand){
        return next(new Error('brand not found ',{cause:404}));
    }
    // 3 - return the response
    res.status(200).json({
        success: true,
        Msg: 'brand deleted successfully'
    })
}

// ========================= update brand ========================= // 
/*
    // 1 - destructing the request body
    // 2 - destructing the user id
    // 3 - destructing the request param
    // 4 - find the required brand 
    // 5 - check if the user is the brand owner
    // 6 - check if the brand is exist
    // 7 - check if the user want to update the name feild
        // 7.1 - check if the new name is diffrent from the nem one
    // 8 - check if the user want to update the image
        // 8.1 - check if the user upload an image
        // 8.2 - update the image data 
    // 9 - set value for updatedBy feild
    // 10 - return the response
*/

export const updateBrand = async (req,res,next)=>{
    // 1 - destructing the request body
    const {newName , oldPublicId} = req.body;
    // 2 - destructing the user id
    const {_id} = req.authUser;
    // 3 - destructing the request param
    const {brandId} = req.query;

    // 4 - find the required collections 
    const requiredBrand = await Brand.findById(brandId);
    // 5 - check if the brand is exist
    if(!requiredBrand){
        return next(new Error('brand not found ',{cause:404}));
    }
    // 6 - check if the user is the brand owner
    if(_id.toString() != requiredBrand.addedBy.toString()){
        return next(new Error(`unAuthorized action , brand owner only can perform this action`,{cause:401}))
    }
    // 7 - check if the user want to update the name feild
    if(newName){
        // 7.1 - check if the new name is diffrent from the nem one
        if(newName === requiredBrand.name){
            return next(new Error('please enter diffrent brand name from the existing one', { cause: 400 }))
        }
        requiredBrand.name = newName;
        requiredBrand.slug = slugify(newName, '-');
    }
    // 8 - check if the user want to update the image
    if(oldPublicId){
        // 8.1 - check if the user upload an image
        if(!req.file){
            return next(new Error('please upload an image',{cause:400}));
        }
        // 8.2 - update the image data 
        const newPublicId = oldPublicId.split(`${requiredBrand.folderId}/`)[1];
        const folderPath = oldPublicId.split(`${requiredBrand.folderId}/`)[0];
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${folderPath}${requiredBrand.folderId}/`,
            public_id:newPublicId
        })
        requiredBrand.img.secure_url = secure_url;
    }
    // 9 - set value for updatedBy feild
    requiredBrand.updatedBy = _id;
    await requiredBrand.save();
    // 10 - return the response
    res.status(200).json({
        success: true,
        Msg: 'brand updated successfully',
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
        return next(new Error(`no brand found`,{cause:404}));
    }
    // 3 - return the response
    res.status(200).json({
        success: true,
        data: allBrands
    })
}

