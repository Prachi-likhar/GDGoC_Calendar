import mongoose from 'mongoose';
import { USER_DOMAINS } from './User.js';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      enum: USER_DOMAINS,
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'medium',
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);

