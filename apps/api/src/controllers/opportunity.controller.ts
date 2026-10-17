import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Opportunity } from '../models/Opportunity';
import { normalizeJobDescription } from '../utils/descriptionNormalizer';

import { CareerProfile } from '../models/CareerProfile';
import { generateCoverLetter as aiGenerateCoverLetter } from '../services/ai.service';

export const getOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      search,
      q,
      location,
      remoteType,
      skills,
      sort = 'newest',
      filter
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user?.id;

    // Helper to normalize opportunity types (supporting plurals and case variations)
    const normalizeType = (t?: any): string | null => {
      if (!t || typeof t !== 'string') return null;
      const clean = t.trim().toUpperCase();
      if (clean === 'ALL') return null;
      if (clean === 'INTERNSHIP' || clean === 'INTERNSHIPS') return 'INTERNSHIP';
      if (clean === 'JOB' || clean === 'JOBS') return 'JOB';
      if (clean === 'HACKATHON' || clean === 'HACKATHONS') return 'HACKATHON';
      if (clean === 'COMPETITION' || clean === 'COMPETITIONS') return 'COMPETITION';
      if (clean === 'FELLOWSHIP' || clean === 'FELLOWSHIPS') return 'FELLOWSHIP';
      if (clean === 'SCHOLARSHIP' || clean === 'SCHOLARSHIPS') return 'SCHOLARSHIP';
      if (clean === 'WORKSHOP' || clean === 'WORKSHOPS') return 'WORKSHOP';
      if (clean === 'FREELANCE') return 'FREELANCE';
      return clean;
    };

    const targetType = normalizeType(type);

    // Build base query
    const query: any = { isActive: true };

    if (targetType) {
      if (targetType === 'JOB') {
        // Support both JOB and legacy FREELANCE contract listings under Jobs
        query.type = { $in: ['JOB', 'FREELANCE'] };
      } else {
        query.type = targetType;
      }
    }

    // Composable search query: title, organization, skills, description, location
    const searchTerm = ((search || q || '') as string).trim();
    if (searchTerm) {
      const regex = { $regex: searchTerm, $options: 'i' };
      query.$or = [
        { title: regex },
        { organization: regex },
        { description: regex },
        { skills: regex },
        { location: regex }
      ];
    }

    // Location filter
    if (location && typeof location === 'string' && location.trim() && location.trim().toLowerCase() !== 'all') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Remote / Work Preference filter
    if (remoteType && typeof remoteType === 'string' && remoteType.trim() && remoteType.trim().toUpperCase() !== 'ALL' && remoteType.trim().toUpperCase() !== 'ANY') {
      query.remoteType = { $regex: `^${remoteType.trim()}$`, $options: 'i' };
    }

    // Skills filter
    if (skills && typeof skills === 'string' && skills.trim()) {
      const skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsList.length > 0) {
        query.skills = { $in: skillsList.map(s => new RegExp(`^${s}$`, 'i')) };
      }
    }

    // Sorting option
    let sortObj: any = { postedAt: -1 };
    if (sort === 'oldest') {
      sortObj = { postedAt: 1 };
    } else if (sort === 'title_asc') {
      sortObj = { title: 1 };
    } else if (sort === 'title_desc') {
      sortObj = { title: -1 };
    } else if (sort === 'deadline') {
      sortObj = { deadline: 1 };
    }

    if (filter === 'recommended') {
      // Must be authenticated to get recommended
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Authentication required for recommended filter' } });
        return;
      }

      const { UserOpportunityMatch } = await import('../models/UserOpportunityMatch');

      // Find all opportunity IDs that match the composable filters (type, search, location, etc.)
      const matchingOpps = await Opportunity.find(query).select('_id');
      const matchingOppIds = matchingOpps.map(o => o._id);

      const matchQuery: any = {
        userId,
        opportunityId: { $in: matchingOppIds }
      };

      const matches = await UserOpportunityMatch.find(matchQuery)
        .sort(sort === 'score_asc' ? { matchScore: 1 } : { matchScore: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('opportunityId');

      const total = await UserOpportunityMatch.countDocuments(matchQuery);

      const opportunities = matches
        .filter(match => match.opportunityId)
        .map(match => {
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
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) }
      });
      return;
    }

    // General query with full pagination
    const opportunities = await Opportunity.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Opportunity.countDocuments(query);

    // If user is authenticated, attach any existing AI matchDetails for these opportunities
    let matchMap = new Map<string, any>();
    if (userId && opportunities.length > 0) {
      try {
        const { UserOpportunityMatch } = await import('../models/UserOpportunityMatch');
        const oppIds = opportunities.map(o => o._id);
        const userMatches = await UserOpportunityMatch.find({ userId, opportunityId: { $in: oppIds } });
        for (const m of userMatches) {
          matchMap.set(m.opportunityId.toString(), {
            score: m.matchScore,
            matchedSkills: m.matchedSkills,
            missingSkills: m.missingSkills,
            reasons: m.matchReasons,
            isViewed: m.isViewed,
            isSaved: m.isSaved
          });
        }
      } catch (err) {
        console.error('Error attaching user matches:', err);
      }
    }

    const normalizedOpportunities = opportunities.map(opp => {
      const obj = (opp.toObject ? opp.toObject() : opp) as any;
      const matchDetails = matchMap.get(obj._id.toString()) || obj.matchDetails;
      return {
        ...obj,
        description: normalizeJobDescription(obj.description),
        ...(matchDetails ? { matchDetails } : {})
      };
    });

    res.status(200).json({
      success: true,
      data: normalizedOpportunities,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
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
