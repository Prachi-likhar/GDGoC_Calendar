import { asyncHandler } from '../utils/asyncHandler.js';
import { getCertificateByToken, streamCertificatesZip } from '../services/certificate.service.js';
import { listEventFeedback, submitPublicFeedback } from '../services/feedback.service.js';
import {
  generateReportPdfBuffer,
  getAnalyticsOverview,
  getEventReport,
} from '../services/report.service.js';

export const postPublicFeedback = asyncHandler(async (req, res) => {
  const feedback = await submitPublicFeedback(req.params.slug, req.body);
  res.status(201).json({ success: true, data: feedback });
});

export const getFeedback = asyncHandler(async (req, res) => {
  const data = await listEventFeedback(req.params.id);
  res.status(200).json({ success: true, data });
});

export const getPublicCertificate = asyncHandler(async (req, res) => {
  const { pdfBuffer, registration } = await getCertificateByToken(req.params.qrToken);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="certificate-${registration.qrToken.slice(0, 8)}.pdf"`
  );
  res.status(200).send(pdfBuffer);
});

export const getCertificatesZip = asyncHandler(async (req, res) => {
  await streamCertificatesZip(req.params.id, res);
});

export const getOverview = asyncHandler(async (_req, res) => {
  const overview = await getAnalyticsOverview();
  res.status(200).json({ success: true, data: overview });
});

export const getReport = asyncHandler(async (req, res) => {
  const report = await getEventReport(req.params.id);
  if (req.query.format === 'pdf') {
    const pdfBuffer = await generateReportPdfBuffer(report);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.pdf"`);
    return res.status(200).send(pdfBuffer);
  }
  return res.status(200).json({ success: true, data: report });
});

