import { apiClient, unwrap } from './client';
import type { AuthResult, LoginDTO, RegisterDTO } from '@makeit/shared';

export async function loginApi(dto: LoginDTO): Promise<AuthResult> {
  const res = await apiClient.post<{ success: true; data: AuthResult }>('/auth/login', dto);
  return unwrap(res);
}

export async function registerApi(dto: RegisterDTO): Promise<AuthResult> {
  const res = await apiClient.post<{ success: true; data: AuthResult }>('/auth/register', dto);
  return unwrap(res);
}
