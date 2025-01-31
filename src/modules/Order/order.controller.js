// files imports
import CouponUsers from '../../../DB/models/coupon-users.model.js';
import Order from '../../../DB/models/order.model.js';
import Cart from '../../../DB/models/cart.model.js';
import Product from "../../../DB/models/product.model.js";
import { applyCouponValidations } from '../../utils/coupon.validation.js';
import { checkProductAvailability } from '../Cart/utils/check-product-in-DB.js';
import { getUserCart } from "../Cart/utils/get-user-cart.js";
import { DateTime } from 'luxon';
// ======================== add order ======================== //
/*
    1 - destructing data from body
    2 - destructing the id of the logged in user
    3 - coupon check 
        3.1 - check if the coupon is valid or not
        3.2 - assign the valid coupon to the variable "coupon" we declared
    4 - check if the product is available or not 
    5 - declaring the array that holds the order items
    6 - calculate the prices
    6.1 - check if the coupon amount is greater than the shipping price or not , note that here the coupon amount is fixed not percentage
    7 - order status & payment methods
    8 - create order
    9 - save the order to the database after the change is applied
    10 - decrease the stock of the product in the database after the order is placed
    11 - in case of using any coupon the usage count is increased by one to the user who assigned to that coupon 
    12 - return the response
*/
export const createOrder = async (req, res, next) => {
    // 1 - destructing data from body
    const {
        productId,
        quantity,
        couponCode,
        paymentMethod,
        phoneNumbers,
        address,
        city,
        postalCode,
        country
    } = req.body;
    // 2 - destructing the id of the logged in user
    const { _id: user } = req.authUser;
    // 3 - coupon check 
    let coupon = null;
    if (couponCode) {
        // 3.1 - check if the coupon is valid or not
        const isCouponValid = await applyCouponValidations(couponCode, user);
        if (isCouponValid.status) return next({ message: isCouponValid.message, cause: isCouponValid.status });
        // 3.2 - assign the valid coupon to the variable "coupon" we declared
        coupon = isCouponValid;
    }
    // 4 - check if the product is available or not 
    const isProductAvailable = await checkProductAvailability(productId, quantity);
    if (!isProductAvailable) return next({ message: 'the product is not available', cause: 400 });
    // 5 - declaring the array that holds the order items
    let orderItems = [{
        title: isProductAvailable.title,
        quantity,
        price: isProductAvailable.appliedPrice,
        product: productId,
    }]

    // 6 - calculate the prices
    let shippingPrice = orderItems[0].price * quantity;
    let totalPrice = shippingPrice;
    // 6.1 - check if the coupon amount is greater than the shipping price or not , note that here the coupon amount is fixed not percentage
    if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice)) return next({ message: 'coupon is invalid', cause: 400 });
    if (coupon?.isFixed) {
        totalPrice = shippingPrice - coupon.couponAmount;
    } else if (coupon?.isPercentage) {
        totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount / 100);
    }

    // 7 - order status & payment methods
    let orderStatus;
    if (paymentMethod === 'Cash') orderStatus = 'Placed';

    // 8 - create order
    const order = new Order({
        user,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        totalPrice,
        orderStatus,
        paymentMethod,
        coupon: coupon?._id
    });
    // 9 - save the order to the database after the change is applied
    await order.save();
    // 10 - decrease the stock of the product in the database after the order is placed
    isProductAvailable.stock -= quantity;
    await isProductAvailable.save();
    // 11 - in case of using any coupon the usage count is increased by one to the user who assigned to that coupon 
    if (coupon) {
        await CouponUsers.updateOne({ couponId: coupon._id, userId: user }, { $inc: { usageCount: 1 } })
    }
    // 12 - return the response
    res.status(201).json({
        success: true,
        message: 'order created successfully',
        data: order
    });

}





