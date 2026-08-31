import express from 'express';
import Opportunity from '../models/Opportunity';

const router = express.Router();

// Get opportunities
router.get('/', async (req, res) => {
  try {
    const { type, search, sort } = req.query;
    
    let query: any = {};
    if (type && type !== 'All') {
      query.type = type;
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

export default router;
