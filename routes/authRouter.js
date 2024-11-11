// routes/authRouter.js
import express from 'express';
import authController from '../controllers/AuthController.js';

const router = express.Router();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password/:token', authController.resetPassword.bind(authController));
router.post('/change-password/:token', authController.changePassword.bind(authController));

export default router;
