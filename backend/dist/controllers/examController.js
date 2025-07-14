"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExam = exports.updateExam = exports.createExam = exports.getExam = exports.getExams = void 0;
const Exam_1 = __importDefault(require("../models/Exam"));
const Class_1 = __importDefault(require("../models/Class"));
// @desc    Get all exams for a class
// @route   GET /api/classes/:classId/exams
// @access  Private/Admin
const getExams = async (req, res) => {
    try {
        // Verify class exists and admin has access
        const classDoc = await Class_1.default.findById(req.params.classId).populate('sessionId');
        if (!classDoc) {
            res.status(404).json({ success: false, error: 'Class not found' });
            return;
        }
        const session = classDoc.sessionId;
        if (session.adminId.toString() !== req.user?._id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }
        const exams = await Exam_1.default.find({ classId: req.params.classId })
            .sort('-createdAt');
        res.json({
            success: true,
            count: exams.length,
            data: exams,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getExams = getExams;
// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private/Admin
const getExam = async (req, res) => {
    try {
        const exam = await Exam_1.default.findById(req.params.id)
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
        const classDoc = exam.classId;
        const session = classDoc.sessionId;
        if (session.adminId.toString() !== req.user?._id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }
        res.json({
            success: true,
            data: exam,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getExam = getExam;
// @desc    Create new exam
// @route   POST /api/classes/:classId/exams
// @access  Private/Admin
const createExam = async (req, res) => {
    try {
        const { title, description, duration, totalMarks, passingMarks, startTime, endTime } = req.body;
        // Verify class exists and admin has access
        const classDoc = await Class_1.default.findById(req.params.classId).populate('sessionId');
        if (!classDoc) {
            res.status(404).json({ success: false, error: 'Class not found' });
            return;
        }
        const session = classDoc.sessionId;
        if (session.adminId.toString() !== req.user?._id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }
        const exam = await Exam_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.createExam = createExam;
// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin
const updateExam = async (req, res) => {
    try {
        let exam = await Exam_1.default.findById(req.params.id)
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
        const classDoc = exam.classId;
        const session = classDoc.sessionId;
        if (session.adminId.toString() !== req.user?._id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }
        exam = await Exam_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.json({
            success: true,
            data: exam,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateExam = updateExam;
// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam_1.default.findById(req.params.id)
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
        const classDoc = exam.classId;
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.deleteExam = deleteExam;
//# sourceMappingURL=examController.js.map