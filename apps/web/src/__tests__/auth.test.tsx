import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Register } from '../pages/Register';
import { useAuthStore } from '../store/auth';
import * as authApi from '../api/auth';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
});

test('submit register calls API and stores token', async () => {
  const mockUser = {
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    bio: null,
    avatarUrl: null,
    preferences: { theme: 'light' as const, push: false, cloudSync: false },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const registerSpy = vi.spyOn(authApi, 'registerApi').mockResolvedValueOnce({
    token: 'test-token-123',
    user: mockUser,
  });

  render(
    <Wrapper>
      <Register />
    </Wrapper>,
  );

  fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
    target: { value: 'Test User' },
  });
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Senha'), {
    target: { value: 'password123' },
  });

  fireEvent.click(screen.getByRole('button', { name: /make it/i }));

  await waitFor(() => {
    expect(registerSpy).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  await waitFor(() => {
    const { token } = useAuthStore.getState();
    expect(token).toBe('test-token-123');
  });
});
