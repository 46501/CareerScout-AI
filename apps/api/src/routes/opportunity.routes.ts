import { Router } from 'express';
import { 
  getOpportunities, 
  getOpportunityById, 
  generateCoverLetter,
  getOpportunityStatus,
  syncOpportunities
} from '../controllers/opportunity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/status', getOpportunityStatus);
router.post('/sync', syncOpportunities);
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);
router.post('/:id/cover-letter', generateCoverLetter);

export default router;
