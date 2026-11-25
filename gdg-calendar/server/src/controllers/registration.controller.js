import { asyncHandler } from '../utils/asyncHandler.js';
import {
  checkInAttendee,
  getAttendanceStats,
  getPublicEventBySlug,
  listEventRegistrations,
  listPublicEvents,
  registerForPublicEvent,
} from '../services/registration.service.js';

export const getPublicEvents = asyncHandler(async (_req, res) => {
  const events = await listPublicEvents();
  res.status(200).json({ success: true, data: events });
});

export const getPublicEvent = asyncHandler(async (req, res) => {
  const event = await getPublicEventBySlug(req.params.slug);
  res.status(200).json({ success: true, data: event });
});

export const postPublicRegister = asyncHandler(async (req, res) => {
  const result = await registerForPublicEvent(req.params.slug, req.body);
  res.status(201).json({ success: true, data: result });
});

export const getRegistrations = asyncHandler(async (req, res) => {
  const registrations = await listEventRegistrations(req.params.id);
  if (req.query.format === 'csv') {
    const header = 'Name,Email,Phone,Branch,Year,CheckedInAt\n';
    const rows = registrations
      .map((r) =>
        [
          r.name,
          r.email,
          r.phone,
          r.branch,
          r.year,
          r.checkedInAt ? new Date(r.checkedInAt).toISOString() : '',
        ]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="registrations-${req.params.id}.csv"`);
    return res.status(200).send(header + rows);
  }
  return res.status(200).json({ success: true, data: registrations });
});

export const getAttendance = asyncHandler(async (req, res) => {
  const stats = await getAttendanceStats(req.params.id);
  res.status(200).json({ success: true, data: stats });
});

export const postCheckIn = asyncHandler(async (req, res) => {
  const result = await checkInAttendee(req.params.id, req.body.qrToken);
  const io = req.app.get('io');
  if (io) {
    io.to(`event:${req.params.id}`).emit('checkin:new', {
      registration: result.registration,
      attendance: result.attendance,
    });
  }
  res.status(200).json({ success: true, data: result });
});

