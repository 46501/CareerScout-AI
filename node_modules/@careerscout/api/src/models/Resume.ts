import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  parsedData: any;
  status: 'PENDING' | 'PROCESSING' | 'EXTRACTED' | 'CONFIRMED' | 'FAILED';
  aiDetected?: {
    skillsCount: number;
    eduCount: number;
    expCount: number;
  };
  error?: string;
  version: number;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    parsedData: { type: Schema.Types.Mixed },
    status: { 
      type: String, 
      enum: ['PENDING', 'PROCESSING', 'EXTRACTED', 'CONFIRMED', 'FAILED'], 
      default: 'PENDING' 
    },
    aiDetected: {
      skillsCount: { type: Number, default: 0 },
      eduCount: { type: Number, default: 0 },
      expCount: { type: Number, default: 0 }
    },
    error: { type: String },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
