import { Router } from 'express';
import { sseHandler } from '../controllers/sse.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Endpoint for establishing the SSE connection
router.get('/', requireAuth, sseHandler);

export default router;
