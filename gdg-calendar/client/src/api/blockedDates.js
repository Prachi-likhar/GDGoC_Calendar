import { apiClient } from './client.js';

export async function listBlockedDatesRequest() {
  const { data } = await apiClient.get('/blocked-dates');
  return data.data;
}

export async function createBlockedDateRequest(payload) {
  const { data } = await apiClient.post('/blocked-dates', payload);
  return data.data;
}

export async function deleteBlockedDateRequest(id) {
  const { data } = await apiClient.delete(`/blocked-dates/${id}`);
  return data.data;
}

