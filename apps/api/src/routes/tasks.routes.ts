import { Router } from 'express';
import { z } from 'zod';
import { tasksController } from '../controllers/tasks.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

export const taskRoutes = Router();

const recurrenceSchema = z.object({
  freq: z.enum(['daily', 'weekly']),
  daysOfWeek: z.array(z.number()).optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1),
  notes: z.string().nullable().optional(),
  kind: z.enum(['todo', 'habit', 'deadline']).optional(),
  groupId: z.string().nullable().optional(),
  labelId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  startsOn: z.string().nullable().optional(),
  endsOn: z.string().nullable().optional(),
  recurrence: recurrenceSchema.nullable().optional(),
  groupTaskType: z.enum(['livre', 'delegada', 'mutirao', 'acao_global']).nullable().optional(),
  assignees: z.array(z.string()).optional(),
  subtasks: z.array(z.object({
    title: z.string().min(1),
    done: z.boolean().optional(),
    position: z.number().optional(),
  })).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

const completeSchema = z.object({
  done: z.boolean(),
});

const subtaskSchema = z.object({
  title: z.string().min(1),
  done: z.boolean().optional(),
  position: z.number().optional(),
});

const updateSubtaskSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
  position: z.number().optional(),
});

taskRoutes.get('/', requireAuth, tasksController.list);
taskRoutes.post('/', requireAuth, validate(createTaskSchema), tasksController.create);
taskRoutes.get('/:id', requireAuth, tasksController.get);
taskRoutes.patch('/:id', requireAuth, validate(updateTaskSchema), tasksController.update);
taskRoutes.patch('/:id/complete', requireAuth, validate(completeSchema), tasksController.complete);
taskRoutes.delete('/:id', requireAuth, tasksController.delete);
taskRoutes.post('/:id/subtasks', requireAuth, validate(subtaskSchema), tasksController.addSubtask);

// Subtask routes (subtasks/:id are at root level)
const subtaskRoutes = Router({ mergeParams: true });
subtaskRoutes.patch('/:id', requireAuth, validate(updateSubtaskSchema), tasksController.updateSubtask);
subtaskRoutes.delete('/:id', requireAuth, tasksController.deleteSubtask);

export { subtaskRoutes };
