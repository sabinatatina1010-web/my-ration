import { NextResponse } from "next/server";

import { env, hasOpenAIKey } from "@/lib/env";

/**
 * Liveness / configuration probe for local and deploy checks.
 * Does not expose secret values.
 */
export async function GET() {
  const databaseConfigured =
    Boolean(env.DATABASE_URL) &&
    !env.DATABASE_URL.includes("USER:PASSWORD") &&
    !env.DATABASE_URL.includes("johndoe:randompassword");

  let databaseReachable = false;
  let databaseError: string | null = null;

  if (databaseConfigured) {
    try {
      const { withPrisma } = await import("@/lib/prisma");
      await withPrisma((db) => db.$queryRaw`SELECT 1`);
      databaseReachable = true;
    } catch (error) {
      databaseError =
        error instanceof Error ? error.message : "Unknown database error";
    }
  }

  return NextResponse.json({
    ok: true,
    app: env.APP_NAME,
    environment: env.NODE_ENV,
    checks: {
      databaseUrlConfigured: databaseConfigured,
      databaseReachable,
      databaseError,
      authSecretConfigured: Boolean(env.AUTH_SECRET),
      openAiConfigured: hasOpenAIKey(),
    },
  });
}
