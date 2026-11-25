import { apiClient } from './client.js';

export async function listEventsRequest(params = {}) {
  const { data } = await apiClient.get('/events', { params });
  return data.data;
}

export async function getEventRequest(id) {
  const { data } = await apiClient.get(`/events/${id}`);
  return data.data;
}

export async function createEventRequest(payload, { force = false } = {}) {
  const { data } = await apiClient.post('/events', payload, {
    params: force ? { force: 'true' } : undefined,
  });
  return data.data;
}

export async function updateEventRequest(id, payload, { force = false } = {}) {
  const { data } = await apiClient.patch(`/events/${id}`, payload, {
    params: force ? { force: 'true' } : undefined,
  });
  return data.data;
}

export async function deleteEventRequest(id) {
  const { data } = await apiClient.delete(`/events/${id}`);
  return data.data;
}

export async function duplicateEventRequest(id) {
  const { data } = await apiClient.post(`/events/${id}/duplicate`);
  return data.data;
}

