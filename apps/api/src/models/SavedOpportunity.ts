import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedOpportunity extends Document {
  user: mongoose.Types.ObjectId;
  opportunity: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const SavedOpportunitySchema = new Schema<ISavedOpportunity>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opportunity: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

SavedOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true });

export const SavedOpportunity = mongoose.model<ISavedOpportunity>('SavedOpportunity', SavedOpportunitySchema);
