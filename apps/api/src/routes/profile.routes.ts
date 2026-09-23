import { Router } from 'express';
import { getProfile, updateProfile, getProfileCompletion } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/completion', getProfileCompletion);
router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
