import { Router } from 'express';
import { getOpportunities, getOpportunityById } from '../controllers/opportunity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

export default router;
