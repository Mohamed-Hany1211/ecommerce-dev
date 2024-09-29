// files imports
import Product from '../../../../DB/models/product.model.js';

export const checkProductAvailability = async (productId,quantity) =>{
    // finding the product by it's id
    const product = await Product.findById(productId);
    // checking if the product exists or the quantity required is available
    if(!product || product.stock < quantity) return null;
    return product; // product is available for purchase
}