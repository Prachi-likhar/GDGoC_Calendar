import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function listUsers() {
  return User.find().select('-passwordHash').sort({ name: 1 }).lean();
}

export async function updateUser(id, payload) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'User not found');
  }
  const updated = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .select('-passwordHash')
    .lean();

  if (!updated) {
    throw new ApiError(404, 'User not found');
  }
  return updated;
}

