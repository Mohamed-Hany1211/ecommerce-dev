// files imports
import Cart from '../../../../DB/models/cart.model.js';

export const getUserCart = async (userId) =>{
    const userCart = await Cart.findOne({userId});
    return userCart;
}