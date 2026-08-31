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
