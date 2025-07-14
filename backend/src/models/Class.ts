import mongoose, { Schema, Document } from 'mongoose';
import { IClass } from '../types';

export interface IClassDocument extends IClass, Document {}

const classSchema = new Schema<IClassDocument>(
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
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
classSchema.index({ sessionId: 1 });

const Class = mongoose.model<IClassDocument>('Class', classSchema);

export default Class; 