"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.updateSession = exports.createSession = exports.getSession = exports.getSessions = void 0;
const Session_1 = __importDefault(require("../models/Session"));
// @desc    Get all sessions for admin
// @route   GET /api/sessions
// @access  Private/Admin
const getSessions = async (req, res) => {
    try {
        const sessions = await Session_1.default.find({ adminId: req.user?._id })
            .sort('-createdAt');
        res.json({
            success: true,
            count: sessions.length,
            data: sessions,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getSessions = getSessions;
// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private/Admin
const getSession = async (req, res) => {
    try {
        const session = await Session_1.default.findOne({
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getSession = getSession;
// @desc    Create new session
// @route   POST /api/sessions
// @access  Private/Admin
const createSession = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;
        const session = await Session_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.createSession = createSession;
// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private/Admin
const updateSession = async (req, res) => {
    try {
        const session = await Session_1.default.findOneAndUpdate({
            _id: req.params.id,
            adminId: req.user?._id,
        }, req.body, {
            new: true,
            runValidators: true,
        });
        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateSession = updateSession;
// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private/Admin
const deleteSession = async (req, res) => {
    try {
        const session = await Session_1.default.findOneAndDelete({
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.deleteSession = deleteSession;
//# sourceMappingURL=sessionController.js.map