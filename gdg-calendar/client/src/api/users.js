import { apiClient } from './client.js';

export async function listUsersRequest() {
  const { data } = await apiClient.get('/users');
  return data.data;
}

export async function createUserRequest(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data.data;
}

export async function updateUserRequest(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data.data;
}

