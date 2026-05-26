import { Router } from 'express';
import { z } from 'zod';
import { usersController } from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

export const userRoutes = Router();

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  push: z.boolean().optional(),
  cloudSync: z.boolean().optional(),
});

userRoutes.get('/me', requireAuth, usersController.getMe);
userRoutes.patch('/me', requireAuth, validate(updateUserSchema), usersController.updateMe);
userRoutes.patch('/me/preferences', requireAuth, validate(updatePreferencesSchema), usersController.updatePreferences);
