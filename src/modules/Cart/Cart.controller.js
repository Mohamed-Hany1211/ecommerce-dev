// files imports
import Cart from '../../../DB/models/cart.model.js';
import { checkProductAvailability } from './utils/check-product-in-DB.js';
import { getUserCart } from './utils/get-user-cart.js';
import { addCart } from './utils/add-cart.js';
import { updateProductQuantity } from './utils/update-product-quantity.js';
import {PushProductToCart} from './utils/add-product-to-cart.js';
import { calculateSubTotal } from './utils/calculate-subTotal.js';
// ======================= add to cart ============== //
/*
    // 1 - destructing the productId and quantity from the body
    // 2 - destructing the id of the loggedIn user
    // 3 - check if the product exist and available
    // 4 - check if the loggedIn user has a cart 
        // 4.1 - create a new cart for the loggedIn user
        // 4.2 - rollBack the cart documen if any error accour
        // 4.3 - return the response
    // 5 - if the product exist in the cart then we update the quantity
    // 6 - if the product doesn't exist in the cart then we push it into cart
    // 7 - return the response
*/
export const addProductToCart = async (req, res, next) => {
    // 1 - destructing the productId and quantity from the body
    const { productId, quantity } = req.body;
    // 2 - destructing the id of the loggedIn user
    const { _id } = req.authUser;
    // 3 - check if the product exist and available
    const product = await checkProductAvailability(productId, quantity);
    if (!product) return next({ message: 'Product not found or not available', cause: 404 });
    // 4 - check if the loggedIn user has a cart 
    const userCart = await getUserCart(_id);
    if (!userCart) {
        // 4.1 - create a new cart for the loggedIn user
        const newCart = await addCart(_id, product, quantity);
        // 4.2 - rollBack the cart documen if any error accour
        req.savedDocuments = { model: Cart, _id: newCart._id };
        // 4.3 - return the response
        return res.status(201).json({ message: 'Product added to cart successfully', data: newCart });
    }
    // 5 - if the product exist in the cart then we update the quantity
    const isUpdated = await updateProductQuantity(userCart, productId, quantity);
    // 6 - if the product doesn't exist in the cart then we push it into cart
    if (!isUpdated) {
        const pushedProduct = await PushProductToCart(userCart,product,quantity);
        if(!pushedProduct) return next({message:'product not added to cart',cause:400})
    }
    // 7 - return the response
    return res.status(201).json({
        success: true, 
        message: 'cart products updated successfully',
        data: userCart
    });
}

// ======================= remove from cart =================== //
/*
    // 1 - destructing the productId from the params
    // 2 - destructing the id of the loggedIn user
    // 3 - check if the loggedIn user has a cart
    // 4 - find the product in the cart and remove it
    // 5 - update the subtotal after all changes
    // 6 - save all changes
    // 7 - check if the products array in new cart is empty or not so if it is empty we will delete the cart
    // 8 - return the response
*/
export const removeFromCart = async (req, res, next) => {
    // 1 - destructing the productId from the params
    const { productId } = req.params;
    // 2 - destructing the id of the loggedIn user
    const { _id } = req.authUser;
    // 3 - check if the loggedIn user has a cart
    const userCart = await Cart.findOne({ userId: _id, 'products.productId': productId });
    if (!userCart) return next({ message: 'Cart not found', cause: 404 });
    // 4 - find the product in the cart and remove it
    userCart.products = userCart.products.filter(product => product.productId.toString() !== productId);
    // 5 - update the subtotal after all changes
    userCart.subTotal = calculateSubTotal(userCart);
    // 6 - save all changes
    const newCart = await userCart.save();
    // 7 - check if the products array in new cart is empty or not so if it is empty we will delete the cart
    if (newCart.products.length === 0) {
        await Cart.findByIdAndDelete(newCart._id);
    }
    // 8 - return the response
    return res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully'
    });
}