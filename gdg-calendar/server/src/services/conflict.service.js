import { BlockedDate } from '../models/BlockedDate.js';
import { Event } from '../models/Event.js';

/**
 * Find overlapping non-cancelled events and blocked dates for a time window.
 */
export async function findConflicts({ startAt, endAt, excludeId } = {}) {
  const newStart = new Date(startAt);
  const newEnd = new Date(endAt);

  const eventQuery = {
    status: { $ne: 'cancelled' },
    startAt: { $lt: newEnd },
    endAt: { $gt: newStart },
  };
  if (excludeId) {
    eventQuery._id = { $ne: excludeId };
  }

  const [events, blockedDates] = await Promise.all([
    Event.find(eventQuery)
      .select('title type status startAt endAt venue')
      .sort({ startAt: 1 })
      .lean(),
    BlockedDate.find({
      startDate: { $lte: newEnd },
      endDate: { $gte: newStart },
    })
      .select('title reason startDate endDate')
      .sort({ startDate: 1 })
      .lean(),
  ]);

  return {
    hasConflicts: events.length > 0 || blockedDates.length > 0,
    events,
    blockedDates,
  };
}

