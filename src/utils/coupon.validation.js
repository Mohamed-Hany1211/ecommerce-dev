// modules imports
import { DateTime } from 'luxon';
// files imports
import CouponUser from '../../DB/models/coupon-users.model.js';
import Coupon from '../../DB/models/coupon.model.js';

export const applyCouponValidations = async(couponCode,_id) =>{
    // coupon code check
    const coupon = await Coupon.findOne({couponCode});
    if(!coupon) return {message:'couponCode is invalid',status:400};
    // coupon status check
    if(coupon.couponStatus == 'expired' || DateTime.fromISO(coupon.toDate) < DateTime.now()) return {message:'this coupon is expired',status:400};

    // start date check
    if(DateTime.now()<DateTime.fromISO(coupon.fromDate)) return {message:'this coupon is not started yet',status:400};

    // user cases
    const isUserAssigned = await CouponUser.findOne({couponId:coupon._id,userId:_id});
    if(!isUserAssigned) return {message:'this coupon is not assigned to you',status:400};

    // maxUsage check
    if(isUserAssigned.maxUsage <= isUserAssigned.usageCount) return {message:'you have reached the usage limit for this coupon',status:400};

    return coupon;
}