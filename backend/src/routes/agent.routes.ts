import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';
import { runAgent } from '../agent/agent';

const router = express.Router();

// Strict rate limit for agent runs
const agentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each user to 5 agent runs per hour
  message: { error: 'You have exceeded the maximum allowed agent runs. Please try again later.' }
});

router.post('/run', authMiddleware, agentLimiter, async (req, res) => {
  try {
    // In a full application, verify the user has permissions/credits to run the agent
    const result = await runAgent();
    res.json({ message: 'Agent run completed successfully.', result });
  } catch (error) {
    console.error('Agent run error:', error);
    res.status(500).json({ error: 'Failed to run the agent. Please try again later.' });
  }
});

export default router;
