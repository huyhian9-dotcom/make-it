import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrap } from './client';
import type { RoutineBlock, CreateRoutineBlockDTO, UpdateRoutineBlockDTO } from '@makeit/shared';

export async function getRoutineBlocks(): Promise<RoutineBlock[]> {
  const res = await apiClient.get<{ success: true; data: RoutineBlock[] }>('/routine-blocks');
  return unwrap(res);
}

export async function createRoutineBlock(dto: CreateRoutineBlockDTO): Promise<RoutineBlock> {
  const res = await apiClient.post<{ success: true; data: RoutineBlock }>('/routine-blocks', dto);
  return unwrap(res);
}

export async function updateRoutineBlock(
  id: string,
  dto: UpdateRoutineBlockDTO,
): Promise<RoutineBlock> {
  const res = await apiClient.patch<{ success: true; data: RoutineBlock }>(
    `/routine-blocks/${id}`,
    dto,
  );
  return unwrap(res);
}

export async function deleteRoutineBlock(id: string): Promise<void> {
  await apiClient.delete(`/routine-blocks/${id}`);
}

export function useRoutineBlocks() {
  return useQuery({
    queryKey: ['routine-blocks'],
    queryFn: getRoutineBlocks,
  });
}

export function useCreateRoutineBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRoutineBlock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine-blocks'] }),
  });
}

export function useDeleteRoutineBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRoutineBlock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine-blocks'] }),
  });
}
