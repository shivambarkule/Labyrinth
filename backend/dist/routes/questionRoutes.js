"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionController_1 = require("../controllers/questionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// PDF upload and processing
router.post('/upload-pdf', questionController_1.uploadPDF, questionController_1.processPDF);
// All routes require authentication and admin role
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('admin'));
// CRUD operations
router.get('/', questionController_1.getQuestions);
router.post('/', questionController_1.createQuestion);
router.put('/:id', questionController_1.updateQuestion);
router.delete('/:id', questionController_1.deleteQuestion);
exports.default = router;
//# sourceMappingURL=questionRoutes.js.map