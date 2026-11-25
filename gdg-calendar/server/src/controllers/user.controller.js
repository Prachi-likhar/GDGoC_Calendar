import { asyncHandler } from '../utils/asyncHandler.js';
import { listUsers, updateUser } from '../services/user.service.js';

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await listUsers();
  res.status(200).json({ success: true, data: users });
});

export const patchUser = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data: user });
});

