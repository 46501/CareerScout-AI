import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Application } from '../models/Application';

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apps = await Application.find({ user: (req as any).user?.id })
      .populate('opportunity')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: apps });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { opportunityId, status, notes } = req.body;
    
    const existing = await Application.findOne({ 
      user: (req as any).user?.id, 
      opportunity: opportunityId 
    });

    if (existing) {
      existing.status = status || existing.status;
      existing.notes = notes || existing.notes;
      await existing.save();
      res.status(200).json({ success: true, data: existing });
      return;
    }

    const app = await Application.create({
      user: (req as any).user?.id,
      opportunity: opportunityId,
      status: status || 'APPLIED',
      notes
    });

    res.status(201).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, user: (req as any).user?.id },
      { ...req.body },
      { new: true }
    );

    if (!app) {
      res.status(404).json({ success: false, error: { message: 'Application not found' } });
      return;
    }

    res.status(200).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};
