// files imports
import Coupon from '../../../DB/models/coupon.model.js';
import CouponUsers from '../../../DB/models/coupon-users.model.js';
import User from '../../../DB/models/user.model.js';
// ===================== add coupon ==================== //
/**/
export const addCoupon = async (req,res,next)=>{
    // destructing coupon's info
    const {
        couponCode,
        couponAmount,
        isFixed,
        isPercentage,
        fromDate,
        toDate,
        Users // [{userId,maxUsage}]
    } = req.body;
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
    // roll back the coupon document in case of any error occur
    req.savedDocuments = { model: Coupon, _id: coupon._id };
    // check if the user that we want to assign the coupon to is in the DB or not 
    const userIds = [];
    for(const user of Users){
        userIds.push(user.userId);
    }
    const isUserExist = await User.find({_id:{$in:userIds}});
    if(isUserExist.length!=Users.length) return next({message:'Users not found',cause:404});
    // assign coupons to users
    const couponUsers = await CouponUsers.create(
        Users.map(ele=>({couponId:coupon._id,...ele}))
    )
    // roll back the coupon users document in case of any error occur
    req.savedDocuments = { model: CouponUsers, _id: couponUsers._id };
    // return the response
    res.status(201).json({message:'Coupon added successfully', coupon , couponUsers});
}