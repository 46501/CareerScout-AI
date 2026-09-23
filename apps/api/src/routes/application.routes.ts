import { Router } from 'express';
import { getApplications, createApplication, updateApplication } from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);

export default router;
