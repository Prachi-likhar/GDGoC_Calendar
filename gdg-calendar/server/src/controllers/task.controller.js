import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createTask,
  deleteTask,
  listEventTasks,
  listMyTasks,
  updateTask,
} from '../services/task.service.js';

export const getEventTasks = asyncHandler(async (req, res) => {
  const tasks = await listEventTasks(req.params.id);
  res.status(200).json({ success: true, data: tasks });
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await listMyTasks(req.user.id);
  res.status(200).json({ success: true, data: tasks });
});

export const postTask = asyncHandler(async (req, res) => {
  const task = await createTask(req.params.id, req.body, req.user);
  res.status(201).json({ success: true, data: task });
});

export const patchTask = asyncHandler(async (req, res) => {
  const task = await updateTask(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: task });
});

export const removeTask = asyncHandler(async (req, res) => {
  await deleteTask(req.params.id, req.user);
  res.status(200).json({ success: true, data: { message: 'Task deleted' } });
});

