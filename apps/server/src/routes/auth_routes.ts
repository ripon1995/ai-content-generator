import { Router } from 'express';
import { authController } from '../controllers/auth_controller';
import { registerValidation, loginValidation, validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/error_handler';

const router: Router = Router();

// public route : /register => to register new user
router.post(
  '/register',
  registerValidation,
  validate,
  asyncHandler((req, res) => authController.register(req, res))
);

// public route : /login => to login existing user
router.post(
  '/login',
  loginValidation,
  validate,
  asyncHandler((req, res) => authController.login(req, res))
);

export default router;
