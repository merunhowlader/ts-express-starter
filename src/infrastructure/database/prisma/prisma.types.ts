import type { PrismaClient } from '../../../generated/prisma/client.js';

import type { PrismaTransactionClient } from './prisma.transaction.js';

export type PrismaDatabaseClient = PrismaClient | PrismaTransactionClient;
