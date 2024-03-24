// modules imports
import { Router } from "express";
import asyncHandler from "express-async-handler";
// files imports
import * as AuthController from './auth.controller.js'


const router = Router();



router.post('/signUp', asyncHandler(AuthController.signUp));
router.get('/verify-email',asyncHandler(AuthController.verifyEmail));
router.post('/signIn',asyncHandler(AuthController.signIn));




export default router;