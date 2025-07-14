"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const questionSchema = new mongoose_1.Schema({
    examId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    questionText: {
        type: String,
        required: true,
    },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
        required: true,
    },
    marks: {
        type: Number,
        required: true,
        min: 0,
    },
    options: {
        type: [String],
        default: undefined,
    },
    correctAnswer: {
        type: mongoose_1.Schema.Types.Mixed,
        default: undefined,
    },
    order: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});
// Add validation based on question type
questionSchema.pre('save', function (next) {
    if (this.questionType === 'multiple-choice') {
        if (!this.options || this.options.length < 2) {
            return next(new Error('Multiple choice questions must have at least 2 options'));
        }
        if (!this.correctAnswer) {
            return next(new Error('Multiple choice questions must have a correct answer'));
        }
    }
    if (this.questionType === 'true-false') {
        if (!this.correctAnswer) {
            return next(new Error('True/false questions must have a correct answer'));
        }
        if (this.correctAnswer !== 'true' && this.correctAnswer !== 'false') {
            return next(new Error('True/false questions must have "true" or "false" as correct answer'));
        }
    }
    next();
});
// Add index for better query performance
questionSchema.index({ examId: 1, order: 1 });
const Question = mongoose_1.default.model('Question', questionSchema);
exports.default = Question;
//# sourceMappingURL=Question.js.map