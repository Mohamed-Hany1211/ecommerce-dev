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


// create payment method
export const createStripePaymentMethod = async ({token})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            token
        }
    });
    return paymentMethod;
}

// create a stripe payment intent
export const createPaymentIntent = async ({ amount, currency }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentMethod = await createStripePaymentMethod({token:'tok_visa'});
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        automatic_payment_methods:{
            enabled: true,
            allow_redirects:'never'
        },
        payment_method: paymentMethod.id
    });
    return paymentIntent;
}

// retrive stripe paymentIntent
export const retrivePaymentIntent = async ({paymentIntentId})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
}


// confirm stripe paymentIntent
export const confirmPaymentIntent = async ({paymentIntentId}) =>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntentDetails = await retrivePaymentIntent({paymentIntentId});
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId,{
        payment_method: paymentIntentDetails.payment_method
    });
    return paymentIntent;
}

// refund a stripe payment intent
export const refundPaymentIntent = async ({paymentIntentId})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
    });
    return refund;
}