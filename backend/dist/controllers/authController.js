"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
// Generate JWT token
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { email, password, name } = req.body;
        // Check if user exists
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ success: false, error: 'User already exists' });
            return;
        }
        // Create user
        const user = await User_1.default.create({
            email,
            password,
            name,
            role: 'admin',
        });
        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        // Check for user
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.login = login;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
        user,
    });
};
exports.getMe = getMe;
// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3007'}/login?error=auth_failed`);
            return;
        }
        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3007'}/auth/callback?token=${token}`);
    }
    catch (error) {
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3007'}/login?error=auth_failed`);
    }
};
exports.googleCallback = googleCallback;
//# sourceMappingURL=authController.js.map