"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.updateClass = exports.createClass = exports.getClass = exports.getClasses = void 0;
const Class_1 = __importDefault(require("../models/Class"));
const Session_1 = __importDefault(require("../models/Session"));
// @desc    Get all classes for a session
// @route   GET /api/sessions/:sessionId/classes
// @access  Private/Admin
const getClasses = async (req, res) => {
    try {
        // Verify session belongs to admin
        const session = await Session_1.default.findOne({
            _id: req.params.sessionId,
            adminId: req.user?._id,
        });
        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }
        const classes = await Class_1.default.find({ sessionId: req.params.sessionId })
            .sort('-createdAt');
        res.json({
            success: true,
            count: classes.length,
            data: classes,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getClasses = getClasses;
// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private/Admin
const getClass = async (req, res) => {
    try {
        const classDoc = await Class_1.default.findById(req.params.id).populate('sessionId');
        if (!classDoc) {
            res.status(404).json({ success: false, error: 'Class not found' });
            return;
        }
        // Verify the session belongs to the admin
        const session = classDoc.sessionId;
        if (session.adminId.toString() !== req.user?._id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }
        res.json({
            success: true,
            data: classDoc,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getClass = getClass;
// @desc    Create new class
// @route   POST /api/sessions/:sessionId/classes
// @access  Private/Admin
const createClass = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Verify session belongs to admin
        const session = await Session_1.default.findOne({
            _id: req.params.sessionId,
            adminId: req.user?._id,
        });
        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }
        const classDoc = await Class_1.default.create({
            name,
            description,
            sessionId: req.params.sessionId,
        });
        res.status(201).json({
            success: true,
            data: classDoc,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.createClass = createClass;
// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
    try {
        let classDoc = await Class_1.default.findById(req.params.id).populate('sessionId');
        if (!classDoc) {
            res.status(404).json({ success: false, error: 'Class not found' });
            return;
        }
        // Verify the session belongs to the admin
        const session = classDoc.sessionId;
        if (session.adminId.toString() !== req.user?._id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }
        classDoc = await Class_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.json({
            success: true,
            data: classDoc,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateClass = updateClass;
// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
    try {
        const classDoc = await Class_1.default.findById(req.params.id).populate('sessionId');
        if (!classDoc) {
            res.status(404).json({ success: false, error: 'Class not found' });
            return;
        }
        // Verify the session belongs to the admin
        const session = classDoc.sessionId;
        if (session.adminId.toString() !== req.user?._id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }
        await classDoc.deleteOne();
        res.json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.deleteClass = deleteClass;
//# sourceMappingURL=classController.js.map