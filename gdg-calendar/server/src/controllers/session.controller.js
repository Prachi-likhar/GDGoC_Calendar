import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createSession,
  deleteSession,
  listEventSessions,
  reorderSessions,
  updateSession,
} from '../services/session.service.js';

export const getEventSessions = asyncHandler(async (req, res) => {
  const sessions = await listEventSessions(req.params.id);
  res.status(200).json({ success: true, data: sessions });
});

export const postSession = asyncHandler(async (req, res) => {
  const session = await createSession(req.params.id, req.body, req.user);
  res.status(201).json({ success: true, data: session });
});

export const patchSession = asyncHandler(async (req, res) => {
  const session = await updateSession(req.params.id, req.body, req.user);
  const io = req.app.get('io');
  if (io) {
    io.to(`event:${session.eventId}`).emit('session:updated', session);
  }
  res.status(200).json({ success: true, data: session });
});

export const patchReorderSessions = asyncHandler(async (req, res) => {
  const sessions = await reorderSessions(req.params.id, req.body.items, req.user);
  const io = req.app.get('io');
  if (io) {
    io.to(`event:${req.params.id}`).emit('session:reordered', sessions);
  }
  res.status(200).json({ success: true, data: sessions });
});

export const removeSession = asyncHandler(async (req, res) => {
  await deleteSession(req.params.id, req.user);
  res.status(200).json({ success: true, data: { message: 'Session deleted' } });
});

