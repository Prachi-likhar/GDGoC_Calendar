import { BlockedDate } from '../models/BlockedDate.js';
import { ApiError } from '../utils/ApiError.js';

export async function listBlockedDates() {
  return BlockedDate.find().sort({ startDate: 1 }).lean();
}

export async function createBlockedDate(payload) {
  return BlockedDate.create(payload);
}

export async function deleteBlockedDate(id) {
  const deleted = await BlockedDate.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Blocked date not found');
  }
  return deleted;
}

