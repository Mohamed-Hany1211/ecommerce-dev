// modules imports
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
// files imports
import * as orderController from './order.controller.js';
import {auth} from '../../middlewares/auth.middleware.js';
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.post('/createOrder',auth(systemRoles.USER),expressAsyncHandler(orderController.createOrder));

router.post('/convertFromCartToOrder',auth(systemRoles.USER),expressAsyncHandler(orderController.convertFromCartToOrder));

router.put('/deliverOrder/:orderId',auth(systemRoles.DELIEVERY_ROLE),expressAsyncHandler(orderController.deliverOrder));






export default router;
