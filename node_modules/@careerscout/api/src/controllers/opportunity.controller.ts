import { Request, Response } from 'express';
import { Opportunity } from '../models/Opportunity';

export const getOpportunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, type, location, skills } = req.query;
    
    const query: any = { isActive: true };
    
    if (type) query.type = type;
    if (location) query.location = { $regex: location as string, $options: 'i' };
    if (skills) {
      const skillsArray = (skills as string).split(',');
      query.skills = { $in: skillsArray };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const opportunities = await Opportunity.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Opportunity.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: opportunities,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const getOpportunityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      res.status(404).json({ success: false, error: { message: 'Opportunity not found' } });
      return;
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};
