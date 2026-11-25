import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const auth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.id).select('_id role domain isActive');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User account is inactive or no longer exists');
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
    domain: user.domain,
  };
  next();
});

