import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Opportunity } from '../models/Opportunity';

export const getOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, type, location, skills, filter } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (filter === 'recommended') {
      // Must be authenticated to get recommended
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Authentication required for recommended filter' } });
        return;
      }

      const { UserOpportunityMatch } = await import('../models/UserOpportunityMatch');
      
      const matches = await UserOpportunityMatch.find({ userId })
        .sort({ matchScore: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('opportunityId');

      const total = await UserOpportunityMatch.countDocuments({ userId });
      
      // Map to opportunity format but attach match metadata
      const opportunities = matches.map(match => {
        const opp = match.opportunityId as any;
        return {
          ...opp.toObject(),
          matchDetails: {
            score: match.matchScore,
            matchedSkills: match.matchedSkills,
            missingSkills: match.missingSkills,
            reasons: match.matchReasons,
            isViewed: match.isViewed,
            isSaved: match.isSaved
          }
        };
      });

      res.status(200).json({ 
        success: true, 
        data: opportunities,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
      });
      return;
    }

    const query: any = { isActive: true };
    
    if (type) query.type = type;
    if (location) query.location = { $regex: location as string, $options: 'i' };
    if (skills) {
      const skillsArray = (skills as string).split(',');
      query.skills = { $in: skillsArray };
    }

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
    next(error);
  }
};

export const getOpportunityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      res.status(404).json({ success: false, error: { message: 'Opportunity not found' } });
      return;
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};
