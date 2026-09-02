import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import User from '../models/User';

const router = express.Router();

// Get current user profile
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/', authMiddleware, async (req: any, res) => {
  try {
    const { profile, settings } = req.body;
    
    // Mandatory fields check
    let completionPercentage = 0;
    let completedFields = 0;
    const totalFields = 11; // phone, location, country, education, careerGoal, opportunityTypes, workMode, preferredLocations, experienceLevel, skills, resume
    
    // We'll fetch the user first to check the existing resume since it's uploaded separately
    const existingUser = await User.findById(req.user.userId || req.user.id);
    
    if (profile) {
      if (profile.phone && profile.phone.trim()) completedFields++;
      if (profile.location && profile.location.trim()) completedFields++;
      if (profile.country && profile.country.trim()) completedFields++;
      
      // Academic
      if (profile.education && profile.education.length > 0) {
        const edu = profile.education[0];
        if (edu.degree && edu.institution && edu.graduationYear) completedFields++;
      }
      
      // Career Information
      if (profile.careerGoal && profile.careerGoal.trim()) completedFields++;
      if (profile.preferences?.opportunityTypes && profile.preferences.opportunityTypes.length > 0) completedFields++;
      if (profile.preferences?.workMode && profile.preferences.workMode.trim()) completedFields++;
      if (profile.preferences?.locations && profile.preferences.locations.length > 0) completedFields++;
      if (profile.experienceLevel && profile.experienceLevel.trim()) completedFields++;
      
      // Skills
      if (profile.skills && profile.skills.length > 0) completedFields++;
      
      // Resume (check existing user document since this is a separate upload endpoint)
      if (existingUser?.profile?.resume?.filename || profile.resume?.filename) completedFields++;
      
      completionPercentage = Math.round((completedFields / totalFields) * 100);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId || req.user.id,
      { 
        $set: { 
          profile, 
          settings,
          completionPercentage,
          profileCompleted: completionPercentage === 100
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
