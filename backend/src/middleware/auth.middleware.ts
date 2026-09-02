import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET is missing from environment variables.');
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const decoded = jwt.decode(token, secret);
    // Backward compatibility for existing tokens
    decoded.userId = decoded.userId || decoded.id;
    decoded.id = decoded.id || decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
