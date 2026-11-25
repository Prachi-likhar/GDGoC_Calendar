import { apiClient } from './client.js';

export async function listEventSessionsRequest(eventId) {
  const { data } = await apiClient.get(`/events/${eventId}/sessions`);
  return data.data;
}

export async function createSessionRequest(eventId, payload) {
  const { data } = await apiClient.post(`/events/${eventId}/sessions`, payload);
  return data.data;
}

export async function updateSessionRequest(sessionId, payload) {
  const { data } = await apiClient.patch(`/sessions/${sessionId}`, payload);
  return data.data;
}

export async function reorderSessionsRequest(eventId, items) {
  const { data } = await apiClient.patch(`/events/${eventId}/sessions/reorder`, { items });
  return data.data;
}

export async function deleteSessionRequest(sessionId) {
  const { data } = await apiClient.delete(`/sessions/${sessionId}`);
  return data.data;
}

