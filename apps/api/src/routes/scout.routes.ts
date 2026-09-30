import { Router } from 'express';
import { runScout, getScoutStatus } from '../controllers/scout.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/status', authenticate, getScoutStatus);
router.post('/run', authenticate, runScout);

export default router;
