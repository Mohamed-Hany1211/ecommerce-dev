// modules imports
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
// files imports
import { auth } from "../../middlewares/auth.middleware.js";
import * as couponController from'./coupon.controller.js';
import {endpointsRoles} from './coupon.endPoints.js';
import {validationMiddleware} from '../../middlewares/validation.middleware.js';
import * as validator from './coupon.validationSchemas.js';
const router = Router();

router.post('/addCoupon',auth(endpointsRoles.ADD_COUPON),validationMiddleware(validator.addCouponSchema),expressAsyncHandler(couponController.addCoupon));





export default router;