import type { Knex } from 'knex';
import type { Group, GroupMember, GroupInvite } from '@makeit/shared';
import { db } from '../config/db.js';
import { generateId } from '../utils/uuid.js';

interface GroupRow {
  id: string;
  name: string;
  icon: string;
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | null;
}

interface GroupMemberRow {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string | Date;
}

interface GroupInviteRow {
  id: string;
  group_id: string;
  email: string | null;
  token: string;
  status: string;
  created_at: string | Date;
}

function toISO(val: string | Date | null | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

function rowToGroup(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    ownerId: row.owner_id,
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

function rowToMember(row: GroupMemberRow): GroupMember {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    role: row.role as GroupMember['role'],
  };
}

function rowToInvite(row: GroupInviteRow): GroupInvite {
  return {
    id: row.id,
    groupId: row.group_id,
    email: row.email,
    token: row.token,
    status: row.status as GroupInvite['status'],
    createdAt: toISO(row.created_at),
  };
}

export const groupsRepo = {
  async findById(id: string, knexInst: Knex = db): Promise<Group | null> {
    const row = await knexInst<GroupRow>('groups').where({ id }).whereNull('deleted_at').first();
    return row ? rowToGroup(row) : null;
  },

  async findAllForUser(userId: string, knexInst: Knex = db): Promise<Group[]> {
    const rows = await knexInst<GroupRow>('groups')
      .join('group_members', 'groups.id', 'group_members.group_id')
      .where('group_members.user_id', userId)
      .whereNull('groups.deleted_at')
      .select('groups.*')
      .orderBy('groups.created_at', 'asc');
    return rows.map(rowToGroup);
  },

  async create(data: { name: string; icon: string; ownerId: string }, knexInst: Knex = db): Promise<Group> {
    const id = generateId();
    const now = new Date().toISOString();
    await knexInst('groups').insert({
      id,
      name: data.name,
      icon: data.icon,
      owner_id: data.ownerId,
      created_at: now,
      updated_at: now,
    });
    const row = await knexInst<GroupRow>('groups').where({ id }).first();
    return rowToGroup(row!);
  },

  async update(id: string, data: Partial<{ name: string; icon: string }>, knexInst: Knex = db): Promise<Group | null> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) update.name = data.name;
    if (data.icon !== undefined) update.icon = data.icon;
    await knexInst('groups').where({ id }).update(update);
    const row = await knexInst<GroupRow>('groups').where({ id }).first();
    return row ? rowToGroup(row) : null;
  },

  async softDelete(id: string, knexInst: Knex = db): Promise<void> {
    await knexInst('groups').where({ id }).update({ deleted_at: new Date().toISOString() });
  },

  async addMember(groupId: string, userId: string, role: string, knexInst: Knex = db): Promise<GroupMember> {
    const existing = await knexInst('group_members').where({ group_id: groupId, user_id: userId }).first();
    if (existing) return rowToMember(existing as GroupMemberRow);
    const id = generateId();
    const now = new Date().toISOString();
    await knexInst('group_members').insert({ id, group_id: groupId, user_id: userId, role, created_at: now });
    const row = await knexInst<GroupMemberRow>('group_members').where({ id }).first();
    return rowToMember(row!);
  },

  async getMembership(groupId: string, userId: string, knexInst: Knex = db): Promise<GroupMember | null> {
    const row = await knexInst<GroupMemberRow>('group_members')
      .where({ group_id: groupId, user_id: userId }).first();
    return row ? rowToMember(row) : null;
  },

  async getMemberCount(groupId: string, knexInst: Knex = db): Promise<number> {
    const result = await knexInst('group_members').where({ group_id: groupId }).count('id as count').first();
    return Number((result as { count: string | number }).count ?? 0);
  },

  async createInvite(groupId: string, email?: string | null, knexInst: Knex = db): Promise<GroupInvite> {
    const id = generateId();
    const token = generateId(); // UUID as token
    const now = new Date().toISOString();
    await knexInst('group_invites').insert({
      id,
      group_id: groupId,
      email: email ?? null,
      token,
      status: 'pending',
      created_at: now,
    });
    const row = await knexInst<GroupInviteRow>('group_invites').where({ id }).first();
    return rowToInvite(row!);
  },

  async findInviteByToken(token: string, knexInst: Knex = db): Promise<GroupInvite | null> {
    const row = await knexInst<GroupInviteRow>('group_invites').where({ token }).first();
    return row ? rowToInvite(row) : null;
  },

  async updateInviteStatus(id: string, status: string, knexInst: Knex = db): Promise<void> {
    await knexInst('group_invites').where({ id }).update({ status });
  },
};
