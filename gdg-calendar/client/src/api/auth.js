import { apiClient } from './client.js';

export async function loginRequest(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data.data;
}

export async function getMeRequest() {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
}

export async function changePasswordRequest(payload) {
  const { data } = await apiClient.patch('/auth/password', payload);
  return data.data;
}

