import mongoose, { Schema, Document } from 'mongoose';
import { IQuestion } from '../types';

export interface IQuestionDocument extends IQuestion, Document {}

const questionSchema = new Schema<IQuestionDocument>(
  {
    examId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.Mixed,
      default: undefined,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

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

const Question = mongoose.model<IQuestionDocument>('Question', questionSchema);

export default Question; 