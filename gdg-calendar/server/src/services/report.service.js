import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Feedback } from '../models/Feedback.js';
import { Registration } from '../models/Registration.js';
import { ApiError } from '../utils/ApiError.js';

export async function getAnalyticsOverview() {
  const [events, totalRegistrations, totalCheckedIn, feedbackAgg] = await Promise.all([
    Event.find({ status: { $ne: 'cancelled' } }).select('type startAt status').lean(),
    Registration.countDocuments(),
    Registration.countDocuments({ checkedInAt: { $ne: null } }),
    Feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }]),
  ]);

  const byTypeMap = {};
  const byMonthMap = {};

  for (const ev of events) {
    byTypeMap[ev.type] = (byTypeMap[ev.type] || 0) + 1;
    const d = new Date(ev.startAt);
    const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    byMonthMap[monthKey] = (byMonthMap[monthKey] || 0) + 1;
  }

  const byType = Object.entries(byTypeMap).map(([type, count]) => ({ type, count }));
  const byMonth = Object.entries(byMonthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, eventsCount]) => ({ month, events: eventsCount }));

  return {
    totals: {
      events: events.length,
      registrations: totalRegistrations,
      checkedIn: totalCheckedIn,
      attendanceRate:
        totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      averageRating: feedbackAgg[0]?.avgRating ? Number(feedbackAgg[0].avgRating.toFixed(2)) : 0,
      feedbackCount: feedbackAgg[0]?.count || 0,
    },
    byType,
    byMonth,
  };
}

export async function getEventReport(eventId) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const event = await Event.findById(eventId).lean();
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const [registrations, feedbacks] = await Promise.all([
    Registration.find({ eventId }).lean(),
    Feedback.find({ eventId }).sort({ createdAt: -1 }).lean(),
  ]);

  const registered = registrations.length;
  const checkedIn = registrations.filter((r) => Boolean(r.checkedInAt)).length;
  const noShowRate = registered > 0 ? Math.round(((registered - checkedIn) / registered) * 100) : 0;

  const branchSplit = {};
  const yearSplit = {};
  for (const r of registrations) {
    const branch = r.branch || 'Unknown';
    const year = r.year || 'Unknown';
    branchSplit[branch] = (branchSplit[branch] || 0) + 1;
    yearSplit[year] = (yearSplit[year] || 0) + 1;
  }

  const avgRating =
    feedbacks.length > 0
      ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2))
      : 0;

  return {
    event: {
      _id: event._id,
      title: event.title,
      type: event.type,
      startAt: event.startAt,
      endAt: event.endAt,
      venue: event.venue,
    },
    registered,
    checkedIn,
    noShowRate,
    branchSplit,
    yearSplit,
    averageRating: avgRating,
    feedbackCount: feedbacks.length,
    topComments: feedbacks
      .filter((f) => f.comments || f.liked)
      .slice(0, 10)
      .map((f) => ({ rating: f.rating, liked: f.liked, comments: f.comments })),
  };
}

export function generateReportPdfBuffer(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#4285F4').text('GDG Post-Event Report');
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('#0f172a').text(report.event.title);
    doc.fontSize(11).fillColor('#64748b').text(`Venue: ${report.event.venue || 'N/A'}`);
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#0f172a').text(`Registered: ${report.registered}`);
    doc.text(`Checked In: ${report.checkedIn}`);
    doc.text(`No-Show Rate: ${report.noShowRate}%`);
    doc.text(`Average Rating: ${report.averageRating} / 5 (${report.feedbackCount} responses)`);
    doc.moveDown(1);

    if (report.topComments.length > 0) {
      doc.fontSize(13).text('Top Feedback');
      doc.moveDown(0.4);
      for (const item of report.topComments) {
        doc
          .fontSize(10)
          .fillColor('#334155')
          .text(`• [${item.rating}/5] ${item.comments || item.liked}`);
      }
    }

    doc.end();
  });
}

