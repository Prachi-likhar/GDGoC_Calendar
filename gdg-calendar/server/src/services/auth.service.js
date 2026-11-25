import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const BCRYPT_ROUNDS = 10;

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    domain: user.domain,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      domain: user.domain,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);
  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive');
  }
  return sanitizeUser(user);
}

export async function registerUser({ name, email, password, role, domain }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    domain,
  });

  return sanitizeUser(user);
}

export async function changeUserPassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.save();

  return { message: 'Password updated successfully' };
}

