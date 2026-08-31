import mongoose from 'mongoose';

const savedOpportunitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
}, { timestamps: true });

// Prevent duplicate saves
savedOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true });

export default mongoose.model('SavedOpportunity', savedOpportunitySchema);
