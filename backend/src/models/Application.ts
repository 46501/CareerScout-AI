import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: { 
    type: String, 
    enum: ['Saved', 'Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  appliedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ user: 1, opportunity: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
