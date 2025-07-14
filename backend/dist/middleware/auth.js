"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        let token;
        // Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Make sure token exists
        if (!token) {
            res.status(401).json({ success: false, error: 'Not authorized to access this route' });
            return;
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            // Get user from token
            const user = await User_1.default.findById(decoded.userId).select('-password');
            if (!user) {
                res.status(401).json({ success: false, error: 'User not found' });
                return;
            }
            // Convert to plain object and add _id as string
            const userObject = user.toObject();
            req.user = {
                ...userObject,
                _id: userObject._id.toString()
            };
            next();
        }
        catch (err) {
            res.status(401).json({ success: false, error: 'Invalid token' });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        return;
    }
};
exports.protect = protect;
// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `User role '${req.user.role}' is not authorized to access this route`
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map