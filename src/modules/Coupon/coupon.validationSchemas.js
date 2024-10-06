// modules imports
import Joi from "joi"


export const addCouponSchema = {
    body:Joi.object({
        couponCode:Joi.string().required(),
        couponAmount:Joi.number().required().min(1),
        isFixed:Joi.boolean(),
        isPercentage:Joi.boolean(),
        fromDate:Joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate:Joi.date().greater(Joi.ref('fromDate')).required()
    })
}