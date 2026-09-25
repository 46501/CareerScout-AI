import mongoose from 'mongoose';
import { CareerProfile } from '../models/CareerProfile';
import { User } from '../models/User';

export const calculateProfileCompletion = async (userId: mongoose.Types.ObjectId | string) => {
  const profile = await CareerProfile.findOne({ userId });
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      completedSections: [],
      missingFields: ['Basic Information', 'Education', 'Technical Skills', 'Experience', 'Career Goals', 'Preferred Location', 'Resume']
    };
  }

  const completedSections: string[] = [];
  const missingFields: string[] = [];
  
  // 1. Basic Information
  if (profile.personal?.fullName && profile.personal?.phone && profile.personal?.currentCity) {
    completedSections.push('Basic Information');
  } else {
    missingFields.push('Basic Information');
  }

  // 2. Education
  const hasValidEducation = profile.education?.some(edu => 
    edu.college && edu.degree && edu.branch && edu.graduationYear
  );
  if (hasValidEducation) {
    completedSections.push('Education');
  } else {
    missingFields.push('Education');
  }

  // 3. Technical Skills
  const hasSkills = 
    (profile.skills?.programmingLanguages?.length > 0) ||
    (profile.skills?.webDevelopment?.length > 0) ||
    (profile.skills?.aiMachineLearning?.length > 0) ||
    (profile.skills?.databases?.length > 0) ||
    (profile.skills?.devopsCloud?.length > 0);
    
  if (hasSkills) {
    completedSections.push('Technical Skills');
  } else {
    missingFields.push('Technical Skills');
  }

  // 4. Experience
  const hasExperience = (profile.experience && profile.experience.length > 0);
  if (hasExperience || profile.hasNoExperience) {
    completedSections.push('Experience');
  } else {
    missingFields.push('Experience');
  }

  // 5. Career Goals
  const hasCareerGoals = 
    (profile.careerGoals?.targetRoles?.length > 0) &&
    (profile.careerGoals?.careerGoal);
  
  if (hasCareerGoals) {
    completedSections.push('Career Goals');
  } else {
    missingFields.push('Career Goals');
  }

  // 6. Preferred Location
  const hasLocationPrefs = 
    (profile.locationPreferences?.preferredLocations?.length > 0) &&
    (profile.locationPreferences?.workPreference?.length > 0);

  if (hasLocationPrefs) {
    completedSections.push('Preferred Location');
  } else {
    missingFields.push('Preferred Location');
  }

  // 7. Resume
  const { Resume } = await import('../models/Resume');
  const resume = await Resume.findOne({ userId, status: 'CONFIRMED' });
  if (resume) {
    completedSections.push('Resume');
  } else {
    missingFields.push('Resume');
  }

  const percentage = Math.round((completedSections.length / 7) * 100);
  const isComplete = completedSections.length === 7;

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
    completedSections,
    missingFields
  };
};
