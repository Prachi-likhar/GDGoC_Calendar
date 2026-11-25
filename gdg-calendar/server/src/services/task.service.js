import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';

function isEventOwnerOrTeam(event, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'domain_head') {
    const isOwner = event.owner.toString() === user.id;
    const isTeam = event.team.some((m) => m.toString() === user.id);
    return isOwner || isTeam;
  }
  return false;
}

export async function listEventTasks(eventId) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  return Task.find({ eventId })
    .populate('assignee', 'name email domain role')
    .sort({ dueDate: 1, createdAt: 1 })
    .lean();
}

export async function listMyTasks(userId) {
  return Task.find({ assignee: userId })
    .populate('eventId', 'title startAt endAt status')
    .sort({ dueDate: 1 })
    .lean();
}

export async function createTask(eventId, payload, user) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  if (!isEventOwnerOrTeam(event, user)) {
    throw new ApiError(403, 'Forbidden: only admin or event organisers can create tasks');
  }

  const created = await Task.create({
    ...payload,
    eventId,
  });
  return Task.findById(created._id).populate('assignee', 'name email domain role').lean();
}

export async function updateTask(taskId, payload, user) {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(404, 'Task not found');
  }
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const event = await Event.findById(task.eventId);
  if (!event) {
    throw new ApiError(404, 'Parent event not found');
  }

  const canFullEdit = isEventOwnerOrTeam(event, user);
  const isAssignee = task.assignee && task.assignee.toString() === user.id;

  if (!canFullEdit && !isAssignee) {
    throw new ApiError(403, 'Forbidden: you cannot update this task');
  }

  if (!canFullEdit && isAssignee) {
    const keys = Object.keys(payload);
    if (keys.some((k) => k !== 'status')) {
      throw new ApiError(403, 'Forbidden: assignees may only update task status');
    }
  }

  Object.assign(task, payload);
  await task.save();

  return Task.findById(task._id).populate('assignee', 'name email domain role').lean();
}

export async function deleteTask(taskId, user) {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(404, 'Task not found');
  }
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const event = await Event.findById(task.eventId);
  if (event && !isEventOwnerOrTeam(event, user)) {
    throw new ApiError(403, 'Forbidden: only admin or event organisers can delete tasks');
  }

  await task.deleteOne();
  return task;
}

