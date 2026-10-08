import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

const clients = new Map<string, Response>();

export const sseHandler = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 

  clients.set(userId, res);
  
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Connected to real-time stream' })}\n\n`);

  req.on('close', () => {
    clients.delete(userId);
  });
};

export const sendSSE = (userId: string, data: any) => {
  const client = clients.get(userId.toString());
  if (client) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};
