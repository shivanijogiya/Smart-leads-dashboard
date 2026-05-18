import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { User } from '../models/user.model.js';
import type { AuthenticatedRequest } from '../types.js';
import { created, ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

const signToken = (id: string): string =>
  jwt.sign(
    { id },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] }
  );

export const register = asyncHandler(async (req, res: Response) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await User.create(req.body);
  res.status(201).json(
    created('Registration successful', {
      token: signToken(user._id.toString()),
      user: user.toSafeJSON(),
    })
  );
});

export const login = asyncHandler(async (req, res: Response) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json(
    ok('Login successful', {
      token: signToken(user._id.toString()),
      user: user.toSafeJSON(),
    })
  );
});

export const me = asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  res.json(ok('User fetched successfully', req.user));
});
