// modules imports
import slugify from 'slugify';
// files imports
import Product from '../../../DB/models/product.model.js';
import Brand from '../../../DB/models/brand.model.js';
import { systemRoles } from '../../utils/system-roles.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/Generate-unique-string.js';



// =========================== add product =========================== // 
/*
    // 1 - destructing data from req.body
    // 2 - destructing data from req.query
    // 3 - destructing data from req.authUser
    // 4 - brand check
    // 5 - category check
    // 6 - subCategory check
    // 7 - who will be authorized to add a product
    // 8 - generate the slug of product title
    // 9 - applied price calculations
    // 10 - images
    // 11 - make the product object
    // 12 - create the product
    // 13 - return response
*/
export const addProduct = async (req, res, next) => {
    // 1 - destructing data from req.body
    const { title, description, basePrice, discount, stock, specifications } = req.body;
    // 2 - destructing data from req.query
    const { brandId, categoryId, subCategoryId } = req.query;
    // 3 - destructing data from req.authUser
    const addedBy = req.authUser._id;

    // 4 - brand check
    const brand = await Brand.findById(brandId);
    if (!brand) {
        return next(new Error('brand not found ', { cause: 404 }));
    }
    // 5 - category check
    if (brand.categoryId.toString() !== categoryId) {
        return next(new Error('brand not found in this category ', { cause: 400 }));
    }
    // 6 - subCategory check
    if (brand.subCategoryId.toString() !== subCategoryId) {
        return next(new Error('brand not found in this subCategory ', { cause: 400 }));
    }

    // 7 - who will be authorized to add a product
    if (req.authUser.role !== systemRoles.SUPER_ADMIN && brand.addedBy.toString() !== addedBy.toString()) {
        return next(new Error(`you are not authorized to add a product to this brand`, { cause: 403 }));
    }
    // 8 - generate the slug of product title
    const slug = slugify(title, { lower: true, replacement: '-' });
    // 9 - applied price calculations
    const appliedPrice = basePrice - (basePrice * (discount || 0) / 100);
    // 10 - images
    if (!req.files?.length) {
        return next(new Error('please upload image', { cause: 400 }));
    }
    const imgs = [];
    const folderId = generateUniqueString(7);
    const folderPath = brand.img.public_id.split(`${brand.folderId}/`)[0];

    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path, {
            folder: folderPath + `${brand.folderId}/Products/${folderId}`
        })
        imgs.push({ secure_url, public_id });
    }
    req.folder = folderPath + `${brand.folderId}/Products/${folderId}`;

    // 11 - make the product object
    const product = {
        title,
        slug,
        description,
        basePrice,
        discount,
        appliedPrice,
        stock,
        specifications: JSON.parse(specifications),
        imgs,
        addedBy,
        categoryId,
        subCategoryId,
        brandId,
        folderId
    }
    // 12 - create the product
    const newProduct = await Product.create(product);
    req.savedDocuments = { model: Product, _id: newProduct._id };
    // 13 - return response
    res.status(201).json({
        success: true,
        Msg: 'product created successfully',
        data: newProduct
    })

}

// ==================== update product ====================== // 

// export const updateProduct = async (req, res, next) => {
//     // 1 - destructing data from req.body
//     const { title, description, basePrice, discount, stock, specifications, oldPublicId } = req.body;
//     // 2 - destructing data from req.params
//     const { productId } = req.params;
//     // 3 - destructing data from req.authUser
//     const addedBy = req.authUser._id;
//     // 4 - check if the product is in the database
//     const product = await Product.findById(productId);
//     if (!product) {
//         return next(new Error('product not found ', { cause: 404 }));
//     }
//     // 7 - who will be authorized to add a product
//     if (req.authUser.role !== systemRoles.SUPER_ADMIN && product.addedBy.toString() !== addedBy.toString()) {
//         return next(new Error(`you are not authorized to add a product to this product`, { cause: 403 }));
//     }

//     if (title) {
//         product.title = title
//         product.slug = slugify(title, { lower: true, replacement: '-' })
//     }
//     if (description) product.desc = desc
//     if (specifications) product.specs = JSON.parse(specs)
//     if (stock) product.stock = stock

//     // prices changes
//     // const appliedPrice = (basePrice || product.basePrice) - ((basePrice || product.basePrice) * (discount || product.discount) / 100)
//     const appliedPrice = (basePrice || product.basePrice) * (1 - ((discount || product.discount) / 100))
//     product.appliedPrice = appliedPrice

//     if (basePrice) product.basePrice = basePrice
//     if (discount) product.discount = discount

//     if (oldPublicId) {

//         if (!req.file) return next({ cause: 400, message: 'Please select new image' })

//         const folderPath = product.imgs[0].public_id.split(`${product.folderId}/`)[0]
//         const newPublicId = oldPublicId.split(`${product.folderId}/`)[1];
//         const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
//             folder: folderPath + `${product.folderId}`,
//             public_id: newPublicId
//         })
//         product.imgs.map((img) => {
//             if (img.public_id === oldPublicId) {
//                 img.secure_url = secure_url
//             }
//         })
//         req.folder = folderPath + `${product.folderId}`
//     }


//     await product.save()

//     res.status(200).json({ success: true, message: 'Product updated successfully', data: product })
// }