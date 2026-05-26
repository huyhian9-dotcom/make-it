import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrap } from './client';
import type { Group, Task, CreateGroupDTO, UpdateGroupDTO } from '@makeit/shared';

export async function getGroups(): Promise<Group[]> {
  const res = await apiClient.get<{ success: true; data: Group[] }>('/groups');
  return unwrap(res);
}

export async function getGroup(id: string): Promise<Group> {
  const res = await apiClient.get<{ success: true; data: Group }>(`/groups/${id}`);
  return unwrap(res);
}

export async function createGroup(dto: CreateGroupDTO): Promise<Group> {
  const res = await apiClient.post<{ success: true; data: Group }>('/groups', dto);
  return unwrap(res);
}

export async function updateGroup(id: string, dto: UpdateGroupDTO): Promise<Group> {
  const res = await apiClient.patch<{ success: true; data: Group }>(`/groups/${id}`, dto);
  return unwrap(res);
}

export async function getGroupTasks(groupId: string): Promise<Task[]> {
  const res = await apiClient.get<{ success: true; data: Task[] }>(`/groups/${groupId}/tasks`);
  return unwrap(res);
}

export async function createGroupInvite(
  groupId: string,
  email?: string,
): Promise<{ token: string }> {
  const res = await apiClient.post<{ success: true; data: { token: string } }>(
    `/groups/${groupId}/invites`,
    { email: email ?? null },
  );
  return unwrap(res);
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id),
    enabled: !!id,
  });
}

export function useGroupTasks(groupId: string) {
  return useQuery({
    queryKey: ['group-tasks', groupId],
    queryFn: () => getGroupTasks(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}
