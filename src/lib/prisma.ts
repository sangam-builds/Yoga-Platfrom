import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma Client instances during Next.js hot reloads in dev
  var _prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Re-use the same client across hot-reloads in dev; always fresh in prod.
export const prisma: PrismaClient =
  global._prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global._prisma = prisma;
}
