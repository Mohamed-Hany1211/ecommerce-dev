// modules imports
import slugify from 'slugify';
// files imports
import subCategroyModel from '../../../DB/models/sub-category.model.js';
import Category from '../../../DB/models/category.model.js';
import generateUniqueString from '../../utils/Generate-unique-string.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import Brand from '../../../DB/models/brand.model.js';


// ========================= Add SubCategory ===================== //
/*
    // 1 - destructing the name of the subCategory from the request body
    // 2 - destructing the user id from the authUser
    // 3 - destructing the category id from the request param
    // 4 - check if the subCategory name is already in the database
    // 5 - check if category exist by using categoryId
    // 6 - generate the slug of subCategroy name
    // 7 - upload image to cloudinary
        // 7.1 - generate a unique string for the folder id
        // 7.2 - upload the image to cloudinary
    // 8 - save the created category in the request object for rollback in case of error
    // 9 - make the subCategroy object 
    // 10 - put the subCategroy in the database
    // 11 - save the created category in the request object for rollback in case of error
    // 12 - check if the subCategroy created
    // 13 - return the response
*/
export const addSubCategory = async (req, res, next) => {
    // 1 - destructing the name of the subCategory from the request body
    const { name } = req.body;
    // 2 - destructing the user id from the authUser
    const { _id } = req.authUser;
    // 3 - destructing the category id from the request param
    const { categoryId } = req.params;
    // 4 - check if the subCategory name is already in the database
    const isSubCategroyExist = await subCategroyModel.findOne({ name });
    if (isSubCategroyExist) {
        return next({message: 'subCategroy is already exist ', status: 409});
    }
    // 5 - check if category exist by using categoryId
    const category = await Category.findById(categoryId);
    if (!category) {
        return next({message: 'category not found', status: 404});
    }
    // 6 - generate the slug of subCategroy name
    const slug = slugify(name, '-');
    // 7 - upload image to cloudinary
    if (!req.file) {
        return next({message: 'please upload image', status: 400});
    }
        // 7.1 - generate a unique string for the folder id
    const folderId = generateUniqueString(7);
        // 7.2 - upload the image to cloudinary
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })
    // 8 - save the created category in the request object for rollback in case of error
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`;
    // 9 - make the subCategroy object 
    const subCategroy = {
        name,
        categoryId,
        slug,
        img: {
            secure_url,
            public_id
        },
        folderId,
        addedBy: _id,
    }

    // 10 - put the subCategroy in the database
    const newSubCategroy = await subCategroyModel.create(subCategroy);
    // 11 - save the created category in the request object for rollback in case of error
    req.savedDocument = { model : subCategroyModel , _id : newSubCategroy._id };
    // 12 - check if the subCategroy created
    if (!newSubCategroy) {
        return next({message: 'unable to create subCategroy', status: 500});
    }
    // 13 - return the response
    return res.status(201).json({
        success: true,
        message: 'subCategroy created successfully',
        data: newSubCategroy
    });
}

// ========================== delete subCategroy ============================ //
/*
    // 1 - destructing the sub category id and the category id of the category which this subcategory is belonging to
    // 2 - find the category 
    // 3 - delete the subCategroy
    // 4 - check if the subCategory is deleted
    // 5 - delete the related brands
        // 5.1 - these logs are for the development purposes
    // 6 - delete the content of the subCategory folder from host
    // 7 - delete the subCategory folder from host
    // 8 - return the response
*/
export const deleteSubCategory = async (req, res, next) => {
    // 1 - destructing the sub category id and the category id of the category which this subcategory is belonging to
    const { subCategoryId, categoryId } = req.params;
    // 2 - find the category 
    const category = await Category.findById(categoryId);
    // 3 - delete the subCategroy
    const deletedSubCategory = await subCategroyModel.findByIdAndDelete(subCategoryId);
    // 4 - check if the subCategory is deleted
    if (!deletedSubCategory) {
        return next({message:'Sub Category Not found',cause:404});
    }
    // 5 - delete the related brands
    const brands = await Brand.deleteMany({ subCategoryId });
    if (brands.deletedCount <= 0) {
        // 5.1 - these logs are for the development purposes
        console.log(brands.deletedCount);
        console.log(`there is no related brands`);
    }
    // 6 - delete the content of the subCategory folder from host
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${deletedSubCategory.folderId}`);
    // 7 - delete the subCategory folder from host
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${deletedSubCategory.folderId}`);
    // 8 - return the response
    return res.status(200).json({
        success: true,
        message: 'subCategroy deleted successfully',
        data: deletedSubCategory
    })
}

// ========================== get all subCategroies with related brands ============================ //
/*
    // 1 - get all subCategories 
    // 2 - check if subCategories exist 
    // 3 - return the reponse
*/
export const getAllSubCategoriesWithBrands = async (req, res, next) => {
    // 1 - get all subCategories 
    const allSubCategories = await subCategroyModel.find().populate([{
        path: 'Brands'
    }]);
    // 2 - check if subCategories exist 
    if (!allSubCategories.length) {
        return next({message:'No Sub Categories Found',cause:404});
    }
    // 3 - return the reponse
    return res.status(200).json({
        success: true,
        message: 'subCategroy found successfully',
        data: allSubCategories
    })
}

// ============================ update subCategory ============================ //

/*
    // 1 - destructing the sub category id from the request param
    // 2 - destructing the new sub category name and old public id from the request body
    // 3 - destructing the user id from the authUser
    // 4 - find the subCategory
    // 5 - check if the subCategory is exist
    // 6 - check if the superAdmin wants to update the name
        // 6.1 - check if the subCategory name is already in the database
        // 6.2 - update the name
        // 6.3 - update the slug
    // 7 - check if user want to change image
        // 7.1 - check if the user upload an image
        // 7.2 - creating the new public id 
        // 7.3 - creating the folder path
        // 7.4 - uploading the image to cloudinary
        // 7.5 - update the image secure url
        // 7.6 - save the folder path in the request object for rollback in case of error
    // 8 - update the updatedBy feild
    // 9 - save the changes
    // 10 - return the response
*/

export const updateSubCategory = async (req, res, next) => {
    // 1 - destructing the sub category id from the request param
    const { subCategoryId } = req.params;
    // 2 - destructing the new sub category name and old public id from the request body
    const { name, oldPublicId } = req.body;
    // 3 - destructing the user id from the authUser
    const { _id } = req.authUser;

    // 4 - find the subCategory
    const requiredSubCategory = await subCategroyModel.findById(subCategoryId);
    // 5 - check if the subCategory is exist
    if (!requiredSubCategory) {
        return next({message: 'subCategroy not found', status: 404});
    }
    // 6 - check if the superAdmin wants to update the name
    if (name) {
        // 6.1 - check if the subCategory name is already in the database
        const isSubCategroyExist = await subCategroyModel.findOne({ name });
        if (isSubCategroyExist) {
            return next({message: 'subCategroy is already exist', status: 409});
        }
        // 6.2 - update the name
        requiredSubCategory.name = name;
        // 6.3 - update the slug
        requiredSubCategory.slug = slugify(name, '-');
    }

    // 7 - check if user want to change image
    if (oldPublicId) {
        // 7.1 - check if the user upload an image
        if(!req.file){
            return next({message: 'please upload an image', status: 400});
        }
        // 7.2 - creating the new public id 
        const newPublicId = oldPublicId.split(`${requiredSubCategory.folderId}/`)[1];
        // 7.3 - creating the folder path
        const folderPath = oldPublicId.split(`${requiredSubCategory.folderId}/`)[0];
        // 7.4 - uploading the image to cloudinary
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${folderPath}${requiredSubCategory.folderId}/`,
            public_id:newPublicId
        })
        // 7.5 - update the image secure url
        requiredSubCategory.img.secure_url = secure_url;
        // 7.6 - save the folder path in the request object for rollback in case of error
        req.folder = `${process.env.MAIN_FOLDER}/Categories/${requiredSubCategory.folderId}/SubCategories/${requiredSubCategory.folderId}`;
    }

    // 8 - update the updatedBy feild
    requiredSubCategory.updatedBy = _id;
    // 9 - save the changes
    await requiredSubCategory.save();

    // 10 - return the response
    return res.status(200).json({
        success: true,
        message:'subCategroy updated successfully',
        data: requiredSubCategory
    })
}