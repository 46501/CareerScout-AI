import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  parsedData: any;
  status: 'PENDING' | 'EXTRACTED' | 'CONFIRMED' | 'FAILED';
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
    status: { type: String, enum: ['PENDING', 'EXTRACTED', 'CONFIRMED', 'FAILED'], default: 'PENDING' },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
