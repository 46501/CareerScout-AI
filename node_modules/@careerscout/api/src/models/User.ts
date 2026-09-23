import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  scoutStatus: 'INCOMPLETE' | 'READY' | 'ACTIVE' | 'PAUSED';
  scoutSettings: {
    dailyScout: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    isVerified: { type: Boolean, default: false },
    scoutStatus: { type: String, enum: ['INCOMPLETE', 'READY', 'ACTIVE', 'PAUSED'], default: 'INCOMPLETE' },
    scoutSettings: {
      dailyScout: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
