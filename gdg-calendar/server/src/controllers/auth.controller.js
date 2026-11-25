import { asyncHandler } from '../utils/asyncHandler.js';
import {
  changeUserPassword,
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/auth.service.js';

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);
  res.status(200).json({ success: true, data });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  res.status(200).json({ success: true, data: user });
});

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({ success: true, data: user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = await changeUserPassword(req.user.id, req.body);
  res.status(200).json({ success: true, data });
});

