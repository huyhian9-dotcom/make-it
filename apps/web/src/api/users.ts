import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrap } from './client';
import type { User, UpdateUserDTO, UpdatePreferencesDTO } from '@makeit/shared';

export async function getMe(): Promise<User> {
  const res = await apiClient.get<{ success: true; data: User }>('/users/me');
  return unwrap(res);
}

export async function updateMe(dto: UpdateUserDTO): Promise<User> {
  const res = await apiClient.patch<{ success: true; data: User }>('/users/me', dto);
  return unwrap(res);
}

export async function updatePreferences(dto: UpdatePreferencesDTO): Promise<User> {
  const res = await apiClient.patch<{ success: true; data: User }>('/users/me/preferences', dto);
  return unwrap(res);
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (user) => {
      qc.setQueryData(['me'], user);
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (user) => {
      qc.setQueryData(['me'], user);
    },
  });
}
