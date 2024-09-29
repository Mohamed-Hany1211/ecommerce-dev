// files imports
import Cart from '../../../../DB/models/cart.model.js';


export const addCart = async (userId, product, quantity) => {
    // creating the object of the new cart
    const cartObj = {
        userId,
        products: [{
            productId: product._id,
            quantity,
            basePrice: product.appliedPrice,
            title: product.title,
            finalPrice: product.appliedPrice * quantity
        }],
        subTotal: product.appliedPrice * quantity
    }
    // creating new cart 
    const newCart = await Cart.create(cartObj);
    return newCart;
}