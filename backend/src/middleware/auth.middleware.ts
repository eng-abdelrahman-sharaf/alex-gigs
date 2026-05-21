import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.util';
import { AppError } from './error.middleware';
import pool from '../config/db';

// Extend Express Request interface to include req.user and req.freelancerId
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      freelancerId?: string; // Cache freelancer ID if present
    }
  }
}

/**
 * Authentication middleware to verify JWT token and attach user to Request.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Access denied. No token provided.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token.'));
  }
};

/**
 * Authorization middleware ensuring the authenticated user is onboarded as a Freelancer.
 * If yes, attaches the freelancer ID to the request object.
 */
export const requireFreelancer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    return next(new AppError(401, 'Authentication required.'));
  }

  try {
    const result = await pool.query(
      'SELECT id FROM freelancers WHERE buyer_id = $1',
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return next(new AppError(403, 'Access denied. You must be onboarded as a Freelancer.'));
    }

    req.freelancerId = result.rows[0].id.toString();
    next();
  } catch (error) {
    next(error);
  }
};
