import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './users.routes.js';
import { labelRoutes } from './labels.routes.js';
import { taskRoutes, subtaskRoutes } from './tasks.routes.js';
import { groupRoutes } from './groups.routes.js';
import { routineBlockRoutes } from './routineBlocks.routes.js';
import { requireAuth } from '../middlewares/auth.js';
import { groupsService } from '../services/groups.service.js';
import { ok } from '../utils/response.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/labels', labelRoutes);
router.use('/tasks', taskRoutes);
router.use('/subtasks', subtaskRoutes);
router.use('/groups', groupRoutes);
router.use('/routine-blocks', routineBlockRoutes);

// POST /invites/:token/accept
router.post('/invites/:token/accept', requireAuth, (req, res, next) => {
  groupsService.acceptInvite(req.params.token, req.user!.id)
    .then((membership) => ok(res, membership))
    .catch(next);
});
