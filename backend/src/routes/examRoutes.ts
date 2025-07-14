import { Router } from 'express';
import {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} from '../controllers/examController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(protect as any);
router.use(authorize('admin') as any);

// Routes for exams within a class
router.route('/classes/:classId/exams')
  .get(getExams as any)
  .post(createExam as any);

// Routes for individual exam operations
router.route('/exams/:id')
  .get(getExam as any)
  .put(updateExam as any)
  .delete(deleteExam as any);

export default router; 