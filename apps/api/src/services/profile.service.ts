import mongoose from 'mongoose';
import { CareerProfile } from '../models/CareerProfile';
import { User } from '../models/User';

export const calculateProfileCompletion = async (userId: mongoose.Types.ObjectId | string) => {
  const profile = await CareerProfile.findOne({ userId });
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      missingFields: ['CareerProfile']
    };
  }

  const missingFields: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Personal Info (20%)
  if (profile.personal?.fullName) score += 10;
  else missingFields.push('Full Name');
  
  if (profile.personal?.phone) score += 10;
  else missingFields.push('Phone Number');

  // Education (20%)
  if (profile.education && profile.education.length > 0) score += 20;
  else missingFields.push('Education History');

  // Skills (20%)
  const hasSkills = 
    profile.skills?.programmingLanguages?.length > 0 ||
    profile.skills?.frameworks?.length > 0 ||
    profile.skills?.databases?.length > 0 ||
    profile.skills?.cloud?.length > 0 ||
    profile.skills?.otherSkills?.length > 0;
    
  if (hasSkills) score += 20;
  else missingFields.push('Skills');

  // Experience/Projects (20%)
  if (profile.experience && profile.experience.length > 0) score += 20;
  else missingFields.push('Experience or Projects');

  // Preferences (20%)
  if (profile.preferences?.preferredRoles && profile.preferences.preferredRoles.length > 0) score += 10;
  else missingFields.push('Preferred Roles');
  
  if (profile.preferences?.preferredLocations && profile.preferences.preferredLocations.length > 0) score += 10;
  else missingFields.push('Preferred Locations');

  const { Resume } = await import('../models/Resume');
  const resume = await Resume.findOne({ userId, status: 'CONFIRMED' });
  if (resume) score += 10;
  else missingFields.push('Resume');

  const percentage = Math.min(score, maxScore);
  const isComplete = percentage === 100; // Requires 100%

  // Update user status if threshold is met and they are currently INCOMPLETE
  if (isComplete) {
    const user = await User.findById(userId);
    if (user && user.scoutStatus === 'INCOMPLETE') {
      user.scoutStatus = 'READY';
      await user.save();
    }
  } else {
    // If user deleted something and is no longer 100%
    const user = await User.findById(userId);
    if (user && user.scoutStatus !== 'INCOMPLETE') {
      user.scoutStatus = 'INCOMPLETE';
      await user.save();
    }
  }

  return {
    percentage,
    isComplete,
    missingFields
  };
};
