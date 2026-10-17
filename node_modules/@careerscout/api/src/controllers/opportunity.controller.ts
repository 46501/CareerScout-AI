import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { Opportunity } from '../models/Opportunity';
import { OpportunitySource } from '../models/OpportunitySource';
import { UserOpportunityMatch } from '../models/UserOpportunityMatch';
import { CareerProfile } from '../models/CareerProfile';
import { normalizeJobDescription } from '../utils/descriptionNormalizer';
import { generateCoverLetter as aiGenerateCoverLetter } from '../services/ai.service';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const discoveryQueue = new Queue('opportunity-discovery', { connection: redisConnection });

export const getOpportunityStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sources = await OpportunitySource.find().sort({ name: 1 });
    
    // Find most recent success timestamp
    let lastSyncAt: Date | null = null;
    for (const s of sources) {
      if (s.lastSuccessAt && (!lastSyncAt || s.lastSuccessAt > lastSyncAt)) {
        lastSyncAt = s.lastSuccessAt;
      }
    }

    // Category breakdown of active opportunities
    const [totalActive, jobsCount, internshipsCount, hackathonsCount, competitionsCount, fellowshipsCount, expiredCount] = await Promise.all([
      Opportunity.countDocuments({ isActive: true, status: { $ne: 'EXPIRED' } }),
      Opportunity.countDocuments({ isActive: true, status: { $ne: 'EXPIRED' }, type: { $in: ['JOB', 'FREELANCE'] } }),
      Opportunity.countDocuments({ isActive: true, status: { $ne: 'EXPIRED' }, type: 'INTERNSHIP' }),
      Opportunity.countDocuments({ isActive: true, status: { $ne: 'EXPIRED' }, type: 'HACKATHON' }),
      Opportunity.countDocuments({ isActive: true, status: { $ne: 'EXPIRED' }, type: 'COMPETITION' }),
      Opportunity.countDocuments({ isActive: true, status: { $ne: 'EXPIRED' }, type: 'FELLOWSHIP' }),
      Opportunity.countDocuments({ status: 'EXPIRED' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        lastSyncAt,
        totalActive,
        expiredCount,
        countsByCategory: {
          all: totalActive,
          jobs: jobsCount,
          internships: internshipsCount,
          hackathons: hackathonsCount,
          competitions: competitionsCount,
          fellowships: fellowshipsCount
        },
        sources: sources.map(s => ({
          name: s.name,
          identifier: s.identifier,
          type: s.type,
          status: s.status,
          lastRunAt: s.lastRunAt,
          lastSuccessAt: s.lastSuccessAt,
          lastError: s.lastError,
          opportunitiesFound: s.opportunitiesFound,
          totalOpportunitiesActive: s.totalOpportunitiesActive,
          lastRunDurationMs: s.lastRunDurationMs
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const syncOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    console.log(`[API] Manual opportunity sync requested by user ${userId}`);

    // Queue discovery job in BullMQ
    const job = await discoveryQueue.add('dailyOpportunityDiscovery', {
      manual: true,
      requestedBy: userId,
      requestedAt: new Date()
    });

    res.status(202).json({
      success: true,
      message: 'Opportunity sync job enqueued successfully. Providers will refresh in background.',
      jobId: job.id
    });
  } catch (error) {
    next(error);
  }
};

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
      minScore,
      includeExpired = 'false',
      sort = 'newest',
      filter
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user?.id || (req as any).user?.userId;

    // Helper to normalize opportunity types
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
    const query: any = {};

    // Freshness & Expiration Filter
    if (includeExpired === 'true') {
      // User explicitly requested expired opportunities too
    } else {
      // By default: never show expired listings
      query.isActive = true;
      query.status = { $ne: 'EXPIRED' };
    }

    if (targetType) {
      if (targetType === 'JOB') {
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

    // Handle minScore or filter='recommended' or score sorting
    const hasMinScore = minScore !== undefined && !isNaN(Number(minScore)) && Number(minScore) > 0;
    const isRecommendedFilter = filter === 'recommended';
    const isScoreSort = sort === 'score_desc' || sort === 'score_asc';

    if (userId && (hasMinScore || isRecommendedFilter || isScoreSort)) {
      // Find candidate IDs satisfying base query
      const candidateOpps = await Opportunity.find(query).select('_id');
      const candidateIds = candidateOpps.map(o => o._id);

      const matchQuery: any = {
        userId,
        opportunityId: { $in: candidateIds }
      };

      if (hasMinScore) {
        matchQuery.matchScore = { $gte: Number(minScore) };
      }

      const sortCriteria: any = sort === 'score_asc' ? { matchScore: 1 } : { matchScore: -1 };

      const total = await UserOpportunityMatch.countDocuments(matchQuery);
      const matches = await UserOpportunityMatch.find(matchQuery)
        .sort(sortCriteria)
        .skip(skip)
        .limit(Number(limit))
        .populate('opportunityId');

      const opportunities = matches
        .filter(m => m.opportunityId)
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
              eligibilityWarnings: match.eligibilityWarnings,
              isViewed: match.isViewed,
              isSaved: match.isSaved
            }
          };
        });

      res.status(200).json({
        success: true,
        data: opportunities,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit)
        }
      });
      return;
    }

    // Standard sorting option
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
        const oppIds = opportunities.map(o => o._id);
        const userMatches = await UserOpportunityMatch.find({ userId, opportunityId: { $in: oppIds } });
        for (const m of userMatches) {
          matchMap.set(m.opportunityId.toString(), {
            score: m.matchScore,
            matchedSkills: m.matchedSkills,
            missingSkills: m.missingSkills,
            reasons: m.matchReasons,
            eligibilityWarnings: m.eligibilityWarnings,
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

    const obj = (opportunity.toObject ? opportunity.toObject() : opportunity) as any;
    const userId = (req as any).user?.id || (req as any).user?.userId;

    let matchDetails = obj.matchDetails;
    if (userId) {
      const userMatch = await UserOpportunityMatch.findOne({ userId, opportunityId: opportunity._id });
      if (userMatch) {
        matchDetails = {
          score: userMatch.matchScore,
          matchedSkills: userMatch.matchedSkills,
          missingSkills: userMatch.missingSkills,
          reasons: userMatch.matchReasons,
          eligibilityWarnings: userMatch.eligibilityWarnings,
          isViewed: userMatch.isViewed,
          isSaved: userMatch.isSaved
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...obj,
        description: normalizeJobDescription(obj.description),
        ...(matchDetails ? { matchDetails } : {})
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
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
