import { Router } from 'express';
import { z } from 'zod';
import { groupsController } from '../controllers/groups.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

export const groupRoutes = Router();

const createGroupSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
});

const inviteSchema = z.object({
  email: z.string().email().nullable().optional(),
});

groupRoutes.get('/', requireAuth, groupsController.list);
groupRoutes.post('/', requireAuth, validate(createGroupSchema), groupsController.create);
groupRoutes.get('/:id', requireAuth, groupsController.get);
groupRoutes.patch('/:id', requireAuth, validate(updateGroupSchema), groupsController.update);
groupRoutes.delete('/:id', requireAuth, groupsController.delete);
groupRoutes.get('/:id/tasks', requireAuth, groupsController.listTasks);
groupRoutes.post('/:id/invites', requireAuth, validate(inviteSchema), groupsController.createInvite);
