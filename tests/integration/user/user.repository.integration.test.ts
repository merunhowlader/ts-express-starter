import { beforeAll, afterAll, beforeEach, describe, expect, it } from '@jest/globals';

import { prisma } from '../../../src/infrastructure/database/prisma/prisma.client.js';

import { UserRepository } from '../../../src/modules/user/user.repository.js';

describe('UserRepository integration', () => {
  const repository = new UserRepository(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.userProfile.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.oAuthAccount.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create and find a user', async () => {
    const user = await repository.create({
      name: 'Integration User',
      email: 'integration@example.com',
      passwordHash: 'hashed-password',
    });

    const foundUser = await repository.findById(user.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser?.email).toBe('integration@example.com');
  });

  it('should find a user by email', async () => {
    await repository.create({
      name: 'Email User',
      email: 'email@example.com',
      passwordHash: 'hashed-password',
    });

    const user = await repository.findByEmail('email@example.com');

    expect(user?.name).toBe('Email User');
  });

  it('should reject duplicate email', async () => {
    await repository.create({
      name: 'First User',
      email: 'duplicate@example.com',
      passwordHash: 'hashed-password',
    });

    await expect(
      repository.create({
        name: 'Second User',
        email: 'duplicate@example.com',
        passwordHash: 'hashed-password',
      }),
    ).rejects.toThrow();
  });
});
