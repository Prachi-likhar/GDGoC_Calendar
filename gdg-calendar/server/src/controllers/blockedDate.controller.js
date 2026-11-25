import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createBlockedDate,
  deleteBlockedDate,
  listBlockedDates,
} from '../services/blockedDate.service.js';

export const getBlockedDates = asyncHandler(async (_req, res) => {
  const blockedDates = await listBlockedDates();
  res.status(200).json({ success: true, data: blockedDates });
});

export const postBlockedDate = asyncHandler(async (req, res) => {
  const blockedDate = await createBlockedDate(req.body);
  res.status(201).json({ success: true, data: blockedDate });
});

export const removeBlockedDate = asyncHandler(async (req, res) => {
  await deleteBlockedDate(req.params.id);
  res.status(200).json({ success: true, data: { message: 'Blocked date deleted' } });
});

