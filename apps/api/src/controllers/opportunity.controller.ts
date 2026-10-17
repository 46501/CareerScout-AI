import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Opportunity } from '../models/Opportunity';
import { normalizeJobDescription } from '../utils/descriptionNormalizer';

import { CareerProfile } from '../models/CareerProfile';
import { generateCoverLetter as aiGenerateCoverLetter } from '../services/ai.service';

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
      
      // Map to opportunity format but attach match metadata and normalize description
      const opportunities = matches.map(match => {
        const opp = match.opportunityId as any;
        const obj = opp?.toObject ? opp.toObject() : opp;
        return {
          ...obj,
          description: normalizeJobDescription(obj?.description),
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

    const normalizedOpportunities = opportunities.map(opp => {
      const obj = opp.toObject ? opp.toObject() : opp;
      return {
        ...obj,
        description: normalizeJobDescription(obj.description)
      };
    });

    res.status(200).json({ 
      success: true, 
      data: normalizedOpportunities,
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

    const obj = opportunity.toObject ? opportunity.toObject() : opportunity;

    res.status(200).json({
      success: true,
      data: {
        ...obj,
        description: normalizeJobDescription(obj.description)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const opportunityId = req.params.id;

    const profile = await CareerProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ success: false, error: { message: 'Profile not found' } });
      return;
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      res.status(404).json({ success: false, error: { message: 'Opportunity not found' } });
      return;
    }

    const letter = await aiGenerateCoverLetter(profile, opportunity);
    res.status(200).json({ success: true, data: { coverLetter: letter } });
  } catch (error) {
    next(error);
  }
};
