import { Response } from 'express';
import { CareerProfile } from '../models/CareerProfile';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await CareerProfile.findOne({ userId: req.user?.id });
    
    if (!profile) {
      res.status(404).json({ success: false, error: { message: 'Profile not found' } });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const profileData = req.body;

    const profile = await CareerProfile.findOneAndUpdate(
      { userId },
      { ...profileData, userId },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: profile, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

import { calculateProfileCompletion } from '../services/profile.service';

export const getProfileCompletion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    
    const completion = await calculateProfileCompletion(userId);
    res.status(200).json({ success: true, data: completion });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};
