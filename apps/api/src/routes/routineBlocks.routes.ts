import { Router } from 'express';
import { z } from 'zod';
import { routineBlocksController } from '../controllers/routineBlocks.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

export const routineBlockRoutes = Router();

const createSchema = z.object({
  label: z.string().min(1),
  color: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  weekdayMask: z.number().int().optional(),
});

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  weekdayMask: z.number().int().optional(),
});

routineBlockRoutes.get('/', requireAuth, routineBlocksController.list);
routineBlockRoutes.post('/', requireAuth, validate(createSchema), routineBlocksController.create);
routineBlockRoutes.patch('/:id', requireAuth, validate(updateSchema), routineBlocksController.update);
routineBlockRoutes.delete('/:id', requireAuth, routineBlocksController.delete);
