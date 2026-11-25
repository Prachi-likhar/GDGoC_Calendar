import { apiClient } from './client.js';

export async function listTemplatesRequest() {
  const { data } = await apiClient.get('/templates');
  return data.data;
}

export async function createTemplateRequest(payload) {
  const { data } = await apiClient.post('/templates', payload);
  return data.data;
}

export async function updateTemplateRequest(id, payload) {
  const { data } = await apiClient.patch(`/templates/${id}`, payload);
  return data.data;
}

export async function deleteTemplateRequest(id) {
  const { data } = await apiClient.delete(`/templates/${id}`);
  return data.data;
}

