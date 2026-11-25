import { apiClient } from './client.js';

export async function listRegistrationsRequest(eventId) {
  const { data } = await apiClient.get(`/events/${eventId}/registrations`);
  return data.data;
}

export async function getAttendanceRequest(eventId) {
  const { data } = await apiClient.get(`/events/${eventId}/attendance`);
  return data.data;
}

export async function checkInRequest(eventId, qrToken) {
  const { data } = await apiClient.post(`/events/${eventId}/checkin`, { qrToken });
  return data.data;
}

