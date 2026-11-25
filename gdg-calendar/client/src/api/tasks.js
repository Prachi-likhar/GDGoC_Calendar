import { apiClient } from './client.js';

export async function listEventTasksRequest(eventId) {
  const { data } = await apiClient.get(`/events/${eventId}/tasks`);
  return data.data;
}

export async function listMyTasksRequest() {
  const { data } = await apiClient.get('/tasks/mine');
  return data.data;
}

export async function createTaskRequest(eventId, payload) {
  const { data } = await apiClient.post(`/events/${eventId}/tasks`, payload);
  return data.data;
}

export async function updateTaskRequest(taskId, payload) {
  const { data } = await apiClient.patch(`/tasks/${taskId}`, payload);
  return data.data;
}

export async function deleteTaskRequest(taskId) {
  const { data } = await apiClient.delete(`/tasks/${taskId}`);
  return data.data;
}

