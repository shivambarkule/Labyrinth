import { Router } from 'express';
import {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(protect as any);
router.use(authorize('admin') as any);

// Routes for classes within a session
router.route('/sessions/:sessionId/classes')
  .get(getClasses as any)
  .post(createClass as any);

// Routes for individual class operations
router.route('/classes/:id')
  .get(getClass as any)
  .put(updateClass as any)
  .delete(deleteClass as any);

export default router; 