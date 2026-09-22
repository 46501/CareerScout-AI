import mongoose, { Document, Schema } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  organization: string;
  organizationLogo?: string;
  description: string;
  type: 'JOB' | 'INTERNSHIP' | 'HACKATHON' | 'COMPETITION' | 'FELLOWSHIP' | 'SCHOLARSHIP' | 'WORKSHOP' | 'WEBINAR';
  category?: string;
  skills: string[];
  experienceLevel?: string;
  location?: string;
  remoteType: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'ANY';
  salary?: string;
  stipend?: string;
  currency?: string;
  deadline?: Date;
  postedAt: Date;
  source: string;
  sourceId: string;
  sourceUrl: string;
  applicationUrl: string;
  isActive: boolean;
  lastVerifiedAt: Date;
  metadata?: any;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true },
    organizationLogo: { type: String },
    description: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String },
    skills: [{ type: String }],
    experienceLevel: { type: String },
    location: { type: String },
    remoteType: { type: String, enum: ['REMOTE', 'HYBRID', 'ONSITE', 'ANY'], default: 'ANY' },
    salary: { type: String },
    stipend: { type: String },
    currency: { type: String },
    deadline: { type: Date },
    postedAt: { type: Date, required: true },
    source: { type: String, required: true },
    sourceId: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    applicationUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastVerifiedAt: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Indexes for fast querying
OpportunitySchema.index({ type: 1, isActive: 1 });
OpportunitySchema.index({ deadline: 1 });
OpportunitySchema.index({ postedAt: -1 });
OpportunitySchema.index({ skills: 1 });
OpportunitySchema.index({ source: 1, sourceId: 1 }, { unique: true });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
