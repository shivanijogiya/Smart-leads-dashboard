import jwt from 'jsonwebtoken';
import type { NextFunction, Response } from 'express';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import type { AuthenticatedRequest, UserRole } from '../types.js';
import { AppError } from '../utils/appError.js';

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    next(new AppError('Authentication token is required', 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) {
      next(new AppError('User no longer exists', 401));
      return;
    }
    req.user = user.toSafeJSON();
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action', 403));
      return;
    }
    next();
  };
