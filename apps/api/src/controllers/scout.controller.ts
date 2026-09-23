import { Request, Response, NextFunction } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { User } from '../models/User';
import { calculateProfileCompletion } from '../services/profile.service';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const discoveryQueue = new Queue('opportunity-discovery', { connection: redisConnection });

export const runScout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    
    // Ensure profile is complete
    const { isComplete, missingFields } = await calculateProfileCompletion(userId);
    if (!isComplete) {
      res.status(403).json({ 
        success: false, 
        error: { message: 'Profile incomplete. Please complete your profile to run CareerScout.' },
        data: { missingFields }
      });
      return;
    }

    // Update status to ACTIVE if it was READY
    const user = await User.findById(userId);
    if (user && user.scoutStatus !== 'ACTIVE' && user.scoutStatus !== 'PAUSED') {
      user.scoutStatus = 'ACTIVE';
      await user.save();
    }
    
    if (user?.scoutStatus === 'PAUSED') {
      res.status(403).json({ success: false, error: { message: 'CareerScout is paused. Resume it in your settings.' }});
      return;
    }

    // Push job to worker
    await discoveryQueue.add('personalizedOpportunityDiscovery', { userId });

    res.status(202).json({ 
      success: true, 
      message: 'Scout started successfully. Opportunities will appear shortly.' 
    });
  } catch (error) {
    next(error);
  }
};
