import { asyncHandler } from '../utils/asyncHandler.js';
import { findConflicts } from '../services/conflict.service.js';
import {
  createEvent,
  deleteEvent,
  duplicateEvent,
  getEventById,
  listEvents,
  updateEvent,
} from '../services/event.service.js';

export const getEvents = asyncHandler(async (req, res) => {
  const events = await listEvents(req.query);
  res.status(200).json({ success: true, data: events });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await getEventById(req.params.id);
  res.status(200).json({ success: true, data: event });
});

export const postEvent = asyncHandler(async (req, res) => {
  const force = req.query.force === 'true';
  const event = await createEvent(req.body, req.user, { force });
  res.status(201).json({ success: true, data: event });
});

export const patchEvent = asyncHandler(async (req, res) => {
  const force = req.query.force === 'true';
  const event = await updateEvent(req.params.id, req.body, req.user, { force });
  res.status(200).json({ success: true, data: event });
});

export const removeEvent = asyncHandler(async (req, res) => {
  await deleteEvent(req.params.id);
  res.status(200).json({ success: true, data: { message: 'Event deleted' } });
});

export const copyEvent = asyncHandler(async (req, res) => {
  const event = await duplicateEvent(req.params.id, req.user);
  res.status(201).json({ success: true, data: event });
});

export const previewConflicts = asyncHandler(async (req, res) => {
  const clashes = await findConflicts(req.query);
  res.status(200).json({ success: true, data: clashes });
});

