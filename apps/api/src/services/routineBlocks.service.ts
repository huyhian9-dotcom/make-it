import type { RoutineBlock, CreateRoutineBlockDTO, UpdateRoutineBlockDTO } from '@makeit/shared';
import type { Knex } from 'knex';
import { routineBlocksRepo } from '../repositories/routineBlocks.repo.js';
import { AppError } from '../utils/errors.js';
import { db } from '../config/db.js';

export const routineBlocksService = {
  async list(userId: string, knexInst: Knex = db): Promise<RoutineBlock[]> {
    return routineBlocksRepo.findAllByUser(userId, knexInst);
  },

  async create(userId: string, dto: CreateRoutineBlockDTO, knexInst: Knex = db): Promise<RoutineBlock> {
    return routineBlocksRepo.create({
      userId,
      label: dto.label,
      color: dto.color,
      startTime: dto.startTime,
      endTime: dto.endTime,
      weekdayMask: dto.weekdayMask ?? 0,
    }, knexInst);
  },

  async update(userId: string, id: string, dto: UpdateRoutineBlockDTO, knexInst: Knex = db): Promise<RoutineBlock> {
    const block = await routineBlocksRepo.findById(id, knexInst);
    if (!block || block.userId !== userId) throw new AppError('NOT_FOUND', 'Routine block not found');
    const updated = await routineBlocksRepo.update(id, {
      label: dto.label,
      color: dto.color,
      startTime: dto.startTime,
      endTime: dto.endTime,
      weekdayMask: dto.weekdayMask,
    }, knexInst);
    return updated!;
  },

  async delete(userId: string, id: string, knexInst: Knex = db): Promise<void> {
    const block = await routineBlocksRepo.findById(id, knexInst);
    if (!block || block.userId !== userId) throw new AppError('NOT_FOUND', 'Routine block not found');
    await routineBlocksRepo.softDelete(id, knexInst);
  },
};
