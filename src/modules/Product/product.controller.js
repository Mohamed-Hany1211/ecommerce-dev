// modules imports
import slugify from 'slugify';
// files imports
import Product from '../../../DB/models/product.model.js';
import Brand from '../../../DB/models/brand.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/Generate-unique-string.js';
import { ApiFeatures } from '../../utils/api-features.js';



// =========================== add product =========================== // 
/*
    // 1 - destructing the product data from body
    // 2 - destructing brand Id, category Id, subCategory Id from query
    // 3 - destructing the user from authUser
    // 4 - brand check
    // 5 - category check
    // 6 - subCategory check
    // 7 - who will be authorized to add a product
    // 8 - generate the slug of product title
    // 9 - applied price calculations
    // 10 - images
    // 11 - prepare the imgaes folder in the host
    // 12 - uploading each image of the product to the host
    // 13 - save the product images folder for rollback in case of any errors 
    // 14 - make the product object
    // 15 - create the product
    // 16 - save the product document for rollback in case of errors
    // 17 - return response
*/
export const addProduct = async (req, res, next) => {
    // 1 - destructing the product data from body
    const { title, description, basePrice, discount, stock, specifications } = req.body;
    // 2 - destructing brand Id, category Id, subCategory Id from query
    const { brandId, categoryId, subCategoryId } = req.query;
    // 3 - destructing the user from authUser
    const addedBy = req.authUser._id;

    // 4 - brand check
    const brand = await Brand.findById(brandId);
    if (!brand) {
        return next({message:'Brand Not Found',cause:404});
    }
    // 5 - category check
    if (brand.categoryId.toString() !== categoryId) {
        return next({message:'Brand Not Found In This Category',cause:404});
    }
    // 6 - subCategory check
    if (brand.subCategoryId.toString() !== subCategoryId) {
        return next({message:'Brand Not Found In This SubCategory',cause:404});
    }

    // 7 - who will be authorized to add a product
    if (brand.addedBy.toString() !== addedBy.toString()) {
        return next({message:'You Are Not Authorized To Add a Product To This Brand',cause:401});
    }
    // 8 - generate the slug of product title
    const slug = slugify(title, { lower: true, replacement: '-' });
    // 9 - applied price calculations
    const appliedPrice = basePrice - (basePrice * (discount || 0) / 100);
    // 10 - images
    if (!req.files?.length) {
        return next({message:'Please Upload Product Images',cause:400});
    }

    // 11 - prepare the imgaes folder in the host
    const imgs = [];
    const folderId = generateUniqueString(7);
    const folderPath = brand.img.public_id.split(`${brand.folderId}/`)[0];
    console.log(folderPath);
    
    // 12 - uploading each image of the product to the host
    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path, {
            folder: folderPath + `${brand.folderId}/Products/${folderId}`
        })
        imgs.push({ secure_url, public_id });
    }
    // 13 - save the product images folder for rollback in case of any errors 
    req.folder = folderPath + `${brand.folderId}/Products/${folderId}`;

    // 14 - make the product object
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
    // 15 - create the product
    const newProduct = await Product.create(product);
    // 16 - save the product document for rollback in case of errors
    req.savedDocuments = { model: Product, _id: newProduct._id };
    // 17 - return response
    res.status(201).json({
        success: true,
        message: 'product created successfully',
        data: newProduct
    })
}

