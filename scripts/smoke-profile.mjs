import assert from "node:assert/strict";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { calculateNutritionTargets } from "../src/modules/profile/calculations.ts";
import { hash } from "bcryptjs";

const calc = calculateNutritionTargets({
  sex: "FEMALE",
  ageYears: 32,
  heightCm: 165,
  weightKg: 72,
  activityLevel: "LIGHT",
  goal: "LOSE_WEIGHT",
});

assert.ok(calc.calories >= 1200);
assert.ok(calc.proteinGrams > 0);
assert.ok(calc.fatGrams > 0);
assert.ok(calc.carbsGrams > 0);
assert.ok(calc.waterMl >= 2000);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const email = `profile-smoke-${Date.now()}@myracion.test`;

try {
  const user = await prisma.user.create({
    data: {
      email,
      name: "Profile Smoke",
      passwordHash: await hash("Password123!", 12),
    },
  });

  await prisma.userProfile.create({
    data: {
      userId: user.id,
      sex: "FEMALE",
      ageYears: 32,
      heightCm: 165,
      weightKg: 72,
      targetWeightKg: 65,
      activityLevel: "LIGHT",
      goal: "LOSE_WEIGHT",
      onboardingCompleted: true,
    },
  });

  await prisma.nutritionTarget.create({
    data: {
      userId: user.id,
      calories: calc.calories,
      proteinGrams: calc.proteinGrams,
      fatGrams: calc.fatGrams,
      carbsGrams: calc.carbsGrams,
      waterMl: calc.waterMl,
    },
  });

  const saved = await prisma.nutritionTarget.findUnique({
    where: { userId: user.id },
  });
  assert.equal(saved?.calories, calc.calories);

  await prisma.user.delete({ where: { id: user.id } });
  console.log("PROFILE_SMOKE_OK", calc);
} catch (error) {
  console.error("PROFILE_SMOKE_FAIL", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
