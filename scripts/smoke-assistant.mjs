import assert from "node:assert/strict";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const email = `assistant-smoke-${Date.now()}@myracion.test`;

try {
  const user = await prisma.user.create({
    data: {
      email,
      name: "Assistant Smoke",
      passwordHash: await hash("Password123!", 12),
      profile: {
        create: {
          sex: "FEMALE",
          ageYears: 32,
          heightCm: 165,
          weightKg: 68,
          activityLevel: "LIGHT",
          goal: "LOSE_WEIGHT",
          onboardingCompleted: true,
        },
      },
      nutritionTarget: {
        create: {
          calories: 1700,
          proteinGrams: 130,
          fatGrams: 50,
          carbsGrams: 160,
          waterMl: 2400,
        },
      },
    },
  });

  const thread = await prisma.assistantThread.create({
    data: {
      userId: user.id,
      title: "Smoke dialog",
      messages: {
        create: [
          { role: "USER", content: "Что съесть на ужин?" },
          {
            role: "ASSISTANT",
            content: "Курица с овощами и гречкой — около 450 ккал.",
          },
        ],
      },
    },
    include: { messages: true },
  });

  assert.equal(thread.messages.length, 2);
  assert.equal(thread.userId, user.id);

  const listed = await prisma.assistantThread.findMany({
    where: { userId: user.id },
    include: { _count: { select: { messages: true } } },
  });
  assert.equal(listed.length, 1);
  assert.equal(listed[0]._count.messages, 2);

  await prisma.user.delete({ where: { id: user.id } });
  console.log("ASSISTANT_SMOKE_OK");
} catch (error) {
  console.error("ASSISTANT_SMOKE_FAIL", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
