import type { Group, GroupInvite, CreateGroupDTO, UpdateGroupDTO, CreateInviteDTO } from '@makeit/shared';
import type { Knex } from 'knex';
import { groupsRepo } from '../repositories/groups.repo.js';
import { tasksRepo } from '../repositories/tasks.repo.js';
import { AppError } from '../utils/errors.js';
import { db } from '../config/db.js';

export const groupsService = {
  async list(userId: string, knexInst: Knex = db) {
    const groups = await groupsRepo.findAllForUser(userId, knexInst);
    const result = await Promise.all(groups.map(async (g) => {
      const membership = await groupsRepo.getMembership(g.id, userId, knexInst);
      const memberCount = await groupsRepo.getMemberCount(g.id, knexInst);
      return { ...g, role: membership?.role, memberCount };
    }));
    return result;
  },

  async get(userId: string, groupId: string, knexInst: Knex = db) {
    const group = await groupsRepo.findById(groupId, knexInst);
    if (!group) throw new AppError('NOT_FOUND', 'Group not found');
    const membership = await groupsRepo.getMembership(groupId, userId, knexInst);
    if (!membership) throw new AppError('FORBIDDEN', 'Not a member of this group');
    const memberCount = await groupsRepo.getMemberCount(groupId, knexInst);
    return { ...group, role: membership.role, memberCount };
  },

  async create(userId: string, dto: CreateGroupDTO, knexInst: Knex = db): Promise<Group> {
    const group = await groupsRepo.create({ name: dto.name, icon: dto.icon, ownerId: userId }, knexInst);
    // Owner becomes member with role 'owner'
    await groupsRepo.addMember(group.id, userId, 'owner', knexInst);
    return group;
  },

  async update(userId: string, groupId: string, dto: UpdateGroupDTO, knexInst: Knex = db): Promise<Group> {
    const group = await groupsRepo.findById(groupId, knexInst);
    if (!group) throw new AppError('NOT_FOUND', 'Group not found');
    if (group.ownerId !== userId) throw new AppError('FORBIDDEN', 'Only the owner can update this group');
    const updated = await groupsRepo.update(groupId, dto, knexInst);
    return updated!;
  },

  async delete(userId: string, groupId: string, knexInst: Knex = db): Promise<void> {
    const group = await groupsRepo.findById(groupId, knexInst);
    if (!group) throw new AppError('NOT_FOUND', 'Group not found');
    if (group.ownerId !== userId) throw new AppError('FORBIDDEN', 'Only the owner can delete this group');
    await groupsRepo.softDelete(groupId, knexInst);
  },

  async listTasks(userId: string, groupId: string, knexInst: Knex = db) {
    const membership = await groupsRepo.getMembership(groupId, userId, knexInst);
    if (!membership) throw new AppError('FORBIDDEN', 'Not a member of this group');
    return tasksRepo.list(userId, { groupId }, knexInst);
  },

  async createInvite(userId: string, groupId: string, dto: CreateInviteDTO, knexInst: Knex = db): Promise<GroupInvite> {
    const group = await groupsRepo.findById(groupId, knexInst);
    if (!group) throw new AppError('NOT_FOUND', 'Group not found');
    const membership = await groupsRepo.getMembership(groupId, userId, knexInst);
    if (!membership) throw new AppError('FORBIDDEN', 'Not a member of this group');
    return groupsRepo.createInvite(groupId, dto.email, knexInst);
  },

  async acceptInvite(token: string, userId: string, knexInst: Knex = db) {
    const invite = await groupsRepo.findInviteByToken(token, knexInst);
    if (!invite) throw new AppError('NOT_FOUND', 'Invite not found');
    if (invite.status !== 'pending') throw new AppError('CONFLICT', 'Invite already used or revoked');

    const membership = await groupsRepo.addMember(invite.groupId, userId, 'member', knexInst);
    await groupsRepo.updateInviteStatus(invite.id, 'accepted', knexInst);
    return membership;
  },
};
