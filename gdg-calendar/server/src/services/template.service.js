import mongoose from 'mongoose';
import { Session } from '../models/Session.js';
import { Task } from '../models/Task.js';
import { Template } from '../models/Template.js';
import { ApiError } from '../utils/ApiError.js';

const MS_PER_DAY = 86400000;
const MS_PER_MIN = 60000;

export async function listTemplates() {
  return Template.find().sort({ name: 1 }).lean();
}

export async function createTemplate(payload) {
  return Template.create(payload);
}

export async function updateTemplate(id, payload) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Template not found');
  }
  const updated = await Template.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!updated) {
    throw new ApiError(404, 'Template not found');
  }
  return updated;
}

export async function deleteTemplate(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Template not found');
  }
  const deleted = await Template.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Template not found');
  }
  return deleted;
}

/**
 * Generate tasks (and optional default Day 1 sessions) from a template for an event.
 */
export async function generateFromTemplate(event, template) {
  if (!template) return { tasks: [], sessions: [] };

  const startMs = new Date(event.startAt).getTime();

  const taskDocs = (template.tasks || []).map((t) => ({
    eventId: event._id,
    title: t.title,
    domain: t.domain,
    dueDate: new Date(startMs - t.offsetDays * MS_PER_DAY),
    status: 'todo',
    priority: t.priority || 'medium',
  }));

  const sessionDocs = (template.defaultSessions || []).map((s, idx) => {
    const sStart = new Date(startMs + (s.offsetMinutes || 0) * MS_PER_MIN);
    const sEnd = new Date(sStart.getTime() + (s.durationMinutes || 60) * MS_PER_MIN);
    return {
      eventId: event._id,
      day: 1,
      title: s.title,
      startAt: sStart,
      endAt: sEnd,
      order: idx,
      status: 'upcoming',
    };
  });

  const [tasks, sessions] = await Promise.all([
    taskDocs.length ? Task.insertMany(taskDocs) : [],
    sessionDocs.length ? Session.insertMany(sessionDocs) : [],
  ]);

  return { tasks, sessions };
}

