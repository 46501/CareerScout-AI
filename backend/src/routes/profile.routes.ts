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
    
    // Calculate completion percentage
    let completionPercentage = 0;
    let completedFields = 0;
    const totalFields = 10; // phone, location, bio, education, experience, projects, skills, languages, tools, preferences
    
    if (profile) {
      if (profile.phone) completedFields++;
      if (profile.location) completedFields++;
      if (profile.bio) completedFields++;
      if (profile.education?.length) completedFields++;
      if (profile.experience?.length) completedFields++;
      if (profile.projects?.length) completedFields++;
      if (profile.skills?.length) completedFields++;
      if (profile.languages?.length) completedFields++;
      if (profile.tools?.length) completedFields++;
      if (profile.preferences?.roles?.length || profile.preferences?.workMode) completedFields++;
      
      completionPercentage = Math.round((completedFields / totalFields) * 100);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        $set: { 
          profile, 
          settings,
          completionPercentage,
          profileCompleted: completionPercentage > 0
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
