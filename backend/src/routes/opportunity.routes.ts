import express from 'express';
import Opportunity from '../models/Opportunity';
import User from '../models/User';
import { calculateHeuristicMatchScore } from '../services/matchScorer';
import { fetchAndStoreOpportunities } from '../services/opportunityFetcher';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get opportunities
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { type, search, sort, location, experienceLevel } = req.query;
    const userId = req.user?.id;
    
    // Fetch user profile for matching
    const user = await User.findById(userId);
    const userProfile = user?.profile || {};
    
    let query: any = {};
    if (type && type !== 'All') {
      const types = (type as string).split(',');
      if (types.length > 0) {
        query.type = { $in: types };
      }
    }
    
    if (location && location !== 'All Locations') {
      query.location = { $regex: location as string, $options: 'i' };
    }

    if (experienceLevel && experienceLevel !== 'All Levels') {
      query.experienceLevel = experienceLevel;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    let sortObj: any = { matchScore: -1 };
    if (sort === 'Newest') sortObj = { postedAt: -1 };

    const rawOpportunities = await Opportunity.find(query)
      .sort(sortObj)
      .limit(50);
      
    // Calculate match scores dynamically
    const scoredOpportunities = rawOpportunities.map(opp => {
      const oppObj = opp.toObject();
      oppObj.matchScore = calculateHeuristicMatchScore(userProfile, oppObj);
      return oppObj;
    });

    // If sorting by matchScore, we need to sort again in memory since we just calculated it dynamically
    if (sort !== 'Newest') {
      scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);
    }
      
    res.json(scoredOpportunities);
  } catch (error) {
    console.error('Fetch opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Scout for new opportunities (Fetch from API)
router.post('/scout', authMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log(`Manual scout triggered by user ${req.user?.id}`);
    const newCount = await fetchAndStoreOpportunities();
    res.json({ message: 'Scouting complete', newOpportunitiesAdded: newCount });
  } catch (error) {
    console.error('Scout error:', error);
    res.status(500).json({ error: 'Failed to scout for opportunities' });
  }
});

// Get single opportunity
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

export default router;
