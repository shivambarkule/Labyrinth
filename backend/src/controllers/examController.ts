import { Response } from 'express';
import Exam from '../models/Exam';
import Class from '../models/Class';
import { AuthRequest } from '../types';

// @desc    Get all exams for a class
// @route   GET /api/classes/:classId/exams
// @access  Private/Admin
export const getExams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify class exists and admin has access
    const classDoc = await Class.findById(req.params.classId).populate('sessionId');
    
    if (!classDoc) {
      res.status(404).json({ success: false, error: 'Class not found' });
      return;
    }

    const session = classDoc.sessionId as any;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    const exams = await Exam.find({ classId: req.params.classId })
      .sort('-createdAt');

    res.json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private/Admin
export const getExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'classId',
        populate: {
          path: 'sessionId'
        }
      });

    if (!exam) {
      res.status(404).json({ success: false, error: 'Exam not found' });
      return;
    }

    // Verify admin has access
    const classDoc = exam.classId as any;
    const session = classDoc.sessionId;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    res.json({
      success: true,
      data: exam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new exam
// @route   POST /api/classes/:classId/exams
// @access  Private/Admin
export const createExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, duration, totalMarks, passingMarks, startTime, endTime } = req.body;

    // Verify class exists and admin has access
    const classDoc = await Class.findById(req.params.classId).populate('sessionId');
    
    if (!classDoc) {
      res.status(404).json({ success: false, error: 'Class not found' });
      return;
    }

    const session = classDoc.sessionId as any;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    const exam = await Exam.create({
      title,
      description,
      classId: req.params.classId,
      duration,
      totalMarks,
      passingMarks,
      startTime,
      endTime,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: exam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin
export const updateExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let exam = await Exam.findById(req.params.id)
      .populate({
        path: 'classId',
        populate: {
          path: 'sessionId'
        }
      });

    if (!exam) {
      res.status(404).json({ success: false, error: 'Exam not found' });
      return;
    }

    // Verify admin has access
    const classDoc = exam.classId as any;
    const session = classDoc.sessionId;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: exam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
export const deleteExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'classId',
        populate: {
          path: 'sessionId'
        }
      });

    if (!exam) {
      res.status(404).json({ success: false, error: 'Exam not found' });
      return;
    }

    // Verify admin has access
    const classDoc = exam.classId as any;
    const session = classDoc.sessionId;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    await exam.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 