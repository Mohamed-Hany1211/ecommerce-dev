// files imports
import { calculateSubTotal } from './calculate-subTotal.js';
import { checkProductIfExistInCart } from './check-product-in-cart.js';
export const updateProductQuantity = async (cart, productId, quantity) => {
    const isProductExistInCart = await checkProductIfExistInCart(cart, productId);
    if (!isProductExistInCart) return null;

    // update the product quantity
    cart?.products.forEach(product => {
        if (product.productId.toString() === productId) {
            product.quantity = quantity;
            product.finalPrice = product.basePrice * quantity;
        }
    })
    // subTotal
    cart.subTotal = calculateSubTotal(cart);
    return await cart.save();
}