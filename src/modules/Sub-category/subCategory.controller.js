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
    // 1 - destructing the requird data
    // 2 - check if the category name is already in the database
    // 3 - check if category exist by using categoryId
    // 4 - generate the slug of subCategroy name
    // 5 - upload image to cloudinary
    // 6 - make the subCategroy object 
    // 7 - put the subCategroy in the database
    // 8 - check if the subCategroy created
    // 9 - return the response
*/
export const addSubCategory = async (req, res, next) => {
    // 1 - destructing the requird data
    const { name } = req.body;
    const { _id } = req.authUser;
    const { categoryId } = req.params;
    // 2 - check if the category name is already in the database
    const isSubCategroyExist = await subCategroyModel.findOne({ name });
    if (isSubCategroyExist) {
        return next(new Error('subCategroy is Already exist ', { cause: 409 }));
    }
    // 3 - check if category exist by using categoryId

    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new Error('Category not found', { cause: 404 }));
    }

    // 4 - generate the slug of subCategroy name
    const slug = slugify(name, '-');
    // 5 - upload image to cloudinary
    if (!req.file) {
        return next(new Error('please upload image', { cause: 400 }));
    }

    const folderId = generateUniqueString(7);
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })

    // 6 - make the subCategroy object 
    const subCategroy = {
        name,
        slug,
        img: {
            secure_url,
            public_id
        },
        folderId,
        addedBy: _id,
        categoryId
    }

    // 7 - put the subCategroy in the database
    const newsubCategroy = await subCategroyModel.create(subCategroy);
    // 8 - check if the subCategroy created
    if (!newsubCategroy) {
        return next(new Error('unable to create subCategroy', { cause: 500 }));
    }
    // 9 - return the response
    return res.status(201).json({
        success: true,
        Msg: 'subCategroy created successfully',
        data: newsubCategroy
    });
}

// ========================== delete subCategroy ============================ //
/*
    // 1 - destructing the required data
    // 2 - find the category 
    // 3 - delete the subCategroy
    // 4 - check if the subCategory is deleted
    // 5 - delete the related brands
    // 6 - delete the content of the subCategory folder from host
    // 7 - delete the subCategory folder from host
    // 8 - return the response
*/
export const deleteSubCategory = async (req, res, next) => {
    // 1 - destructing the required data
    const { subCategoryId, categoryId } = req.params;
    // 2 - find the category 
    const category = await Category.findById(categoryId);
    // 3 - delete the subCategroy
    const deletedSubCategory = await subCategroyModel.findByIdAndDelete(subCategoryId);
    // 4 - check if the subCategory is deleted
    if (!deletedSubCategory) {
        return next(new Error('subCategroy not found ', { cause: 404 }));
    }
    // 5 - delete the related brands
    const brands = await Brand.deleteMany({ subCategoryId });
    if (brands.deletedCount <= 0) {
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
        Msg: 'subCategroy deleted successfully',
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
        return next(new Error('no subCategroy found', { cause: 404 }));
    }
    // 3 - return the reponse
    return res.status(200).json({
        success: true,
        Msg: 'subCategroy found successfully',
        data: allSubCategories
    })
}

// ============================ update subCategory ============================ //

/*
    // 1 - destructing the required data
    // 2 - find the subCategory
    // 3 - check if the subCategory is exist
    // 4 - check if the superAdmin wants to update the name
        // 4.1 - check if the subCategory name is already in the database
        // 4.2 check if the super admin update the name with the same value of old name 
        // 4.3 - update the name
        // 4.4 - update the slug
    // 5 - check if user want to change image
        // 5.1 - check if the user upload an image
        // 5.2 - update the image data 
    // 6 - update the updatedBy feild
    // 7 - save the changes
    // 8 - return the response

*/

export const updateSubCategory = async (req, res, next) => {
    // 1 - destructing the required data
    const { subCategoryId } = req.params;
    const { name, oldPublicId } = req.body;
    const { _id } = req.authUser;
    // 2 - find the subCategory
    const requiredSubCategory = await subCategroyModel.findById(subCategoryId);
    // 3 - check if the subCategory is exist
    if (!requiredSubCategory) {
        return next(new Error('subCategroy not found', { cause: 404 }));
    }
    // 4 - check if the superAdmin wants to update the name
    if (name) {
        // 4.1 - check if the subCategory name is already in the database
        const isSubCategroyExist = await subCategroyModel.findOne({ name });
        if (isSubCategroyExist) {
            return next(new Error('subCategroy is Already exist ', { cause: 409 }));
        }
        // 4.2 check if the super admin update the name with the same value of old name 
        if (name === requiredSubCategory.name) {
            return next(new Error('please enter diffrent name from existing one', { cause: 409 }));
        }
        // 4.3 - update the name
        requiredSubCategory.name = name;
        // 4.4 - update the slug
        requiredSubCategory.slug = slugify(name, '-');
    }

    // 5 - check if user want to change image
    if (oldPublicId) {
        // 5.1 - check if the user upload an image
        if(!req.file){
            return next(new Error('please upload an image',{cause:400}));
        }
        // 5.2 - update the image data 
        const newPublicId = oldPublicId.split(`${requiredSubCategory.folderId}/`)[1];
        const folderPath = oldPublicId.split(`${requiredSubCategory.folderId}/`)[0];
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${folderPath}${requiredSubCategory.folderId}/`,
            public_id:newPublicId
        })
        requiredSubCategory.img.secure_url = secure_url;
    }

    // 6 - update the updatedBy feild
    requiredSubCategory.updatedBy = _id;
    // 7 - save the changes
    await requiredSubCategory.save();

    // 8 - return the response
    return res.status(200).json({
        success: true,
        Msg:'subCategroy updated successfully',
        data: requiredSubCategory
    })
}