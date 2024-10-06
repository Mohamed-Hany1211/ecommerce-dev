// files imports
import Coupon from '../../../DB/models/coupon.model.js';

// ===================== add coupon ==================== //
/**/
export const addCoupon = async (req,res,next)=>{
    // destructing coupon's info
    const {couponCode,couponAmount,isFixed,isPercentage,fromDate,toDate} = req.body;
    // destructing the id of the logged in user 
    const {_id} = req.authUser;
    // coupon code check
    const isCouponCodeExist = await Coupon.findOne({couponCode});
    if(isCouponCodeExist) return next({message:'Coupon code already exist',cause:409});
    if(isFixed==isPercentage) return next({message:'Coupon can be either fixed or percentage',cause:409});
    if(isPercentage){
        if(couponAmount>100) return next({message:'Percentage should be less than or equal to 100',cause:409});
    }
    // creat coupon object
    const couponObj = {
        addedBy:_id,
        couponCode,
        couponAmount,
        isFixed,
        isPercentage,
        fromDate,
        toDate
    }
    // save coupon in db
    const coupon = await Coupon.create(couponObj);
    // return the response
    res.status(201).json({message:'Coupon added successfully', coupon});
}