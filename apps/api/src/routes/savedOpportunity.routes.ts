import { Router } from 'express';
import { getSavedOpportunities, saveOpportunity, unsaveOpportunity } from '../controllers/savedOpportunity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getSavedOpportunities);
router.post('/', saveOpportunity);
router.delete('/:opportunityId', unsaveOpportunity);

export default router;
