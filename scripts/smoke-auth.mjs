import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { compare, hash } from "bcryptjs";

const email = `smoke-${Date.now()}@myracion.test`;
const password = "Password123!";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const passwordHash = await hash(password, 12);
  const created = await prisma.user.create({
    data: {
      name: "Smoke User",
      email,
      passwordHash,
    },
    select: { id: true, email: true, passwordHash: true },
  });

  const ok = await compare(password, created.passwordHash ?? "");
  if (!ok) {
    throw new Error("Password verify failed");
  }

  const duplicate = await prisma.user.findUnique({ where: { email } });
  if (!duplicate) {
    throw new Error("User not found after create");
  }

  await prisma.user.delete({ where: { id: created.id } });
  console.log("AUTH_SMOKE_OK", { email });
} catch (error) {
  console.error("AUTH_SMOKE_FAIL", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
