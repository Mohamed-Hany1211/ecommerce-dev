// modules imports
import slugify from 'slugify';
// files imports
import Category from '../../../DB/models/category.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/Generate-unique-string.js';
import subCategroyModel from '../../../DB/models/sub-category.model.js';
import Brands from '../../../DB/models/brand.model.js';
// ============================== add category ============================= //

/*
    // 1 - destructing the category name from the body
    // 2 - destructing the user id from the authUser
    // 3 - check if the category name is already in the database
    // 4 - generate the slug of category name
    // 5 - check if the user upload an image
    // 6 - upload image to cloudinary
    // 7 - save the category folder in the request object for rollback in case of error
    // 8 - make the category object 
    // 9 - put the category in the database
    // 10 - save the created category in the request object for rollback in case of error
    // 11 - check if the category created
    // 12 - return the response
*/

export const addCategory = async (req, res, next) => {
    // 1 - destructing the category name from the body
    const { name } = req.body;
    // 2 - destructing the user id from the authUser
    const { _id } = req.authUser;
    // 3 - check if the category name is already in the database
    const isCategoryExist = await Category.findOne({ name });
    if (isCategoryExist) {
        return next({message: 'Category is already exist ', status: 409});
    }
    // 4 - generate the slug of category name
    const slug = slugify(name, '-');
    // 5 - check if the user upload an image
    if (!req.file) {
        return next({message: 'please upload the category image', status: 400});
    }
    // 6 - upload image to cloudinary
    const folderId = generateUniqueString(7);
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`
    })
    // 7 - save the category folder in the request object for rollback in case of error
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`;
    // 8 - make the category object 
    const category = {
        name,
        slug,
        img: {
            secure_url,
            public_id
        },
        folderId,
        addedBy: _id,
    }

    // 9 - put the category in the database
    const newCategory = await Category.create(category);
    // 10 - save the created category in the request object for rollback in case of error
    req.savedDocument = { model : Category , _id : newCategory._id };
    // 11 - check if the category created
    if (!newCategory) {
        return next(new Error('unable to create category', { cause: 500 }));
    }
    // 12 - return the response
    return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
    });
}

// ============================ update Category ============================ //

/* 
    // 1 - destructing the new category name and old public id from the request body
    // 2 - destructing the category id from the request param
    // 3 - destructing the user id from the authUser
    // 4 - check if the category is exist
    // 5 - check if the user want to update the name feild
        // 5.1 - check if the new category name diffrent from the old one
        // 5.2 - check if the new category name is already exist
        // 5.3 - update the category name and slug
    // 6 - check if the user want to update the image 
        // 6.1 - check if the user upload an image
        // 6.2 - update the image data 
        // 6.3 - update the image secure url
    // 7 - set value for the updatedBy field
    // 8 - save the updated category
    // 9 - return the response
*/
export const updateCategory = async (req, res, next) => {
    // 1 - destructing the new category name and old public id from the request body
    const { name, oldPublicId } = req.body;
    // 2 - destructing the category id from the request param
    const { categoryId } = req.params;
    // 3 - destructing the user id from the authUser
    const { _id } = req.authUser;   
    // 4 - check if the category is exist
    const category = await Category.findById(categoryId);
    if (!category) {
        return next({message: 'Category not found ', status: 404});
    }
    // 5 - check if the user want to update the name feild
    if (name) {
        // 5.1 - check if the new category name diffrent from the old one
        if (name === category.name) {
            return next({message: 'please enter diffrent category name from the existing one', status: 400})
        }
        // 5.2 - check if the new category name is already exist
        const isNameDuplicate = await Category.findOne({ name });
        if (isNameDuplicate) {
            return next({message: 'Category name is already exist ', status: 409});
        }
        // 5.3 - update the category name and slug
        category.name = name;
        category.slug = slugify(name, '-');
    }

    // 6 - check if the user want to update the image 
    if (oldPublicId) {
        // 6.1 - check if the user upload an image
        if (!req.file) {
            return next({message: 'please upload an image', status: 400});
        }
        // 6.2 - update the image data 
        const newPublicId = oldPublicId.split(`${category.folderId}/`)[1];
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
            public_id: newPublicId
        })
        // 6.3 - update the image secure url
        category.img.secure_url = secure_url;
    }

    // 7 - set value for the updatedBy field
    category.updatedBy = _id;
    // 8 - save the updated category
    await category.save();
    // 9 - return the response
    return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category
    })
}

// ===================== get all categories ================= //

/*
    // 1 - get all categories
    // 2 - check if there is any categories
    // 3 - return the response
*/
export const getAllCategories = async (req, res, next) => {
    // 1 - get all categories 
    const allCategories = await Category.find().populate([{
        path: 'SubCategories',
        populate: [{
            path: 'Brands'
        }]
    }]);
    // 2 - check if there is any categories
    if(!allCategories.length){
        return next({message: 'No categories found', status: 404});
    }
    // 3 - return the response
    return res.status(200).json({
        success: true,
        message: 'All categories fetched successfully',
        data: allCategories
    })
}

// ====================== Delete category ==================== // 

/*
    // 1 - destructing the category id from the request param
    // 2 - delete the category
    // 3 - check if the category is deleted
    // 4 - delete the related subCategories
        // 4.1 - check if the subCategories is deleted it's for debugging and development only 
    // 5 - delete the related brands 
        // 5.1 - check if the brands is deleted it's for debugging and development only 
    // 6 - delete the content of the category folder from cloudinary host
    // 7 - delete the category folder from cloudinary host
    // 8 - return the response
*/

export const deleteCategory = async (req, res, next) => {
    // 1 - destructing the category id from the request param
    const {categoryId} = req.params;
    // 2 - delete the category
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    // 3 - check if the category is deleted
    if(!deletedCategory){
        return next({message: 'Category not found ', status: 404});
    }
    // 4 - delete the related subCategories
    const subCategories = await subCategroyModel.deleteMany({categoryId});
    // 4.1 - check if the subCategories is deleted it's for debugging and development only 
    if(subCategories.deletedCount <= 0){
        console.log(subCategories.deletedCount);
        console.log(`there is no related subCategories`);
    }

    // 5 - delete the related brands 
    const brands = await Brands.deleteMany({categoryId});
    // 5.1 - check if the brands is deleted it's for debugging and development only 
    if(brands.deletedCount <= 0){
        console.log(brands.deletedCount);
        console.log(`there is no related brands`);
    }
    // 6 - delete the content of the category folder from cloudinary host
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${deletedCategory.folderId}`);
    // 7 - delete the category folder from cloudinary host
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${deletedCategory.folderId}`);

    // 8 - return the response
    return res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        data: deletedCategory
    })
}