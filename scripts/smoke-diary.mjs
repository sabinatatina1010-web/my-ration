import assert from "node:assert/strict";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const email = `diary-smoke-${Date.now()}@myracion.test`;

try {
  const user = await prisma.user.create({
    data: {
      email,
      name: "Diary Smoke",
      passwordHash: await hash("Password123!", 12),
    },
  });

  const created = await prisma.foodEntry.create({
    data: {
      userId: user.id,
      mealType: "LUNCH",
      name: "Курица с гречкой",
      calories: 450,
      proteinGrams: 38,
      fatGrams: 14,
      carbsGrams: 42,
      portionGrams: 350,
      source: "MANUAL",
    },
  });

  const listed = await prisma.foodEntry.findMany({
    where: { userId: user.id },
  });
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.name, "Курица с гречкой");

  await prisma.foodEntry.delete({ where: { id: created.id } });
  const afterDelete = await prisma.foodEntry.count({
    where: { userId: user.id },
  });
  assert.equal(afterDelete, 0);

  await prisma.user.delete({ where: { id: user.id } });
  console.log("DIARY_SMOKE_OK");
} catch (error) {
  console.error("DIARY_SMOKE_FAIL", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
