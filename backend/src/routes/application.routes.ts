import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import Application from '../models/Application';
import Opportunity from '../models/Opportunity';

const router = express.Router();

// Get user's applications
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const applications = await Application.find({ user: req.user.userId })
      .populate('opportunity')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Apply to an opportunity
router.post('/:opportunityId', authMiddleware, async (req: any, res) => {
  try {
    const { opportunityId } = req.params;
    const opp = await Opportunity.findById(opportunityId);
    
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    // Check if already applied
    const existingApp = await Application.findOne({ user: req.user.userId, opportunity: opportunityId });
    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied to this opportunity' });
    }

    const application = new Application({
      user: req.user.userId,
      opportunity: opportunityId,
      status: 'Applied'
    });

    await application.save();
    res.status(201).json({ message: 'Application recorded successfully', application, externalUrl: opp.applicationUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// Update application status/notes
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: { status, notes } },
      { new: true }
    ).populate('opportunity');
    
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    res.json({ message: 'Application updated', application });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

export default router;
