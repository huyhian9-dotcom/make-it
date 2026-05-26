import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '@makeit/shared';

// Mock the tasks API module so hooks use our controlled functions
const mockToggleMutate = vi.fn();
vi.mock('../api/tasks', () => ({
  useToggleTask: () => ({
    mutate: mockToggleMutate,
    isPending: false,
  }),
  useToggleSubtask: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  toggleTask: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

const baseTask: Task = {
  id: 'task-1',
  userId: 'u1',
  groupId: null,
  labelId: null,
  title: 'Tarefa de teste',
  notes: null,
  kind: 'todo',
  dueDate: null,
  startsOn: null,
  endsOn: null,
  recurrence: null,
  groupTaskType: null,
  status: 'open',
  completedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  queryClient.clear();
});

test('renders task title', () => {
  render(
    <Wrapper>
      <TaskCard task={baseTask} />
    </Wrapper>,
  );
  expect(screen.getByText('Tarefa de teste')).toBeInTheDocument();
});

test('clicking checkbox calls toggleTask mutation', () => {
  render(
    <Wrapper>
      <TaskCard task={baseTask} />
    </Wrapper>,
  );

  const checkbox = screen.getByTestId('task-checkbox');
  fireEvent.click(checkbox);

  expect(mockToggleMutate).toHaveBeenCalledWith({ id: 'task-1', done: true });
});

test('done task shows line-through title', () => {
  const doneTask: Task = { ...baseTask, status: 'done' };

  render(
    <Wrapper>
      <TaskCard task={doneTask} />
    </Wrapper>,
  );

  const title = screen.getByText('Tarefa de teste');
  expect(title).toHaveClass('line-through');
});

test('task with subtasks shows expand button', () => {
  const taskWithSubtasks: Task = {
    ...baseTask,
    subtasks: [
      { id: 'st-1', taskId: 'task-1', title: 'Subtarefa 1', done: false, position: 0 },
      { id: 'st-2', taskId: 'task-1', title: 'Subtarefa 2', done: true, position: 1 },
    ],
  };

  render(
    <Wrapper>
      <TaskCard task={taskWithSubtasks} />
    </Wrapper>,
  );

  expect(screen.getByTestId('task-expand')).toBeInTheDocument();
});

test('expanding task shows subtask list', () => {
  const taskWithSubtasks: Task = {
    ...baseTask,
    subtasks: [
      { id: 'st-1', taskId: 'task-1', title: 'Subtarefa 1', done: false, position: 0 },
    ],
  };

  render(
    <Wrapper>
      <TaskCard task={taskWithSubtasks} />
    </Wrapper>,
  );

  fireEvent.click(screen.getByTestId('task-expand'));
  expect(screen.getByText('Subtarefa 1')).toBeInTheDocument();
  expect(screen.getByTestId('subtask-list')).toBeInTheDocument();
});
