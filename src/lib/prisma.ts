import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPool(): Pool {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    // Local `prisma dev` accepts one TCP connection at a time.
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });

  pool.on("error", (error) => {
    console.error("[pg] pool error", error.message);
  });

  return pool;
}

function createPrismaClient(pool: Pool): PrismaClient {
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function getPool(): Pool {
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = createPool();
  }

  return globalForPrisma.pgPool;
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(getPool());
  }

  return globalForPrisma.prisma;
}

/**
 * Shared Prisma client for server-side data access.
 * Proxy keeps working after reconnect resets the underlying instance.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, property, receiver);

    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("connection terminated") ||
    message.includes("not queryable") ||
    message.includes("connection refused") ||
    message.includes("cannot use a pool after calling end") ||
    message.includes("client has encountered a connection error")
  );
}

async function resetPrismaConnection(): Promise<void> {
  try {
    await globalForPrisma.pgPool?.end();
  } catch {
    // ignore shutdown errors from a dead pool
  }

  globalForPrisma.pgPool = undefined;
  globalForPrisma.prisma = undefined;
}

/**
 * Runs a DB operation and recreates the pool once if the local Postgres
 * connection was dropped (common with `prisma dev` single-connection mode).
 */
export async function withPrisma<T>(
  operation: (client: PrismaClient) => Promise<T>,
): Promise<T> {
  try {
    return await operation(getPrisma());
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error;
    }

    console.warn("[prisma] reconnecting after connection error");
    await resetPrismaConnection();
    return operation(getPrisma());
  }
}
