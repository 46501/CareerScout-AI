import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  logo: { type: String },
  type: { type: String, enum: ['Jobs', 'Internships', 'Hackathons', 'Coding Contests', 'Scholarships', 'Fellowships', 'Webinars', 'Tech Events'], required: true },
  description: { type: String, required: true },
  location: { type: String },
  workMode: { type: String }, // e.g., 'Work from home', 'On-site'
  salary: { type: String }, // optional, for jobs
  stipend: { type: String }, // optional, for internships
  paymentType: { type: String }, // 'Paid', 'Unpaid'
  duration: { type: String },
  experienceLevel: { type: String },
  skills: [{ type: String }],
  deadline: { type: Date },
  postedAt: { type: Date, default: Date.now },
  source: { type: String },
  applicationUrl: { type: String },
  matchScore: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isNewOpp: { type: Boolean, default: true },
  earlyApplicant: { type: Boolean, default: false }
}, { timestamps: true });

// Text index for search
opportunitySchema.index({ title: 'text', description: 'text', skills: 'text', organization: 'text' });

export default mongoose.model('Opportunity', opportunitySchema);
