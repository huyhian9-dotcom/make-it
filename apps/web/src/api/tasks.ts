import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrap } from './client';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '@makeit/shared';

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.kind) params.set('kind', filters.kind);
  if (filters.groupId) params.set('group_id', filters.groupId);
  if (filters.status) params.set('status', filters.status);
  if (filters.labelId) params.set('label_id', filters.labelId);

  const res = await apiClient.get<{ success: true; data: Task[] }>(`/tasks?${params.toString()}`);
  return unwrap(res);
}

export async function getTask(id: string): Promise<Task> {
  const res = await apiClient.get<{ success: true; data: Task }>(`/tasks/${id}`);
  return unwrap(res);
}

export async function createTask(dto: CreateTaskDTO): Promise<Task> {
  const res = await apiClient.post<{ success: true; data: Task }>('/tasks', dto);
  return unwrap(res);
}

export async function updateTask(id: string, dto: UpdateTaskDTO): Promise<Task> {
  const res = await apiClient.patch<{ success: true; data: Task }>(`/tasks/${id}`, dto);
  return unwrap(res);
}

export async function toggleTask(id: string, done: boolean): Promise<Task> {
  const res = await apiClient.patch<{ success: true; data: Task }>(`/tasks/${id}/complete`, {
    done,
  });
  return unwrap(res);
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function toggleSubtask(subtaskId: string, done: boolean): Promise<void> {
  await apiClient.patch(`/subtasks/${subtaskId}`, { done });
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => toggleTask(id, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useToggleSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => toggleSubtask(id, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
