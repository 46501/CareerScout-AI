import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  current: Boolean,
  description: String
});

const educationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  fieldOfStudy: String,
  graduationYear: String,
  cgpa: String
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  technologies: [String]
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileCompleted: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0 },
  
  // Profile Data
  profile: {
    phone: String,
    location: String,
    country: String,
    bio: String,
    linkedin: String,
    github: String,
    portfolio: String,
    careerGoal: String,
    experienceLevel: String,
    
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    
    skills: [String],
    languages: [String], // Programming languages
    frameworks: [String],
    databases: [String],
    tools: [String],
    certifications: [String],
    
    // Resume metadata
    resume: {
      filename: String,
      path: String,
      uploadedAt: { type: Date, default: Date.now }
    },
    
    // Preferences
    preferences: {
      roles: [String],
      locations: [String],
      workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Any'], default: 'Any' },
      opportunityTypes: [String] // Jobs, Internships, etc.
    }
  },
  
  // Settings
  settings: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
