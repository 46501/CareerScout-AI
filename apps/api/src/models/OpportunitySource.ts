import mongoose, { Document, Schema } from 'mongoose';

export interface IOpportunitySource extends Document {
  name: string;
  identifier: string;
  type: 'API' | 'SCRAPER' | 'MOCK';
  status: 'ACTIVE' | 'ERROR' | 'DISABLED';
  lastRunAt?: Date;
  lastSuccessAt?: Date;
  lastError?: string;
  opportunitiesFound: number;
}

const OpportunitySourceSchema = new Schema<IOpportunitySource>(
  {
    name: { type: String, required: true },
    identifier: { type: String, required: true, unique: true },
    type: { type: String, enum: ['API', 'SCRAPER', 'MOCK'], required: true },
    status: { type: String, enum: ['ACTIVE', 'ERROR', 'DISABLED'], default: 'ACTIVE' },
    lastRunAt: { type: Date },
    lastSuccessAt: { type: Date },
    lastError: { type: String },
    opportunitiesFound: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const OpportunitySource = mongoose.model<IOpportunitySource>('OpportunitySource', OpportunitySourceSchema);
