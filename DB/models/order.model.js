// modules imports
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems: [{
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    phoneNumbers: [{ type: String, required: true }],
    shippingPrice: { type: Number, required: true }, // products array subtotal
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    totalPrice: { type: Number, required: true }, // shipping price - coupon if exist
    paymentMethod: { type: String, enum: ['Cash', 'Stripe', 'Paymob'], required: true },
    orderStatus: { type: String, enum: ['Pending', 'Paid', 'Delivered', 'Placed', 'Cancelled', 'Refunded'], required: true, default: 'Pending' },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: String },
    deliveredAt: { type: String },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    CancelledAt: { type: String },
    CancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    payment_intent: String
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);