import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Session } from '../models/Session.js';
import { ApiError } from '../utils/ApiError.js';
import { generateQrDataUrl, generateQrToken } from '../utils/qr.js';
import { sendEmail } from './mail.service.js';

export async function listPublicEvents() {
  return Event.find({
    isPublic: true,
    status: { $ne: 'cancelled' },
  })
    .select('title type description venue startAt endAt status slug capacity registrationOpen posterUrl')
    .sort({ startAt: 1 })
    .lean();
}

export async function getPublicEventBySlug(slug) {
  const event = await Event.findOne({
    slug: slug.toLowerCase(),
    isPublic: true,
    status: { $ne: 'cancelled' },
  })
    .select('title type description venue startAt endAt status slug capacity registrationOpen posterUrl')
    .lean();

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const [sessions, registeredCount] = await Promise.all([
    Session.find({ eventId: event._id })
      .select('day title speaker startAt endAt order status')
      .sort({ day: 1, order: 1, startAt: 1 })
      .lean(),
    Registration.countDocuments({ eventId: event._id }),
  ]);

  return {
    ...event,
    sessions,
    registeredCount,
  };
}

export async function registerForPublicEvent(slug, payload) {
  const event = await Event.findOne({
    slug: slug.toLowerCase(),
    isPublic: true,
    status: { $ne: 'cancelled' },
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  if (!event.registrationOpen) {
    throw new ApiError(400, 'Registration is currently closed for this event');
  }

  if (event.capacity) {
    const count = await Registration.countDocuments({ eventId: event._id });
    if (count >= event.capacity) {
      throw new ApiError(409, 'Event has reached full capacity');
    }
  }

  const normalizedEmail = payload.email.toLowerCase();
  const existing = await Registration.findOne({ eventId: event._id, email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'This email is already registered for the event');
  }

  const qrToken = generateQrToken();
  const registration = await Registration.create({
    eventId: event._id,
    name: payload.name,
    email: normalizedEmail,
    phone: payload.phone || '',
    branch: payload.branch || '',
    year: payload.year || '',
    qrToken,
  });

  const qrDataUrl = await generateQrDataUrl(qrToken);

  sendEmail({
    to: registration.email,
    subject: `Registration confirmed: ${event.title}`,
    text: `Hi ${registration.name}, you are registered for ${event.title}. Your check-in code: ${qrToken}`,
    html: `<p>Hi ${registration.name},</p><p>You are registered for <strong>${event.title}</strong>.</p><p>Show this QR code at check-in (token: <code>${qrToken}</code>):</p><img src="${qrDataUrl}" alt="Check-in QR Code" />`,
  }).catch(() => {});

  return {
    registration,
    qrDataUrl,
    event: {
      _id: event._id,
      title: event.title,
      slug: event.slug,
      startAt: event.startAt,
      endAt: event.endAt,
      venue: event.venue,
    },
  };
}

export async function listEventRegistrations(eventId) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  return Registration.find({ eventId }).sort({ createdAt: -1 }).lean();
}

export async function getAttendanceStats(eventId) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const [registered, checkedIn] = await Promise.all([
    Registration.countDocuments({ eventId }),
    Registration.countDocuments({ eventId, checkedInAt: { $ne: null } }),
  ]);
  return { registered, checkedIn };
}

export async function checkInAttendee(eventId, qrToken) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const registration = await Registration.findOne({ eventId, qrToken });
  if (!registration) {
    throw new ApiError(404, 'Invalid QR token for this event');
  }
  if (registration.checkedInAt) {
    throw new ApiError(409, 'Attendee is already checked in');
  }

  registration.checkedInAt = new Date();
  await registration.save();

  const attendance = await getAttendanceStats(eventId);
  return { registration, attendance };
}

