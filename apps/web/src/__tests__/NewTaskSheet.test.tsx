import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NewTaskSheet } from '../components/NewTaskSheet';

const createTaskMutate = vi.hoisted(() => vi.fn());

vi.mock('../api/groups', () => ({
  useGroups: () => ({
    data: [{ id: 'group-1', name: 'Grupo QA' }],
    isLoading: false,
  }),
}));

vi.mock('../api/tasks', () => ({
  useCreateTask: () => ({
    mutate: createTaskMutate,
    isPending: false,
  }),
}));

beforeEach(() => {
  createTaskMutate.mockClear();
});

test('creates group task with selected group and type', async () => {
  render(<NewTaskSheet open onClose={vi.fn()} />);

  fireEvent.change(screen.getByLabelText('Título da tarefa'), {
    target: { value: 'Tarefa QA em grupo' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Tarefa em grupo' }));
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'group-1' },
  });

  fireEvent.click(screen.getByRole('button', { name: /avançar/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Tarefa Delegada' }));
  fireEvent.click(screen.getByRole('button', { name: /avançar/i }));
  fireEvent.click(screen.getByRole('button', { name: /make it/i }));

  await waitFor(() => {
    expect(createTaskMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Tarefa QA em grupo',
        groupId: 'group-1',
        groupTaskType: 'delegada',
      }),
      expect.any(Object),
    );
  });
});
