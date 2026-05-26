import type { Knex } from 'knex';
import type { Task, TaskFilters, TaskRecurrence } from '@makeit/shared';
import { db } from '../config/db.js';
import { generateId } from '../utils/uuid.js';
import { subtasksRepo } from './subtasks.repo.js';
import { labelsRepo } from './labels.repo.js';

interface TaskRow {
  id: string;
  user_id: string;
  group_id: string | null;
  label_id: string | null;
  title: string;
  notes: string | null;
  kind: string;
  due_date: string | null;
  starts_on: string | null;
  ends_on: string | null;
  recurrence: string | TaskRecurrence | null;
  group_task_type: string | null;
  status: string;
  completed_at: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | null;
}

function toISO(val: string | Date | null | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

function parseJson<T>(val: string | T | null | undefined): T | null {
  if (!val) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val) as T; } catch { return null; }
  }
  return val as T;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    groupId: row.group_id,
    labelId: row.label_id,
    title: row.title,
    notes: row.notes,
    kind: row.kind as Task['kind'],
    dueDate: row.due_date,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    recurrence: parseJson<TaskRecurrence>(row.recurrence),
    groupTaskType: row.group_task_type as Task['groupTaskType'],
    status: row.status as Task['status'],
    completedAt: row.completed_at,
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

export const tasksRepo = {
  async findById(id: string, knexInst: Knex = db): Promise<Task | null> {
    const row = await knexInst<TaskRow>('tasks').where({ id }).whereNull('deleted_at').first();
    if (!row) return null;
    const task = rowToTask(row);
    task.subtasks = await subtasksRepo.findByTaskId(id, knexInst);
    const assigneeRows = await knexInst('task_assignees').where({ task_id: id }).select('user_id');
    task.assignees = assigneeRows.map((r: { user_id: string }) => r.user_id);
    if (task.labelId) {
      task.label = await labelsRepo.findById(task.labelId, knexInst);
    }
    return task;
  },

  async list(userId: string, filters: TaskFilters, knexInst: Knex = db): Promise<Task[]> {
    let query = knexInst<TaskRow>('tasks')
      .whereNull('deleted_at');

    // Scope: user's own tasks OR tasks in groups the user belongs to
    if (filters.groupId) {
      query = query.where({ group_id: filters.groupId });
    } else {
      // Personal tasks or group tasks where user is member
      const memberGroupIds = await knexInst('group_members')
        .where({ user_id: userId })
        .pluck('group_id');

      query = query.where((qb) => {
        qb.where({ user_id: userId });
        if (memberGroupIds.length > 0) {
          qb.orWhereIn('group_id', memberGroupIds);
        }
      });
    }

    if (filters.kind) query = query.where({ kind: filters.kind });
    if (filters.status) query = query.where({ status: filters.status });
    if (filters.labelId) query = query.where({ label_id: filters.labelId });

    if (filters.from || filters.to) {
      query = query.where((qb) => {
        // due_date in range
        if (filters.from && filters.to) {
          qb.whereBetween('due_date', [filters.from, filters.to]);
        } else if (filters.from) {
          qb.where('due_date', '>=', filters.from);
        } else if (filters.to) {
          qb.where('due_date', '<=', filters.to!);
        }

        // OR starts_on..ends_on overlaps range
        if (filters.from || filters.to) {
          qb.orWhere((qb2) => {
            if (filters.from) qb2.where((q) => {
              q.where('starts_on', '<=', filters.to ?? filters.from!).orWhereNull('starts_on');
            });
            if (filters.to) qb2.where((q) => {
              q.where('ends_on', '>=', filters.from ?? filters.to!).orWhereNull('ends_on');
            });
          });
        }
      });
    }

    const rows = await query.orderBy('created_at', 'asc');
    const tasks = rows.map(rowToTask);

    // Hydrate subtasks, assignees, labels
    for (const task of tasks) {
      task.subtasks = await subtasksRepo.findByTaskId(task.id, knexInst);
      const assigneeRows = await knexInst('task_assignees').where({ task_id: task.id }).select('user_id');
      task.assignees = assigneeRows.map((r: { user_id: string }) => r.user_id);
      if (task.labelId) {
        task.label = await labelsRepo.findById(task.labelId, knexInst);
      }
    }

    return tasks;
  },

  async create(data: {
    userId: string;
    title: string;
    notes?: string | null;
    kind?: string;
    groupId?: string | null;
    labelId?: string | null;
    dueDate?: string | null;
    startsOn?: string | null;
    endsOn?: string | null;
    recurrence?: TaskRecurrence | null;
    groupTaskType?: string | null;
  }, knexInst: Knex = db): Promise<Task> {
    const id = generateId();
    const now = new Date().toISOString();
    await knexInst('tasks').insert({
      id,
      user_id: data.userId,
      title: data.title,
      notes: data.notes ?? null,
      kind: data.kind ?? 'todo',
      group_id: data.groupId ?? null,
      label_id: data.labelId ?? null,
      due_date: data.dueDate ?? null,
      starts_on: data.startsOn ?? null,
      ends_on: data.endsOn ?? null,
      recurrence: data.recurrence ? JSON.stringify(data.recurrence) : null,
      group_task_type: data.groupTaskType ?? null,
      status: 'open',
      completed_at: null,
      created_at: now,
      updated_at: now,
    });
    const row = await knexInst<TaskRow>('tasks').where({ id }).first();
    return rowToTask(row!);
  },

  async update(id: string, data: Record<string, unknown>, knexInst: Knex = db): Promise<Task | null> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const fieldMap: Record<string, string> = {
      title: 'title', notes: 'notes', kind: 'kind',
      groupId: 'group_id', labelId: 'label_id',
      dueDate: 'due_date', startsOn: 'starts_on', endsOn: 'ends_on',
      recurrence: 'recurrence', groupTaskType: 'group_task_type',
      status: 'status', completedAt: 'completed_at',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in data) {
        const val = data[key];
        update[col] = (key === 'recurrence' && val !== null && typeof val === 'object')
          ? JSON.stringify(val)
          : val;
      }
    }
    await knexInst('tasks').where({ id }).update(update);
    const row = await knexInst<TaskRow>('tasks').where({ id }).first();
    return row ? rowToTask(row) : null;
  },

  async softDelete(id: string, knexInst: Knex = db): Promise<void> {
    await knexInst('tasks').where({ id }).update({ deleted_at: new Date().toISOString() });
  },

  async addAssignee(taskId: string, userId: string, knexInst: Knex = db): Promise<void> {
    const existing = await knexInst('task_assignees').where({ task_id: taskId, user_id: userId }).first();
    if (!existing) {
      await knexInst('task_assignees').insert({ id: generateId(), task_id: taskId, user_id: userId });
    }
  },

  async removeAssignees(taskId: string, knexInst: Knex = db): Promise<void> {
    await knexInst('task_assignees').where({ task_id: taskId }).delete();
  },
};
