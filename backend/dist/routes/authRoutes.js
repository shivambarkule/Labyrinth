"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Regular authentication routes
router.post('/register', validation_1.validateRegister, authController_1.register);
router.post('/login', validation_1.validateLogin, authController_1.login);
router.get('/me', auth_1.protect, authController_1.getMe);
// Google OAuth routes
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), authController_1.googleCallback);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map