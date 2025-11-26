// base router barrel file

import { Router } from 'express';
import authRoutes from './auth_routes';
import contentRoutes from './content_routes';

const router: Router = Router();

// base route : authentication
router.use('/auth', authRoutes);

// base route : content (protected)
router.use('/content', contentRoutes);

export default router;
