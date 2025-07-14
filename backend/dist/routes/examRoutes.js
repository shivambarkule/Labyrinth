"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const examController_1 = require("../controllers/examController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('admin'));
// Routes for exams within a class
router.route('/classes/:classId/exams')
    .get(examController_1.getExams)
    .post(examController_1.createExam);
// Routes for individual exam operations
router.route('/exams/:id')
    .get(examController_1.getExam)
    .put(examController_1.updateExam)
    .delete(examController_1.deleteExam);
exports.default = router;
//# sourceMappingURL=examRoutes.js.map