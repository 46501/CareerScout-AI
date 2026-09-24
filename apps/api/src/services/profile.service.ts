import mongoose from 'mongoose';
import { CareerProfile } from '../models/CareerProfile';
import { User } from '../models/User';

export const calculateProfileCompletion = async (userId: mongoose.Types.ObjectId | string) => {
  const profile = await CareerProfile.findOne({ userId });
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      missingFields: ['Basic Information'] // If no profile, everything is missing
    };
  }

  const missingFields: string[] = [];
  let score = 0;
  const maxScore = 100;

  // 1. Basic Information (15%)
  if (profile.personal?.fullName && profile.personal?.currentCity) {
    score += 15;
  } else {
    missingFields.push('Basic Information');
  }

  // 2. Education (15%)
  if (profile.education && profile.education.length > 0) {
    score += 15;
  } else {
    missingFields.push('Education');
  }

  // 3. Technical Skills (15%)
  const hasSkills = 
    (profile.skills?.programmingLanguages?.length > 0) ||
    (profile.skills?.webDevelopment?.length > 0) ||
    (profile.skills?.aiMachineLearning?.length > 0) ||
    (profile.skills?.databases?.length > 0) ||
    (profile.skills?.devopsCloud?.length > 0);
    
  if (hasSkills) {
    score += 15;
  } else {
    missingFields.push('Technical Skills');
  }

  // 4. Experience (15%)
  if (profile.experience && profile.experience.length > 0) {
    score += 15;
  } else {
    missingFields.push('Experience');
  }

  // 5. Career Goals (15%)
  const hasCareerGoals = 
    (profile.careerGoals?.lookingFor?.length > 0) &&
    (profile.careerGoals?.targetRoles?.length > 0) &&
    (profile.careerGoals?.careerGoal);
  
  if (hasCareerGoals) {
    score += 15;
  } else {
    missingFields.push('Career Goals');
  }

  // 6. Preferred Location (10%)
  const hasLocationPrefs = 
    (profile.locationPreferences?.preferredLocations?.length > 0) &&
    (profile.locationPreferences?.workPreference?.length > 0);

  if (hasLocationPrefs) {
    score += 10;
  } else {
    missingFields.push('Preferred Location');
  }

  // 7. Resume (15%)
  const { Resume } = await import('../models/Resume');
  const resume = await Resume.findOne({ userId, status: 'CONFIRMED' });
  if (resume) {
    score += 15;
  } else {
    missingFields.push('Resume');
  }

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
