import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Session } from '../models/Session.js';
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

export async function listEventSessions(eventId) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  return Session.find({ eventId })
    .populate('assignee', 'name email domain')
    .sort({ day: 1, order: 1, startAt: 1 })
    .lean();
}

export async function createSession(eventId, payload, user) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  if (!isEventOwnerOrTeam(event, user)) {
    throw new ApiError(403, 'Forbidden: only admin or event organisers can add sessions');
  }

  const day = payload.day || 1;
  const maxOrderDoc = await Session.findOne({ eventId, day }).sort({ order: -1 }).lean();
  const nextOrder = payload.order ?? (maxOrderDoc ? maxOrderDoc.order + 1 : 0);

  const created = await Session.create({
    ...payload,
    eventId,
    day,
    order: nextOrder,
  });

  return Session.findById(created._id).populate('assignee', 'name email domain').lean();
}

export async function updateSession(sessionId, payload, user) {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new ApiError(404, 'Session not found');
  }
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  const event = await Event.findById(session.eventId);
  if (!event || !isEventOwnerOrTeam(event, user)) {
    throw new ApiError(403, 'Forbidden: only admin or event organisers can edit sessions');
  }

  Object.assign(session, payload);
  await session.save();

  return Session.findById(session._id).populate('assignee', 'name email domain').lean();
}

export async function reorderSessions(eventId, items, user) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  if (!isEventOwnerOrTeam(event, user)) {
    throw new ApiError(403, 'Forbidden: only admin or event organisers can reorder sessions');
  }

  await Promise.all(
    items.map(({ id, day, order }) =>
      Session.findOneAndUpdate({ _id: id, eventId }, { day, order })
    )
  );

  return listEventSessions(eventId);
}

export async function deleteSession(sessionId, user) {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new ApiError(404, 'Session not found');
  }
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  const event = await Event.findById(session.eventId);
  if (event && !isEventOwnerOrTeam(event, user)) {
    throw new ApiError(403, 'Forbidden: only admin or event organisers can delete sessions');
  }

  await session.deleteOne();
  return session;
}

