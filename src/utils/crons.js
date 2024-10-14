// modules imports
import { scheduleJob } from "node-schedule";
import { DateTime } from "luxon";
// files imports
import Coupon from '../../DB/models/coupon.model.js';

export const cronToChangeExpiredCoupons = () => {
    // schedule a job that runs every 5 seconds
    scheduleJob("*/10 * * * * *", async () => {
        console.log('cron run');
        
        const coupons = await Coupon.find({ couponStatus: 'valid' });
        for (const coupon of coupons) {
            if (new DateTime(coupon.toDate) <  DateTime.now()) {
                coupon.couponStatus = 'expired';
            }
            await coupon.save();
        }
        
    });
}
