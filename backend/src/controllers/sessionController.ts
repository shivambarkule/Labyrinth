import { Response } from 'express';
import Session from '../models/Session';
import { AuthRequest } from '../types';

// @desc    Get all sessions for admin
// @route   GET /api/sessions
// @access  Private/Admin
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find({ adminId: req.user?._id })
      .sort('-createdAt');

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private/Admin
export const getSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      adminId: req.user?._id,
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private/Admin
export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const session = await Session.create({
      name,
      description,
      adminId: req.user?._id,
      startDate,
      endDate,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private/Admin
export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.id,
        adminId: req.user?._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private/Admin
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      adminId: req.user?._id,
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 