import mongoose, { Schema, Document } from 'mongoose';
import { IExam } from '../types';

export interface IExamDocument extends IExam, Document {}

const examSchema = new Schema<IExamDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure passing marks don't exceed total marks
examSchema.pre('save', function (next) {
  if (this.passingMarks > this.totalMarks) {
    next(new Error('Passing marks cannot exceed total marks'));
  }
  next();
});

// Add index for better query performance
examSchema.index({ classId: 1, isActive: 1 });

const Exam = mongoose.model<IExamDocument>('Exam', examSchema);

export default Exam; 