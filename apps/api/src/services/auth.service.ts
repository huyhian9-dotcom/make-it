import type { AuthResult, RegisterDTO, LoginDTO } from '@makeit/shared';
import type { Knex } from 'knex';
import { usersRepo } from '../repositories/users.repo.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
import { db } from '../config/db.js';

export const authService = {
  async register(dto: RegisterDTO, knexInst: Knex = db): Promise<AuthResult> {
    const existing = await usersRepo.findByEmail(dto.email, knexInst);
    if (existing) throw new AppError('CONFLICT', 'Email already registered');

    const passwordHash = await hashPassword(dto.password);
    const user = await usersRepo.create({ name: dto.name, email: dto.email, passwordHash }, knexInst);
    const token = signToken(user.id);
    return { token, user };
  },

  async login(dto: LoginDTO, knexInst: Knex = db): Promise<AuthResult> {
    const userWithHash = await usersRepo.findByEmail(dto.email, knexInst);
    if (!userWithHash) throw new AppError('UNAUTHORIZED', 'Invalid email or password');

    const valid = await comparePassword(dto.password, userWithHash.passwordHash);
    if (!valid) throw new AppError('UNAUTHORIZED', 'Invalid email or password');

    const token = signToken(userWithHash.id);
    // Return user without passwordHash
    const { passwordHash: _ph, ...user } = userWithHash;
    return { token, user };
  },

  async me(userId: string, knexInst: Knex = db) {
    const userWithHash = await usersRepo.findById(userId, knexInst);
    if (!userWithHash) throw new AppError('NOT_FOUND', 'User not found');
    const { passwordHash: _ph, ...user } = userWithHash;
    return user;
  },
};
