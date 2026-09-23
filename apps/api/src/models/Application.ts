import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  user: mongoose.Types.ObjectId;
  opportunity: mongoose.Types.ObjectId;
  status: 'SAVED' | 'APPLIED' | 'ONLINE_ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
  appliedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opportunity: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    status: { 
      type: String, 
      enum: ['SAVED', 'APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'],
      default: 'APPLIED'
    },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

ApplicationSchema.index({ user: 1, opportunity: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
