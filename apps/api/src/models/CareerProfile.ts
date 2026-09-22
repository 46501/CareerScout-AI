import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  personal: {
    fullName: string;
    phone?: string;
    profilePhoto?: string;
  };
  education: Array<{
    degree: string;
    branch: string;
    university: string;
    graduationYear: number;
    CGPA?: string;
  }>;
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    databases: string[];
    cloud: string[];
    otherSkills: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
    isInternship: boolean;
  }>;
  preferences: {
    preferredRoles: string[];
    preferredLocations: string[];
    remotePreference: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'ANY';
    jobPreference: boolean;
    internshipPreference: boolean;
  };
}

const CareerProfileSchema = new Schema<ICareerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    personal: {
      fullName: { type: String, required: true },
      phone: { type: String },
      profilePhoto: { type: String },
    },
    education: [
      {
        degree: { type: String, required: true },
        branch: { type: String, required: true },
        university: { type: String, required: true },
        graduationYear: { type: Number, required: true },
        CGPA: { type: String },
      },
    ],
    skills: {
      programmingLanguages: [{ type: String }],
      frameworks: [{ type: String }],
      databases: [{ type: String }],
      cloud: [{ type: String }],
      otherSkills: [{ type: String }],
    },
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        description: { type: String },
        isInternship: { type: Boolean, default: false },
      },
    ],
    preferences: {
      preferredRoles: [{ type: String }],
      preferredLocations: [{ type: String }],
      remotePreference: { type: String, enum: ['REMOTE', 'HYBRID', 'ONSITE', 'ANY'], default: 'ANY' },
      jobPreference: { type: Boolean, default: true },
      internshipPreference: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const CareerProfile = mongoose.model<ICareerProfile>('CareerProfile', CareerProfileSchema);
