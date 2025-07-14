import { Response } from 'express';
import Class from '../models/Class';
import Session from '../models/Session';
import { AuthRequest } from '../types';

// @desc    Get all classes for a session
// @route   GET /api/sessions/:sessionId/classes
// @access  Private/Admin
export const getClasses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify session belongs to admin
    const session = await Session.findOne({
      _id: req.params.sessionId,
      adminId: req.user?._id,
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    const classes = await Class.find({ sessionId: req.params.sessionId })
      .sort('-createdAt');

    res.json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private/Admin
export const getClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classDoc = await Class.findById(req.params.id).populate('sessionId');

    if (!classDoc) {
      res.status(404).json({ success: false, error: 'Class not found' });
      return;
    }

    // Verify the session belongs to the admin
    const session = classDoc.sessionId as any;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    res.json({
      success: true,
      data: classDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new class
// @route   POST /api/sessions/:sessionId/classes
// @access  Private/Admin
export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Verify session belongs to admin
    const session = await Session.findOne({
      _id: req.params.sessionId,
      adminId: req.user?._id,
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    const classDoc = await Class.create({
      name,
      description,
      sessionId: req.params.sessionId,
    });

    res.status(201).json({
      success: true,
      data: classDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
export const updateClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let classDoc = await Class.findById(req.params.id).populate('sessionId');

    if (!classDoc) {
      res.status(404).json({ success: false, error: 'Class not found' });
      return;
    }

    // Verify the session belongs to the admin
    const session = classDoc.sessionId as any;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    classDoc = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: classDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
export const deleteClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classDoc = await Class.findById(req.params.id).populate('sessionId');

    if (!classDoc) {
      res.status(404).json({ success: false, error: 'Class not found' });
      return;
    }

    // Verify the session belongs to the admin
    const session = classDoc.sessionId as any;
    if (session.adminId.toString() !== req.user?._id) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }

    await classDoc.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 