// files imports
import { calculateSubTotal } from "./calculate-subTotal.js";





export const PushProductToCart = async (cart, product, quantity) => {
    cart.products.push({
        productId: product._id,
        quantity,
        basePrice: product.appliedPrice,
        title: product.title,
        finalPrice: product.appliedPrice * quantity
    });
    cart.subTotal = calculateSubTotal(cart);
    return await cart.save();
}