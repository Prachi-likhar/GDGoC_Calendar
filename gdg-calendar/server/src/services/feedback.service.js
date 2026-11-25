import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Feedback } from '../models/Feedback.js';
import { Registration } from '../models/Registration.js';
import { ApiError } from '../utils/ApiError.js';

export async function submitPublicFeedback(slug, { qrToken, rating, liked, improve, comments }) {
  const event = await Event.findOne({ slug: slug.toLowerCase(), isPublic: true }).lean();
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const registration = await Registration.findOne({ eventId: event._id, qrToken }).lean();
  if (!registration) {
    throw new ApiError(404, 'Invalid registration token for this event');
  }

  const existing = await Feedback.findOne({ registrationId: registration._id }).lean();
  if (existing) {
    throw new ApiError(409, 'Feedback has already been submitted for this registration');
  }

  return Feedback.create({
    eventId: event._id,
    registrationId: registration._id,
    rating,
    liked: liked || '',
    improve: improve || '',
    comments: comments || '',
  });
}

export async function listEventFeedback(eventId) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const items = await Feedback.find({ eventId }).sort({ createdAt: -1 }).lean();
  const count = items.length;
  const averageRating =
    count > 0 ? Number((items.reduce((s, f) => s + f.rating, 0) / count).toFixed(2)) : 0;

  return {
    summary: { count, averageRating },
    items,
  };
}

