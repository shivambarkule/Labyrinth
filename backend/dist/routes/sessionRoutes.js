"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('admin'));
router.route('/')
    .get(sessionController_1.getSessions)
    .post(sessionController_1.createSession);
router.route('/:id')
    .get(sessionController_1.getSession)
    .put(sessionController_1.updateSession)
    .delete(sessionController_1.deleteSession);
exports.default = router;
//# sourceMappingURL=sessionRoutes.js.map