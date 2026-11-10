import assert from "node:assert/strict";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const email = `weight-water-smoke-${Date.now()}@myracion.test`;

try {
  const user = await prisma.user.create({
    data: {
      email,
      name: "Weight Water Smoke",
      passwordHash: await hash("Password123!", 12),
      profile: {
        create: {
          sex: "FEMALE",
          ageYears: 30,
          heightCm: 168,
          weightKg: 70,
          activityLevel: "LIGHT",
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

  const weight = await prisma.weightLog.create({
    data: { userId: user.id, weightKg: 69.4 },
  });
  const water = await prisma.waterLog.create({
    data: { userId: user.id, amountMl: 250 },
  });

  assert.equal(weight.weightKg, 69.4);
  assert.equal(water.amountMl, 250);

  await prisma.user.delete({ where: { id: user.id } });
  console.log("WEIGHT_WATER_SMOKE_OK");
} catch (error) {
  console.error("WEIGHT_WATER_SMOKE_FAIL", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
