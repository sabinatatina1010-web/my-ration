import assert from "node:assert/strict";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { getLocalDayBounds } from "../src/modules/dashboard/date-range.ts";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const email = `dashboard-smoke-${Date.now()}@myracion.test`;

try {
  const user = await prisma.user.create({
    data: {
      email,
      name: "Dashboard Smoke",
      passwordHash: await hash("Password123!", 12),
      profile: {
        create: {
          sex: "FEMALE",
          ageYears: 30,
          heightCm: 168,
          weightKg: 70,
          activityLevel: "MODERATE",
          goal: "LOSE_WEIGHT",
          onboardingCompleted: true,
        },
      },
      nutritionTarget: {
        create: {
          calories: 1800,
          proteinGrams: 120,
          fatGrams: 55,
          carbsGrams: 180,
          waterMl: 2400,
        },
      },
    },
  });

  const { start, end } = getLocalDayBounds();
  assert.ok(start < end);

  const meals = await prisma.foodEntry.count({
    where: { userId: user.id, eatenAt: { gte: start, lte: end } },
  });
  assert.equal(meals, 0);

  await prisma.user.delete({ where: { id: user.id } });
  console.log("DASHBOARD_SMOKE_OK");
} catch (error) {
  console.error("DASHBOARD_SMOKE_FAIL", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
