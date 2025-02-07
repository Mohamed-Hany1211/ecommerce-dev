import Stripe from 'stripe';
import Coupon from '../../DB/models/coupon.model.js';
// create a checkout session
export const createCheckoutSession = async ({
    customer_email,
    metadata,
    discounts,
    line_items
}) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentData = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email,
        metadata,
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        discounts,
        line_items
    });
    return paymentData;
}

// create stripe coupon

export const createStripeCoupon = async ({ couponId }) => {
    const findCoupon = await Coupon.findById(couponId);
    if (!findCoupon) return { status: false, message: 'coupon not found', cause: 404 };

    let couponObject = {};

    if (findCoupon.isFixed) {
        couponObject = {
            name: findCoupon.couponCode,
            amount_off: findCoupon.couponAmount * 100,
            currency: 'EGP'
        }
    }

    if (findCoupon.isPercentage) {
        couponObject = {
            name: findCoupon.couponCode,
            percent_off: findCoupon.couponAmount
        }
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const stripeCoupon = await stripe.coupons.create(couponObject);
    return stripeCoupon;
}