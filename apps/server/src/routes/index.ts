// base router barrel file

import { Router } from 'express';
import authRoutes from './auth_routes';

const router: Router = Router();

// base route : authentication
router.use('/auth', authRoutes);

export default router;
