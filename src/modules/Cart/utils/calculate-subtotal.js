


export const calculateSubTotal = (cart) => {
    let subTotal = 0;
    for (const product of cart.products) {
        subTotal += product.finalPrice;
    }
    return subTotal;
}