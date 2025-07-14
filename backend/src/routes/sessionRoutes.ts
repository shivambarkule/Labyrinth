import { Router } from 'express';
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} from '../controllers/sessionController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(protect as any);
router.use(authorize('admin') as any);

router.route('/')
  .get(getSessions as any)
  .post(createSession as any);

router.route('/:id')
  .get(getSession as any)
  .put(updateSession as any)
  .delete(deleteSession as any);

export default router; 