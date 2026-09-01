import express from 'express';
import Opportunity from '../models/Opportunity';

const router = express.Router();

// Get opportunities
router.get('/', async (req, res) => {
  try {
    const { type, search, sort, location, experienceLevel } = req.query;
    
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

    const opportunities = await Opportunity.find(query)
      .sort(sortObj)
      .limit(50);
      
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch opportunities' });
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
