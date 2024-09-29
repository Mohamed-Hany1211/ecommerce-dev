


export const checkProductIfExistInCart = async (cart, productId) => {
    return cart.products.some(
        (product) => product.productId.toString() === productId
    )
}