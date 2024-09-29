// modules imports
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
// files imports
import * as cartController from './Cart.controller.js';
import {auth} from '../../middlewares/auth.middleware.js';
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.post('/addProductToCart',auth([systemRoles.USER]),expressAsyncHandler(cartController.addProductToCart));

router.put('/removeFromCart/:productId',auth([systemRoles.USER]),expressAsyncHandler(cartController.removeFromCart))





export default router;