import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../core/middlewares/validate.middleware';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validator';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
