import type { Knex } from 'knex';
import type { RoutineBlock } from '@makeit/shared';
import { db } from '../config/db.js';
import { generateId } from '../utils/uuid.js';

interface RoutineBlockRow {
  id: string;
  user_id: string;
  label: string;
  color: string;
  start_time: string;
  end_time: string | null;
  weekday_mask: number;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | null;
}

function toISO(val: string | Date | null | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

function rowToBlock(row: RoutineBlockRow): RoutineBlock {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    color: row.color,
    startTime: row.start_time,
    endTime: row.end_time,
    weekdayMask: Number(row.weekday_mask),
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

export const routineBlocksRepo = {
  async findAllByUser(userId: string, knexInst: Knex = db): Promise<RoutineBlock[]> {
    const rows = await knexInst<RoutineBlockRow>('routine_blocks')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('start_time', 'asc');
    return rows.map(rowToBlock);
  },

  async findById(id: string, knexInst: Knex = db): Promise<RoutineBlock | null> {
    const row = await knexInst<RoutineBlockRow>('routine_blocks').where({ id }).whereNull('deleted_at').first();
    return row ? rowToBlock(row) : null;
  },

  async create(data: {
    userId: string;
    label: string;
    color: string;
    startTime: string;
    endTime?: string | null;
    weekdayMask?: number;
  }, knexInst: Knex = db): Promise<RoutineBlock> {
    const id = generateId();
    const now = new Date().toISOString();
    await knexInst('routine_blocks').insert({
      id,
      user_id: data.userId,
      label: data.label,
      color: data.color,
      start_time: data.startTime,
      end_time: data.endTime ?? null,
      weekday_mask: data.weekdayMask ?? 0,
      created_at: now,
      updated_at: now,
    });
    const row = await knexInst<RoutineBlockRow>('routine_blocks').where({ id }).first();
    return rowToBlock(row!);
  },

  async update(id: string, data: Partial<{
    label: string; color: string; startTime: string; endTime: string | null; weekdayMask: number;
  }>, knexInst: Knex = db): Promise<RoutineBlock | null> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.label !== undefined) update.label = data.label;
    if (data.color !== undefined) update.color = data.color;
    if (data.startTime !== undefined) update.start_time = data.startTime;
    if ('endTime' in data) update.end_time = data.endTime;
    if (data.weekdayMask !== undefined) update.weekday_mask = data.weekdayMask;
    await knexInst('routine_blocks').where({ id }).update(update);
    const row = await knexInst<RoutineBlockRow>('routine_blocks').where({ id }).first();
    return row ? rowToBlock(row) : null;
  },

  async softDelete(id: string, knexInst: Knex = db): Promise<void> {
    await knexInst('routine_blocks').where({ id }).update({ deleted_at: new Date().toISOString() });
  },
};
