import { Request } from 'express';
import { Types } from 'mongoose';

// User types
export interface IUser {
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  microsoftId?: string;
  role: 'admin' | 'student';
  createdAt: Date;
  updatedAt: Date;
}

// Session types
export interface ISession {
  name: string;
  description: string;
  adminId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Class types
export interface IClass {
  name: string;
  description: string;
  sessionId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Exam types
export interface IExam {
  title: string;
  description: string;
  classId: Types.ObjectId;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Question types
export interface IQuestion {
  examId: Types.ObjectId;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  marks: number;
  options?: string[];
  correctAnswer?: string | string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extended Request interface with user
export interface AuthRequest extends Request {
  user?: any; // Allow any user object for now to fix type issues
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
} 