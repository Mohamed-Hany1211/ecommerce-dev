// modules imports
import { Router } from "express";
import asyncHandler from "express-async-handler";

// files imports
import * as userController from './user.controller.js';
import { endPointRoles } from "./User.endPoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
const router = Router();



router.put('/updateUser',auth(endPointRoles.USER),asyncHandler(userController.updateUser));
router.delete('/deleteUserProfile',auth(endPointRoles.USER),asyncHandler(userController.deleteUserProfile));
router.get('/getUserProfile',auth(endPointRoles.USER),asyncHandler(userController.getUserProfile));




export default router;