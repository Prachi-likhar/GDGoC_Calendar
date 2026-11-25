import { apiClient } from './client.js';

export async function listPublicEventsRequest() {
  const { data } = await apiClient.get('/public/events');
  return data.data;
}

export async function getPublicEventRequest(slug) {
  const { data } = await apiClient.get(`/public/events/${slug}`);
  return data.data;
}

export async function registerPublicEventRequest(slug, payload) {
  const { data } = await apiClient.post(`/public/events/${slug}/register`, payload);
  return data.data;
}

