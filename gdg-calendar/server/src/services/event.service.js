import crypto from 'crypto';
import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Session } from '../models/Session.js';
import { Task } from '../models/Task.js';
import { Template } from '../models/Template.js';
import { ApiError } from '../utils/ApiError.js';
import { findConflicts } from './conflict.service.js';
import { generateFromTemplate } from './template.service.js';

function buildSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base || 'event'}-${suffix}`;
}

function assertEventEditPermission(event, user) {
  if (user.role === 'admin') {
    return;
  }
  if (user.role === 'domain_head') {
    const isOwner = event.owner.toString() === user.id;
    const isTeamMember = event.team.some((memberId) => memberId.toString() === user.id);
    if (isOwner || isTeamMember) {
      return;
    }
  }
  throw new ApiError(403, 'Forbidden: you do not have permission to modify this event');
}

export async function listEvents({ from, to, status, type } = {}) {
  const query = {};
  if (from && to) {
    query.startAt = { $lte: new Date(to) };
    query.endAt = { $gte: new Date(from) };
  } else if (from) {
    query.endAt = { $gte: new Date(from) };
  } else if (to) {
    query.startAt = { $lte: new Date(to) };
  }
  if (status) {
    query.status = status;
  }
  if (type) {
    query.type = type;
  }

  return Event.find(query)
    .populate('owner', 'name email domain role')
    .populate('team', 'name email domain role')
    .sort({ startAt: 1 })
    .lean();
}

export async function getEventById(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Event not found');
  }
  const event = await Event.findById(id)
    .populate('owner', 'name email domain role')
    .populate('team', 'name email domain role')
    .lean();

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const [sessions, tasks] = await Promise.all([
    Session.find({ eventId: id })
      .populate('assignee', 'name email domain')
      .sort({ day: 1, order: 1, startAt: 1 })
      .lean(),
    Task.find({ eventId: id }).select('status').lean(),
  ]);

  const taskSummary = tasks.reduce(
    (acc, t) => {
      acc.total += 1;
      if (acc[t.status] !== undefined) acc[t.status] += 1;
      return acc;
    },
    { total: 0, todo: 0, in_progress: 0, done: 0 }
  );

  return {
    ...event,
    sessions,
    taskSummary,
  };
}

export async function createEvent(payload, user, { force = false } = {}) {
  if (!force) {
    const clashes = await findConflicts({
      startAt: payload.startAt,
      endAt: payload.endAt,
    });
    if (clashes.hasConflicts) {
      throw new ApiError(
        409,
        'Event schedule conflicts with existing events or blocked dates',
        undefined,
        {
          warning: 'Schedule conflict detected. Pass ?force=true to save anyway.',
          clashes,
        }
      );
    }
  }

  let template = null;
  if (payload.templateId) {
    if (!mongoose.isValidObjectId(payload.templateId)) {
      throw new ApiError(404, 'Template not found');
    }
    template = await Template.findById(payload.templateId).lean();
    if (!template) {
      throw new ApiError(404, 'Template not found');
    }
  }

  const slug = payload.slug ? payload.slug.toLowerCase() : buildSlug(payload.title);
  const created = await Event.create({
    ...payload,
    slug,
    owner: payload.owner || user.id,
  });

  if (template) {
    await generateFromTemplate(created, template);
  }

  return Event.findById(created._id)
    .populate('owner', 'name email domain role')
    .populate('team', 'name email domain role')
    .lean();
}

export async function updateEvent(id, payload, user, { force = false } = {}) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Event not found');
  }
  const existing = await Event.findById(id);
  if (!existing) {
    throw new ApiError(404, 'Event not found');
  }

  assertEventEditPermission(existing, user);

  const nextStartAt = payload.startAt ? new Date(payload.startAt) : existing.startAt;
  const nextEndAt = payload.endAt ? new Date(payload.endAt) : existing.endAt;
  if (nextEndAt <= nextStartAt) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'endAt', message: 'End time must be after start time' },
    ]);
  }

  if (!force) {
    const clashes = await findConflicts({
      startAt: nextStartAt,
      endAt: nextEndAt,
      excludeId: existing._id,
    });
    if (clashes.hasConflicts) {
      throw new ApiError(
        409,
        'Event schedule conflicts with existing events or blocked dates',
        undefined,
        {
          warning: 'Schedule conflict detected. Pass ?force=true to save anyway.',
          clashes,
        }
      );
    }
  }

  Object.assign(existing, payload);
  await existing.save();

  return Event.findById(existing._id)
    .populate('owner', 'name email domain role')
    .populate('team', 'name email domain role')
    .lean();
}

export async function deleteEvent(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Event not found');
  }
  const deleted = await Event.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Event not found');
  }
  await Promise.all([Task.deleteMany({ eventId: id }), Session.deleteMany({ eventId: id })]);
  return deleted;
}

export async function duplicateEvent(id, user) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Event not found');
  }
  const source = await Event.findById(id).lean();
  if (!source) {
    throw new ApiError(404, 'Event not found');
  }

  const copyTitle = `${source.title} (Copy)`;
  const duplicated = await Event.create({
    title: copyTitle,
    type: source.type,
    description: source.description,
    venue: source.venue,
    startAt: source.startAt,
    endAt: source.endAt,
    status: 'idea',
    owner: user.id,
    team: source.team || [],
    posterUrl: source.posterUrl || '',
    isPublic: false,
    registrationOpen: false,
    ...(source.capacity ? { capacity: source.capacity } : {}),
    ...(source.templateId ? { templateId: source.templateId } : {}),
    slug: buildSlug(copyTitle),
  });

  const [sourceTasks, sourceSessions] = await Promise.all([
    Task.find({ eventId: id }).lean(),
    Session.find({ eventId: id }).lean(),
  ]);

  await Promise.all([
    sourceTasks.length
      ? Task.insertMany(
        sourceTasks.map((t) => ({
          eventId: duplicated._id,
          title: t.title,
          domain: t.domain,
          assignee: t.assignee,
          dueDate: t.dueDate,
          status: 'todo',
          priority: t.priority,
        }))
      )
      : Promise.resolve(),
    sourceSessions.length
      ? Session.insertMany(
        sourceSessions.map((s) => ({
          eventId: duplicated._id,
          day: s.day,
          title: s.title,
          speaker: s.speaker,
          startAt: s.startAt,
          endAt: s.endAt,
          order: s.order,
          notes: s.notes,
          assignee: s.assignee,
          status: 'upcoming',
        }))
      )
      : Promise.resolve(),
  ]);

  return Event.findById(duplicated._id)
    .populate('owner', 'name email domain role')
    .populate('team', 'name email domain role')
    .lean();
}

