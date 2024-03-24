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

