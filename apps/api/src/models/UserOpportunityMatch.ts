import mongoose, { Document, Schema } from 'mongoose';

export interface IUserOpportunityMatch extends Document {
  userId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: string[];
  generatedAt: Date;
  isViewed: boolean;
  isSaved: boolean;
  isDismissed: boolean;
}

const UserOpportunityMatchSchema = new Schema<IUserOpportunityMatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    matchScore: { type: Number, required: true },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    matchReasons: [{ type: String }],
    generatedAt: { type: Date, default: Date.now },
    isViewed: { type: Boolean, default: false },
    isSaved: { type: Boolean, default: false },
    isDismissed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

UserOpportunityMatchSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
UserOpportunityMatchSchema.index({ userId: 1, matchScore: -1 });
UserOpportunityMatchSchema.index({ generatedAt: -1 });

export const UserOpportunityMatch = mongoose.model<IUserOpportunityMatch>('UserOpportunityMatch', UserOpportunityMatchSchema);
