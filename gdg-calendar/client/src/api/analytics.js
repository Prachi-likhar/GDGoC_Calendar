import { apiClient } from './client.js';

export async function getAnalyticsOverviewRequest() {
  const { data } = await apiClient.get('/analytics/overview');
  return data.data;
}

export async function getEventReportRequest(eventId) {
  const { data } = await apiClient.get(`/events/${eventId}/report`);
  return data.data;
}

export async function getEventFeedbackRequest(eventId) {
  const { data } = await apiClient.get(`/events/${eventId}/feedback`);
  return data.data;
}

export async function submitPublicFeedbackRequest(slug, payload) {
  const { data } = await apiClient.post(`/public/events/${slug}/feedback`, payload);
  return data.data;
}

export async function downloadBlob(url, filename) {
  const response = await apiClient.get(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

