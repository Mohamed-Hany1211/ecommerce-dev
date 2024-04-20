// modules imports
import { Router } from "express";
import asyncHandler from "express-async-handler";
// files imports 
import * as BrandController from './Brand.controller.js'
import { multerMiddleWareHost } from "../../middlewares/multer.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/Allowed-extensions.js";
import { endPointRoles } from "./Brand.endPoints.js";

const router = Router();

router.post('/addBrand',auth(endPointRoles.ADD_BRAND),multerMiddleWareHost({
    extinsions:allowedExtensions.image
}).single('image'),asyncHandler(BrandController.addBrand));
router.delete('/deleteBrand/:brandId',auth(endPointRoles.ADD_BRAND),asyncHandler(BrandController.deleteBrand));
router.get('/getAllBrands',asyncHandler(BrandController.getAllBrands));
router.put('/updateBrand',auth(endPointRoles.ADD_BRAND),multerMiddleWareHost({
    extinsions:allowedExtensions.image
}).single('image'),asyncHandler(BrandController.updateBrand));
export default router;