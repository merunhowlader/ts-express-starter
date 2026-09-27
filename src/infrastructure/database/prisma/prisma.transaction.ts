import type { PrismaClient } from '../../../generated/prisma/client.js';

export type PrismaTransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export type PrismaTransactionCallback<T> = (tx: PrismaTransactionClient) => Promise<T>;