// ========================= convert from cart to order =========================== //
/*
    1 - destructing data from body
    2 - destructing the id of the logged in user
    3 - get user cart
    4 - coupon check 
        4.1 - check if the coupon is valid or not
        4.2 - assign the valid coupon to the variable "coupon" we declared
    5 - declaring the array that holds the order items
    6 - calculate the prices
    6.1 - check if the coupon amount is greater than the shipping price or not , note that here the coupon amount is fixed not percentage
    7 - order status & payment methods
    8 - create order
    9 - save the order to the database after the change is applied
    10 - delete the cart after the order is done
    11 - decrease the stock of the product in the database after the order is placed
    12 - in case of using any coupon the usage count is increased by one to the user who assigned to that coupon 
    13 - return the response
*/
export const convertFromCartToOrder = async (req, res, next) => {
    // 1 - destructing data from body
    const {
        couponCode,
        paymentMethod,
        phoneNumbers,
        address,
        city,
        postalCode,
        country
    } = req.body;
    // 2 - destructing the id of the logged in user
    const { _id: user } = req.authUser;

    // 3 - get user cart
    const userCart = await getUserCart(user);
    if (!userCart) return next({ message: 'user cart not found', cause: 404 })

    // 4 - coupon check 
    let coupon = null;
    if (couponCode) {
        // 4.1 - check if the coupon is valid or not
        const isCouponValid = await applyCouponValidations(couponCode, user);
        if (isCouponValid.status) return next({ message: isCouponValid.message, cause: isCouponValid.status });
        // 4.2 - assign the valid coupon to the variable "coupon" we declared
        coupon = isCouponValid;
    }

    // 5 - declaring the array that holds the order items
    let orderItems = userCart.products.map(cartItem => {
        return {
            title: cartItem.title,
            quantity: cartItem.quantity,
            price: cartItem.basePrice,
            product: cartItem.productId,
        }
    })

    // 6 - calculate the prices
    let shippingPrice = userCart.subTotal;
    let totalPrice = shippingPrice;
    // 6.1 - check if the coupon amount is greater than the shipping price or not , note that here the coupon amount is fixed not percentage
    if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice)) return next({ message: 'coupon is invalid', cause: 400 });
    if (coupon?.isFixed) {
        totalPrice = shippingPrice - coupon.couponAmount;
    } else if (coupon?.isPercentage) {
        totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount / 100);
    }

    // 7 - order status & payment methods
    let orderStatus;
    if (paymentMethod === 'Cash') orderStatus = 'Placed';

    // 8 - create order
    const order = new Order({
        user,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        totalPrice,
        orderStatus,
        paymentMethod,
        coupon: coupon?._id
    });
    // 9 - save the order to the database after the change is applied
    await order.save();

    // 10 - delete the cart after the order is done
    await Cart.findByIdAndDelete(userCart._id);
    // 11 - decrease the stock of the product in the database after the order is placed
    for (const item of order.orderItems) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
    }
    // 12 - in case of using any coupon the usage count is increased by one to the user who assigned to that coupon 
    if (coupon) {
        await CouponUsers.updateOne({ couponId: coupon._id, userId: user }, { $inc: { usageCount: 1 } })
    }
    // 13 - return the response
    res.status(201).json({
        success: true,
        message: 'order created successfully',
        data: order
    });

}

// =============================== deliver order  ============================ // 
/*
    1 - destructing order id
    2 - update the order status after meeting the specified conditions
    3 - check if the order updated or not
    4 - return the response
*/
export const deliverOrder = async (req,res,next) => {
    // 1 - destructing order id
    const {orderId} = req.params;
    // 2 - update the order status after meeting the specified conditions
    const updatedOrder = await Order.findOneAndUpdate({
        _id: orderId,
        orderStatus: {$in:['Paid','Placed']}
    },{
        orderStatus: 'Delivered',
        isDelivered:true,
        deliveredAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        deliveredBy: req.authUser._id
    },{
        new: true
    });
    // 3 - check if the order updated or not
    if(!updatedOrder) return next({message:'order cannot be delivered',cause:404});
    // 4 - return the response
    res.status(200).json({
        success: true,
        message: 'order delivered successfully',
        data: updatedOrder
    })
}