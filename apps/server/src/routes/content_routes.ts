import { Router } from 'express';
import { contentController } from '../controllers/content_controller';
import { createContentValidation, updateContentValidation, validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/error_handler';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// apply authentication middleware to all content routes
router.use(authenticate);

// protected route : POST /content => create new content
router.post(
  '/',
  createContentValidation,
  validate,
  asyncHandler((req, res) => contentController.createContent(req, res))
);

// protected route : GET /content => get all content for authenticated user
router.get(
  '/',
  asyncHandler((req, res) => contentController.getUserContent(req, res))
);

// protected route : GET /content/:id => get specific content by ID
router.get(
  '/:id',
  asyncHandler((req, res) => contentController.getContentById(req, res))
);

// protected route : PUT /content/:id => update specific content
router.put(
  '/:id',
  updateContentValidation,
  validate,
  asyncHandler((req, res) => contentController.updateContent(req, res))
);

// protected route : DELETE /content/:id => delete specific content (soft delete)
router.delete(
  '/:id',
  asyncHandler((req, res) => contentController.deleteContent(req, res))
);

export default router;
