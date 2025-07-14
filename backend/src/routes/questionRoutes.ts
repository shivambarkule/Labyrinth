import express from 'express';
import { 
  getQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  uploadPDF,
  processPDF
} from '../controllers/questionController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// PDF upload and processing
router.post('/upload-pdf', uploadPDF, processPDF);

// All routes require authentication and admin role
router.use(protect as any);
router.use(authorize('admin') as any);

// CRUD operations
router.get('/', getQuestions);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router; 