import { Router } from 'express';
import { sseHandler } from '../controllers/sse.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Endpoint for establishing the SSE connection
router.get('/', authenticate, sseHandler);

export default router;
