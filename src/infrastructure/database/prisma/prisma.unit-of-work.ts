import type { PrismaClient } from '../../../generated/prisma/client.js';

import type { IUnitOfWork } from '../../../common/interfaces/unit-of-work.interface.js';

import type { PrismaTransactionClient } from './prisma.transaction.js';

export class PrismaUnitOfWork implements IUnitOfWork<PrismaTransactionClient> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute<T>(work: (transaction: PrismaTransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (transaction) => {
      return work(transaction);
    });
  }
}
