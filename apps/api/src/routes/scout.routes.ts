import { Router } from 'express';
import { runScout } from '../controllers/scout.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/run', authenticate, runScout);

export default router;
