import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { ApiError } from '../utils/ApiError.js';

export function generateCertificatePdfBuffer({
  attendeeName,
  eventTitle,
  eventDate,
  verificationCode,
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(3).stroke('#4285F4');

    doc
      .fontSize(14)
      .fillColor('#4285F4')
      .text('GOOGLE DEVELOPER GROUPS ON CAMPUS', { align: 'center' });
    doc.moveDown(0.8);
    doc.fontSize(34).fillColor('#0f172a').text('Certificate of Participation', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(14).fillColor('#475569').text('This is proudly presented to', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(28).fillColor('#1e293b').text(attendeeName, { align: 'center' });
    doc.moveDown(0.7);
    doc
      .fontSize(14)
      .fillColor('#475569')
      .text(`for actively participating in ${eventTitle}`, { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(12).fillColor('#64748b').text(`Held on ${eventDate}`, { align: 'center' });

    doc.moveDown(2.2);
    doc
      .fontSize(10)
      .fillColor('#94a3b8')
      .text(`Verification Code: ${verificationCode}`, { align: 'center' });

    doc.end();
  });
}

export async function getCertificateByToken(qrToken) {
  const registration = await Registration.findOne({ qrToken }).populate('eventId', 'title startAt');
  if (!registration) {
    throw new ApiError(404, 'Certificate registration not found');
  }
  if (!registration.checkedInAt) {
    throw new ApiError(403, 'Certificate is only available for checked-in attendees');
  }

  const eventDate = new Date(registration.eventId.startAt).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const pdfBuffer = await generateCertificatePdfBuffer({
    attendeeName: registration.name,
    eventTitle: registration.eventId.title,
    eventDate,
    verificationCode: registration.qrToken,
  });

  if (!registration.certificateIssued) {
    registration.certificateIssued = true;
    await registration.save();
  }

  return { pdfBuffer, registration };
}

export async function streamCertificatesZip(eventId, res) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(404, 'Event not found');
  }
  const event = await Event.findById(eventId).lean();
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const attendees = await Registration.find({
    eventId,
    checkedInAt: { $ne: null },
  });

  if (attendees.length === 0) {
    throw new ApiError(404, 'No checked-in attendees found for this event');
  }

  const eventDate = new Date(event.startAt).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="certificates-${event.slug}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  for (const reg of attendees) {
    const buffer = await generateCertificatePdfBuffer({
      attendeeName: reg.name,
      eventTitle: event.title,
      eventDate,
      verificationCode: reg.qrToken,
    });
    const safeName = reg.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    archive.append(buffer, { name: `${safeName}-${reg.qrToken.slice(0, 6)}.pdf` });
    if (!reg.certificateIssued) {
      reg.certificateIssued = true;
      await reg.save();
    }
  }

  await archive.finalize();
}

