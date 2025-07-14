import mongoose, { Schema, Document } from 'mongoose';
import { ISession } from '../types';

export interface ISessionDocument extends ISession, Document {}

const sessionSchema = new Schema<ISessionDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
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

// Add index for better query performance
sessionSchema.index({ adminId: 1, isActive: 1 });

const Session = mongoose.model<ISessionDocument>('Session', sessionSchema);

export default Session; 