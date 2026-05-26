import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '@makeit/shared';
import type { Knex } from 'knex';
import { tasksRepo } from '../repositories/tasks.repo.js';
import { subtasksRepo } from '../repositories/subtasks.repo.js';
import { groupsRepo } from '../repositories/groups.repo.js';
import { AppError } from '../utils/errors.js';
import { db } from '../config/db.js';

export const tasksService = {
  async list(userId: string, filters: TaskFilters, knexInst: Knex = db): Promise<Task[]> {
    // If groupId specified, verify membership
    if (filters.groupId) {
      const membership = await groupsRepo.getMembership(filters.groupId, userId, knexInst);
      if (!membership) throw new AppError('FORBIDDEN', 'Not a member of this group');
    }
    return tasksRepo.list(userId, filters, knexInst);
  },

  async get(userId: string, id: string, knexInst: Knex = db): Promise<Task> {
    const task = await tasksRepo.findById(id, knexInst);
    if (!task) throw new AppError('NOT_FOUND', 'Task not found');

    // Access check: owner OR group member
    if (task.userId !== userId) {
      if (!task.groupId) throw new AppError('FORBIDDEN', 'Access denied');
      const membership = await groupsRepo.getMembership(task.groupId, userId, knexInst);
      if (!membership) throw new AppError('FORBIDDEN', 'Access denied');
    }
    return task;
  },

  async create(userId: string, dto: CreateTaskDTO, knexInst: Knex = db): Promise<Task> {
    // If group task, verify membership
    if (dto.groupId) {
      const membership = await groupsRepo.getMembership(dto.groupId, userId, knexInst);
      if (!membership) throw new AppError('FORBIDDEN', 'Not a member of this group');
    }

    const task = await tasksRepo.create({
      userId,
      title: dto.title,
      notes: dto.notes,
      kind: dto.kind ?? 'todo',
      groupId: dto.groupId,
      labelId: dto.labelId,
      dueDate: dto.dueDate,
      startsOn: dto.startsOn,
      endsOn: dto.endsOn,
      recurrence: dto.recurrence,
      groupTaskType: dto.groupTaskType,
    }, knexInst);

    // Create nested subtasks
    if (dto.subtasks && dto.subtasks.length > 0) {
      for (let i = 0; i < dto.subtasks.length; i++) {
        const s = dto.subtasks[i];
        await subtasksRepo.create({
          taskId: task.id,
          title: s.title,
          done: s.done ?? false,
          position: s.position ?? i,
        }, knexInst);
      }
    }

    // Add assignees
    if (dto.assignees && dto.assignees.length > 0) {
      for (const assigneeId of dto.assignees) {
        await tasksRepo.addAssignee(task.id, assigneeId, knexInst);
      }
    }

    // Return fully hydrated
    return tasksRepo.findById(task.id, knexInst) as Promise<Task>;
  },

  async update(userId: string, id: string, dto: UpdateTaskDTO, knexInst: Knex = db): Promise<Task> {
    const existing = await tasksRepo.findById(id, knexInst);
    if (!existing) throw new AppError('NOT_FOUND', 'Task not found');

    if (existing.userId !== userId) {
      if (!existing.groupId) throw new AppError('FORBIDDEN', 'Access denied');
      const membership = await groupsRepo.getMembership(existing.groupId, userId, knexInst);
      if (!membership) throw new AppError('FORBIDDEN', 'Access denied');
    }

    await tasksRepo.update(id, dto as Record<string, unknown>, knexInst);

    // Re-sync assignees if provided
    if (dto.assignees !== undefined) {
      await tasksRepo.removeAssignees(id, knexInst);
      for (const assigneeId of dto.assignees) {
        await tasksRepo.addAssignee(id, assigneeId, knexInst);
      }
    }

    return tasksRepo.findById(id, knexInst) as Promise<Task>;
  },

  async complete(userId: string, id: string, done: boolean, knexInst: Knex = db): Promise<Task> {
    const existing = await tasksRepo.findById(id, knexInst);
    if (!existing) throw new AppError('NOT_FOUND', 'Task not found');

    if (existing.userId !== userId) {
      if (!existing.groupId) throw new AppError('FORBIDDEN', 'Access denied');
      const membership = await groupsRepo.getMembership(existing.groupId, userId, knexInst);
      if (!membership) throw new AppError('FORBIDDEN', 'Access denied');
    }

    await tasksRepo.update(id, {
      status: done ? 'done' : 'open',
      completedAt: done ? new Date().toISOString() : null,
    }, knexInst);

    return tasksRepo.findById(id, knexInst) as Promise<Task>;
  },

  async softDelete(userId: string, id: string, knexInst: Knex = db): Promise<void> {
    const existing = await tasksRepo.findById(id, knexInst);
    if (!existing) throw new AppError('NOT_FOUND', 'Task not found');
    if (existing.userId !== userId) throw new AppError('FORBIDDEN', 'Access denied');
    await tasksRepo.softDelete(id, knexInst);
  },

  async addSubtask(userId: string, taskId: string, data: { title: string; done?: boolean; position?: number }, knexInst: Knex = db) {
    await this.get(userId, taskId, knexInst); // validate access
    return subtasksRepo.create({ taskId, ...data }, knexInst);
  },

  async updateSubtask(userId: string, subtaskId: string, data: Partial<{ title: string; done: boolean; position: number }>, knexInst: Knex = db) {
    const subtask = await subtasksRepo.findById(subtaskId, knexInst);
    if (!subtask) throw new AppError('NOT_FOUND', 'Subtask not found');
    await this.get(userId, subtask.taskId, knexInst); // validate task access
    return subtasksRepo.update(subtaskId, data, knexInst);
  },

  async deleteSubtask(userId: string, subtaskId: string, knexInst: Knex = db) {
    const subtask = await subtasksRepo.findById(subtaskId, knexInst);
    if (!subtask) throw new AppError('NOT_FOUND', 'Subtask not found');
    await this.get(userId, subtask.taskId, knexInst); // validate task access
    await subtasksRepo.delete(subtaskId, knexInst);
  },
};
