// modules imports
import { Router } from "express";
import asyncHandler from "express-async-handler";
// files imports 
import * as SubCategoryController from './subCategory.controller.js';
import { multerMiddleWareHost } from "../../middlewares/multer.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/Allowed-extensions.js";
import { endPointRoles } from "./subCategory.endPoints.js";

const router = Router();

router.post('/addSubCategory/:categoryId',auth(endPointRoles.ADD_CATEGORY),multerMiddleWareHost({
    extinsions:allowedExtensions.image
}).single('image'),asyncHandler(SubCategoryController.addSubCategory));

router.delete('/deleteSubCategory/:subCategoryId/:categoryId',auth(endPointRoles.ADD_CATEGORY),asyncHandler(SubCategoryController.deleteSubCategory));
router.get('/getAllSubCategoriesWithBrands',asyncHandler(SubCategoryController.getAllSubCategoriesWithBrands));

router.put('/updateSubCategory/:subCategoryId',auth(endPointRoles.ADD_CATEGORY),multerMiddleWareHost({extinsions:allowedExtensions.image}).single('image'),asyncHandler(SubCategoryController.updateSubCategory));

export default router;