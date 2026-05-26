import type { Knex } from 'knex';
import type { Label } from '@makeit/shared';
import { db } from '../config/db.js';
import { generateId } from '../utils/uuid.js';

interface LabelRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | null;
}

function toISO(val: string | Date | null | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

function rowToLabel(row: LabelRow): Label {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

export const labelsRepo = {
  async findAllByUser(userId: string, knexInst: Knex = db): Promise<Label[]> {
    const rows = await knexInst<LabelRow>('labels')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'asc');
    return rows.map(rowToLabel);
  },

  async findById(id: string, knexInst: Knex = db): Promise<Label | null> {
    const row = await knexInst<LabelRow>('labels').where({ id }).whereNull('deleted_at').first();
    return row ? rowToLabel(row) : null;
  },

  async create(data: { userId: string; name: string; color: string }, knexInst: Knex = db): Promise<Label> {
    const id = generateId();
    const now = new Date().toISOString();
    await knexInst('labels').insert({
      id,
      user_id: data.userId,
      name: data.name,
      color: data.color,
      created_at: now,
      updated_at: now,
    });
    const row = await knexInst<LabelRow>('labels').where({ id }).first();
    return rowToLabel(row!);
  },

  async update(id: string, data: Partial<{ name: string; color: string }>, knexInst: Knex = db): Promise<Label | null> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) update.name = data.name;
    if (data.color !== undefined) update.color = data.color;
    await knexInst('labels').where({ id }).update(update);
    const row = await knexInst<LabelRow>('labels').where({ id }).first();
    return row ? rowToLabel(row) : null;
  },

  async softDelete(id: string, knexInst: Knex = db): Promise<void> {
    await knexInst('labels').where({ id }).update({ deleted_at: new Date().toISOString() });
  },
};
