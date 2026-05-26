import type { Label, CreateLabelDTO, UpdateLabelDTO } from '@makeit/shared';
import type { Knex } from 'knex';
import { labelsRepo } from '../repositories/labels.repo.js';
import { AppError } from '../utils/errors.js';
import { db } from '../config/db.js';

export const labelsService = {
  async list(userId: string, knexInst: Knex = db): Promise<Label[]> {
    return labelsRepo.findAllByUser(userId, knexInst);
  },

  async create(userId: string, dto: CreateLabelDTO, knexInst: Knex = db): Promise<Label> {
    return labelsRepo.create({ userId, name: dto.name, color: dto.color }, knexInst);
  },

  async update(userId: string, id: string, dto: UpdateLabelDTO, knexInst: Knex = db): Promise<Label> {
    const label = await labelsRepo.findById(id, knexInst);
    if (!label || label.userId !== userId) throw new AppError('NOT_FOUND', 'Label not found');
    const updated = await labelsRepo.update(id, dto, knexInst);
    return updated!;
  },

  async delete(userId: string, id: string, knexInst: Knex = db): Promise<void> {
    const label = await labelsRepo.findById(id, knexInst);
    if (!label || label.userId !== userId) throw new AppError('NOT_FOUND', 'Label not found');
    await labelsRepo.softDelete(id, knexInst);
  },
};
