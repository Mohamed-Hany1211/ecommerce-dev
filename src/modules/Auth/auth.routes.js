// modules imports
import { Router } from "express";
import asyncHandler from "express-async-handler";
// files imports
import * as AuthController from './auth.controller.js'
import * as AuthValidationSchemas from './auth.validationSchemas.js';
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

const router = Router();



router.post('/signUp', validationMiddleware(AuthValidationSchemas.signUpSchema), asyncHandler(AuthController.signUp));
router.get('/verify-email', validationMiddleware(AuthValidationSchemas.verifyEmailSchema), asyncHandler(AuthController.verifyEmail));
router.post('/signIn', validationMiddleware(AuthValidationSchemas.signInSchema), asyncHandler(AuthController.signIn));




export default router;