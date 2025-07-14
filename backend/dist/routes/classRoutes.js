"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classController_1 = require("../controllers/classController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('admin'));
// Routes for classes within a session
router.route('/sessions/:sessionId/classes')
    .get(classController_1.getClasses)
    .post(classController_1.createClass);
// Routes for individual class operations
router.route('/classes/:id')
    .get(classController_1.getClass)
    .put(classController_1.updateClass)
    .delete(classController_1.deleteClass);
exports.default = router;
//# sourceMappingURL=classRoutes.js.map