// modules imports
import slugify from 'slugify';
// files imports
import subCategroyModel from '../../../DB/models/sub-category.model.js';
import Category from '../../../DB/models/category.model.js';
import generateUniqueString from '../../utils/Generate-unique-string.js';
import cloudinaryConnection from '../../utils/cloudinary.js';


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
    const {categoryId} = req.params;
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

// ==========================