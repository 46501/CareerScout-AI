import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  personal: {
    fullName: string;
    phone?: string;
    profilePhoto?: string;
    currentCity?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  education: Array<{
    college: string;
    degree: string;
    branch: string;
    startYear: number;
    graduationYear: number;
    cgpa?: string;
  }>;
  skills: {
    programmingLanguages: Array<{ name: string; level?: string }>;
    webDevelopment: Array<{ name: string; level?: string }>;
    aiMachineLearning: Array<{ name: string; level?: string }>;
    databases: Array<{ name: string; level?: string }>;
    devopsCloud: Array<{ name: string; level?: string }>;
  };
  experience: Array<{
    company: string;
    title: string;
    employmentType: string;
    startDate: Date;
    endDate?: Date;
    currentlyWorking: boolean;
    location?: string;
    description?: string;
    technologiesUsed: string[];
  }>;
  careerGoals: {
    lookingFor: string[];
    targetRoles: string[];
    interestedTechnologies: string[];
    careerInterests: string[];
    careerGoal?: string;
  };
  locationPreferences: {
    preferredLocations: string[];
    workPreference: string[];
    willingToRelocate: boolean;
  };
}

const SkillItemSchema = new Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] }
}, { _id: false });

const CareerProfileSchema = new Schema<ICareerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    personal: {
      fullName: { type: String, required: true },
      phone: { type: String },
      profilePhoto: { type: String },
      currentCity: { type: String },
      linkedinUrl: { type: String },
      githubUrl: { type: String },
      portfolioUrl: { type: String },
    },
    education: [
      {
        college: { type: String, required: true },
        degree: { type: String, required: true },
        branch: { type: String, required: true },
        startYear: { type: Number, required: true },
        graduationYear: { type: Number, required: true },
        cgpa: { type: String },
      },
    ],
    skills: {
      programmingLanguages: [SkillItemSchema],
      webDevelopment: [SkillItemSchema],
      aiMachineLearning: [SkillItemSchema],
      databases: [SkillItemSchema],
      devopsCloud: [SkillItemSchema],
    },
    experience: [
      {
        company: { type: String, required: true },
        title: { type: String, required: true },
        employmentType: { type: String, default: 'Full-time' },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        currentlyWorking: { type: Boolean, default: false },
        location: { type: String },
        description: { type: String },
        technologiesUsed: [{ type: String }],
      },
    ],
    careerGoals: {
      lookingFor: [{ type: String }],
      targetRoles: [{ type: String }],
      interestedTechnologies: [{ type: String }],
      careerInterests: [{ type: String }],
      careerGoal: { type: String },
    },
    locationPreferences: {
      preferredLocations: [{ type: String }],
      workPreference: [{ type: String }],
      willingToRelocate: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const CareerProfile = mongoose.model<ICareerProfile>('CareerProfile', CareerProfileSchema);
