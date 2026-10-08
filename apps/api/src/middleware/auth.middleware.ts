import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }
  
  if (!token) {
    res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      return;
    }
    
    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
      return;
    }
    
    next();
  };
};
