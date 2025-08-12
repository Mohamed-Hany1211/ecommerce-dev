// modules imports
import { Router } from "express";
import asyncHandler from "express-async-handler";
// files imports 
import * as CategoryController from './Category.controller.js';
import { multerMiddleWareHost } from "../../middlewares/multer.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/Allowed-extensions.js";
import { endPointRoles } from "./Category.endPoints.js";
import {validationMiddleware} from '../../middlewares/validation.middleware.js';
const router = Router();

router.post('/addCategory',auth(endPointRoles.ADD_CATEGORY),multerMiddleWareHost({
    extinsions:allowedExtensions.image
}).single('image'),asyncHandler(CategoryController.addCategory));

router.put('/updateCategory/:categoryId',auth(endPointRoles.ADD_CATEGORY),multerMiddleWareHost({
    extinsions:allowedExtensions.image
}).single('image'),asyncHandler(CategoryController.updateCategory));

router.delete('/deleteCategory/:categoryId',auth(endPointRoles.ADD_CATEGORY),asyncHandler(CategoryController.deleteCategory))

router.get('/getAllCategories',asyncHandler(CategoryController.getAllCategories));

export default router;