// ==================== update product ====================== // 
/*
    // 1 - destructing the new data of the product from the body
    // 2 - destructing the product id from params
    // 3 - destructing the user id from authUser
    // 4 - check if the product is in the database
    // 5 - who will be authorized to add a product
    // 6 - if the user want to change the title 
        // 6.1 - check if the new title is same as the old one
        // 6.2 - update the title
        // 6.3 - update the slug
    // 7 - check if the user want to change the description 
    // 8 - check if the user want to change the product's specification 
    // 9 - check if the user want to change the stock 
    // 10 - prices changes
        // 10.1 - update the applied price 
        // 10.2 - update the base price
        // 10.3 - update the discount
    // 11 - check if the user want to update any image 
        // 11.1 - check if the user upload the new image or not
        // 11.2 - creating the folder path of the product
        // 11.3 - creating the new public_id
        // 11.4 upload the new image
        // 11.5 looping at the product's images to find the required image and update it's secure url
        // 11.6 - save the folder for rollbacks in case of errors
    // 12 - save the updated product
    // 13 - return the response 
*/
export const updateProduct = async (req, res, next) => {
    // 1 - destructing the new data of the product from the body
    const { title, description, basePrice, discount, stock, specifications, oldPublicId } = req.body;
    // 2 - destructing the product id from params
    const { productId } = req.params;
    // 3 - destructing the user id from authUser
    const addedBy = req.authUser._id;
    // 4 - check if the product is in the database
    const product = await Product.findById(productId);
    if (!product) {
        return next({message:'Product Not Found',cause:404});
    }
    // 5 - who will be authorized to add a product
    if (product.addedBy.toString() !== addedBy.toString()) {
        return next({message:'You Are Not Authorized To Update This Product',cause:403});
    }
    // 6 - if the user want to change the title 
    if (title) {
        // 6.1 - check if the new title is same as the old one
        if(title === product.title){
            return next({message:'Enter a Different Title From The Existing One',cause:400});
        }
        // 6.2 - update the title
        product.title = title;
        // 6.3 - update the slug
        product.slug = slugify(title, { lower: true, replacement: '-' });
    }
    // 7 - check if the user want to change the description 
    if (description) product.desc = desc;
    // 8 - check if the user want to change the product's specification 
    if (specifications) product.specs = JSON.parse(specs);
    // 9 - check if the user want to change the stock 
    if (stock) product.stock = stock;

    // 10 - prices changes
        // 10.1 - update the applied price 
    const appliedPrice = (basePrice || product.basePrice) * (1 - ((discount || product.discount) / 100))
    product.appliedPrice = appliedPrice;
        // 10.2 - update the base price
    if (basePrice) product.basePrice = basePrice;
        // 10.3 - update the discount
    if (discount) product.discount = discount;
    // 11 - check if the user want to update any image 
    if (oldPublicId) {
        // 11.1 - check if the user upload the new image or not
        if (!req.file) return next({message: 'Please select new image',cause: 400})
        // 11.2 - creating the folder path of the product
        const folderPath = product.imgs[0].public_id.split(`${product.folderId}/`)[0]
        // 11.3 - creating the new public_id
        const newPublicId = oldPublicId.split(`${product.folderId}/`)[1];
        // 11.4 upload the new image
        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: folderPath + `${product.folderId}`,
            public_id: newPublicId
        })
        // 11.5 looping at the product's images to find the required image and update it's secure url
        product.imgs.map((img) => {
            if (img.public_id === oldPublicId) {
                img.secure_url = secure_url
            }
        })
        // 11.6 - save the folder for rollbacks in case of errors
        req.folder = folderPath + `${product.folderId}`
    }
    // 12 - save the updated product
    await product.save()
    // 13 - return the response 
    res.status(200).json({ success: true, message: 'Product updated successfully', data: product })
}

// =================== get all products ====================== //
/*
    1 - destructing the page and size from req.query
    2 - applying the api features to products
    3 - return the response
*/
export const getAllProducts = async (req, res, next) => {
    // 1 - destructing the page and size from req.query
    const {page ,size,sort,...query} = req.query;
    // 2 - applying the api features to products
    const features = new ApiFeatures(req.query,Product.find())
    //.pagination({page ,size})
    // .sort(sort)
    // .search(query);
    .filter(query)
    const products = await features.mongooseQuery;
    if(!products) return next({message:'an error occour while fetching the products',cause:500});
    // 3 - return the response
    return res.status(200).json({
        success: true,
        message: 'Products fetched successfully',
        data:products
    })
}