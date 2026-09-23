import { Request, Response } from 'express';
import { SavedOpportunity } from '../models/SavedOpportunity';

export const getSavedOpportunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const saved = await SavedOpportunity.find({ user: (req as any).user.userId })
      .populate('opportunity')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const saveOpportunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { opportunityId } = req.body;
    
    const existing = await SavedOpportunity.findOne({ 
      user: (req as any).user.userId, 
      opportunity: opportunityId 
    });

    if (existing) {
      res.status(400).json({ success: false, error: { message: 'Already saved' } });
      return;
    }

    const saved = await SavedOpportunity.create({
      user: (req as any).user.userId,
      opportunity: opportunityId
    });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const unsaveOpportunity = async (req: Request, res: Response): Promise<void> => {
  try {
    await SavedOpportunity.findOneAndDelete({
      user: (req as any).user.userId,
      opportunity: req.params.opportunityId
    });

    res.status(200).json({ success: true, message: 'Opportunity unsaved' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};
