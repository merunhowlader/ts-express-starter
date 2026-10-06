import { jest } from '@jest/globals';

import { HTTP_STATUS } from '../../../src/common/constants/http.constants.js';
import { ERROR_CODES } from '../../../src/common/errors/error.codes.js';

import type { IUnitOfWork } from '../../../src/common/interfaces/unit-of-work.interface.js';
import type { PrismaTransactionClient } from '../../../src/infrastructure/database/prisma/prisma.transaction.js';

import type { User } from '../../../src/generated/prisma/client.js';

import type { IUserRepository } from '../../../src/modules/user/user.interface.js';
import { UserService } from '../../../src/modules/user/user.service.js';

describe('UserService', () => {
  const createMockUser = (): User => ({
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createMockRepository = (): jest.Mocked<IUserRepository> => ({
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    createProfile: jest.fn(),
  });

  const createMockUnitOfWork = (): IUnitOfWork<PrismaTransactionClient> => ({
    execute: async <T>(_work: (transaction: PrismaTransactionClient) => Promise<T>): Promise<T> => {
      throw new Error('UnitOfWork.execute should not be called in this test.');
    },
  });

  describe('getUserById', () => {
    it('should allow the owner to access their own user', async () => {
      const repository = createMockRepository();
      const unitOfWork = createMockUnitOfWork();

      const user = createMockUser();

      repository.findById.mockResolvedValue(user);

      const service = new UserService(repository, unitOfWork);

      const result = await service.getUserById('user-123', {
        id: 'user-123',
        role: 'USER',
      });

      expect(repository.findById).toHaveBeenCalledWith('user-123');

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      });
    });

    it('should allow an ADMIN to access any user', async () => {
      const repository = createMockRepository();
      const unitOfWork = createMockUnitOfWork();

      const user = createMockUser();

      repository.findById.mockResolvedValue(user);

      const service = new UserService(repository, unitOfWork);

      const result = await service.getUserById('user-123', {
        id: 'admin-123',
        role: 'ADMIN',
      });

      expect(repository.findById).toHaveBeenCalledWith('user-123');

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      });
    });

    it('should reject access to another user', async () => {
      const repository = createMockRepository();
      const unitOfWork = createMockUnitOfWork();

      const service = new UserService(repository, unitOfWork);

      await expect(
        service.getUserById('user-123', {
          id: 'another-user-456',
          role: 'USER',
        }),
      ).rejects.toMatchObject({
        code: ERROR_CODES.FORBIDDEN,
        statusCode: HTTP_STATUS.FORBIDDEN,
      });

      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should return null when the user does not exist', async () => {
      const repository = createMockRepository();
      const unitOfWork = createMockUnitOfWork();

      repository.findById.mockResolvedValue(null);

      const service = new UserService(repository, unitOfWork);

      const result = await service.getUserById('missing-user', {
        id: 'missing-user',
        role: 'USER',
      });

      expect(repository.findById).toHaveBeenCalledWith('missing-user');

      expect(result).toBeNull();
    });
  });
});
