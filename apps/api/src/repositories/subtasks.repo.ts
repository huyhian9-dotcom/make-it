import type { Knex } from 'knex';
import type { Subtask } from '@makeit/shared';
import { db } from '../config/db.js';
import { generateId } from '../utils/uuid.js';

interface SubtaskRow {
  id: string;
  task_id: string;
  title: string;
  done: number | boolean;
  position: number;
  created_at: string | Date;
  updated_at: string | Date;
}

function rowToSubtask(row: SubtaskRow): Subtask {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    done: Boolean(row.done),
    position: row.position,
  };
}

export const subtasksRepo = {
  async findByTaskId(taskId: string, knexInst: Knex = db): Promise<Subtask[]> {
    const rows = await knexInst<SubtaskRow>('subtasks')
      .where({ task_id: taskId })
      .orderBy('position', 'asc');
    return rows.map(rowToSubtask);
  },

  async findById(id: string, knexInst: Knex = db): Promise<Subtask | null> {
    const row = await knexInst<SubtaskRow>('subtasks').where({ id }).first();
    return row ? rowToSubtask(row) : null;
  },

  async create(data: { taskId: string; title: string; done?: boolean; position?: number }, knexInst: Knex = db): Promise<Subtask> {
    const id = generateId();
    const now = new Date().toISOString();
    await knexInst('subtasks').insert({
      id,
      task_id: data.taskId,
      title: data.title,
      done: data.done ? 1 : 0,
      position: data.position ?? 0,
      created_at: now,
      updated_at: now,
    });
    const row = await knexInst<SubtaskRow>('subtasks').where({ id }).first();
    return rowToSubtask(row!);
  },

  async update(id: string, data: Partial<{ title: string; done: boolean; position: number }>, knexInst: Knex = db): Promise<Subtask | null> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) update.title = data.title;
    if (data.done !== undefined) update.done = data.done ? 1 : 0;
    if (data.position !== undefined) update.position = data.position;
    await knexInst('subtasks').where({ id }).update(update);
    const row = await knexInst<SubtaskRow>('subtasks').where({ id }).first();
    return row ? rowToSubtask(row) : null;
  },

  async delete(id: string, knexInst: Knex = db): Promise<void> {
    await knexInst('subtasks').where({ id }).delete();
  },

  async deleteByTaskId(taskId: string, knexInst: Knex = db): Promise<void> {
    await knexInst('subtasks').where({ task_id: taskId }).delete();
  },
};
