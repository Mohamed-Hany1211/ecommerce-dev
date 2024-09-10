// modules imports
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
// files imports
import * as productController from './product.controller.js';
import { auth } from "../../middlewares/auth.middleware.js";
import { multerMiddleWareHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/Allowed-extensions.js";
import { endPointsRoles } from "./product.endPoints.js";

const router = Router();


router.post('/addProduct',auth(endPointsRoles.ADD_PRODUCT),multerMiddleWareHost({extinsions:allowedExtensions.image}).array('image',3),expressAsyncHandler(productController.addProduct));

router.put('/:productId',
    auth(endPointsRoles.ADD_PRODUCT),
    multerMiddleWareHost({ extensions: allowedExtensions.image }).single('image'),
    expressAsyncHandler(productController.updateProduct)
);

router.get('/getAllProducts',expressAsyncHandler(productController.getAllProducts));


export default router;