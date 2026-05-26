import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrap } from './client';
import type { Label, CreateLabelDTO, UpdateLabelDTO } from '@makeit/shared';

export async function getLabels(): Promise<Label[]> {
  const res = await apiClient.get<{ success: true; data: Label[] }>('/labels');
  return unwrap(res);
}

export async function createLabel(dto: CreateLabelDTO): Promise<Label> {
  const res = await apiClient.post<{ success: true; data: Label }>('/labels', dto);
  return unwrap(res);
}

export async function updateLabel(id: string, dto: UpdateLabelDTO): Promise<Label> {
  const res = await apiClient.patch<{ success: true; data: Label }>(`/labels/${id}`, dto);
  return unwrap(res);
}

export async function deleteLabel(id: string): Promise<void> {
  await apiClient.delete(`/labels/${id}`);
}

export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  });
}

export function useCreateLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLabel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labels'] }),
  });
}
