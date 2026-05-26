import type { User, UserPreferences, UpdateUserDTO, UpdatePreferencesDTO } from '@makeit/shared';
import type { Knex } from 'knex';
import { usersRepo } from '../repositories/users.repo.js';
import { AppError } from '../utils/errors.js';
import { db } from '../config/db.js';

export const usersService = {
  async getMe(userId: string, knexInst: Knex = db): Promise<User> {
    const userWithHash = await usersRepo.findById(userId, knexInst);
    if (!userWithHash) throw new AppError('NOT_FOUND', 'User not found');
    const { passwordHash: _ph, ...user } = userWithHash;
    return user;
  },

  async updateMe(userId: string, dto: UpdateUserDTO, knexInst: Knex = db): Promise<User> {
    const updated = await usersRepo.update(userId, {
      name: dto.name,
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
    }, knexInst);
    if (!updated) throw new AppError('NOT_FOUND', 'User not found');
    return updated;
  },

  async updatePreferences(userId: string, dto: UpdatePreferencesDTO, knexInst: Knex = db): Promise<User> {
    const userWithHash = await usersRepo.findById(userId, knexInst);
    if (!userWithHash) throw new AppError('NOT_FOUND', 'User not found');

    const current = userWithHash.preferences;
    const merged: UserPreferences = {
      theme: dto.theme ?? current.theme,
      push: dto.push ?? current.push,
      cloudSync: dto.cloudSync ?? current.cloudSync,
    };

    const updated = await usersRepo.update(userId, { preferences: merged }, knexInst);
    if (!updated) throw new AppError('NOT_FOUND', 'User not found');
    return updated;
  },
};
