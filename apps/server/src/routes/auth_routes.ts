import { Router } from 'express';
import { Request, Response } from 'express';
import { authController } from '../controllers/auth_controller';
import { registerValidation, validate } from '../middleware/validation';

const router: Router = Router();

// public route : /register => to register new user
router.post(
  '/register',
  registerValidation,
  validate,
  (req: Request, res: Response) => authController.register(req, res)
);

export default router;
