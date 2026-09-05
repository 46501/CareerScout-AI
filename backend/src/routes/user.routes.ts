import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import SavedOpportunity from '../models/SavedOpportunity';
import Notification from '../models/Notification';
import Application from '../models/Application';

const router = express.Router();

// ================= SAVED OPPORTUNITIES =================

router.get('/saved', authMiddleware, async (req: any, res) => {
  try {
    const saved = await SavedOpportunity.find({ user: req.user.userId })
      .populate('opportunity')
      .sort({ createdAt: -1 });
    res.json(saved.map(s => s.opportunity));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved opportunities' });
  }
});

router.post('/saved/:id', authMiddleware, async (req: any, res) => {
  try {
    const existing = await SavedOpportunity.findOne({ user: req.user.userId, opportunity: req.params.id });
    if (existing) {
      await SavedOpportunity.deleteOne({ _id: existing._id });
      return res.json({ message: 'Opportunity unsaved', isSaved: false });
    }
    await SavedOpportunity.create({ user: req.user.userId, opportunity: req.params.id });
    res.json({ message: 'Opportunity saved', isSaved: true });
  } catch (error) {
    console.error('Failed to toggle save:', error);
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

// ================= NOTIFICATIONS =================

router.get('/notifications', authMiddleware, async (req: any, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', authMiddleware, async (req: any, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: { read: true } }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark read' });
  }
});

// ================= STATS =================

router.get('/stats', authMiddleware, async (req: any, res) => {
  try {
    const savedCount = await SavedOpportunity.countDocuments({ user: req.user.userId });
    const appliedCount = await Application.countDocuments({ user: req.user.userId });
    const unreadNotifications = await Notification.countDocuments({ user: req.user.userId, read: false });
    
    res.json({
      saved: savedCount,
      applied: appliedCount,
      unreadNotifications
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
