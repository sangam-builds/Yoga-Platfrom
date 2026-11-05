import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type PrismaTransaction = Prisma.TransactionClient;

/**
 * Executes a multi-step database write inside an atomic Prisma transaction.
 * Isolates Prisma access from domain services.
 */
export async function runTransaction<T>(
  action: (tx: PrismaTransaction) => Promise<T>,
  options?: { maxWait?: number; timeout?: number }
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return action(tx);
  }, options);
}

