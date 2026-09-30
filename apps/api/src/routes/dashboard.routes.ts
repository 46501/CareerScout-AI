import { Router } from 'express';
import { getDashboardStats, getDashboardTrends, getDashboardSkills } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/trends', getDashboardTrends);
router.get('/skills', getDashboardSkills);

export default router;
