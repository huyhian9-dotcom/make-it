import { Router } from 'express';
import { z } from 'zod';
import { labelsController } from '../controllers/labels.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

export const labelRoutes = Router();

const createSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
});

labelRoutes.get('/', requireAuth, labelsController.list);
labelRoutes.post('/', requireAuth, validate(createSchema), labelsController.create);
labelRoutes.patch('/:id', requireAuth, validate(updateSchema), labelsController.update);
labelRoutes.delete('/:id', requireAuth, labelsController.delete);
