import { withPrisma } from "@/lib/prisma";
import { getLocalDayBounds } from "@/modules/dashboard/date-range";
import {
  createWaterLogSchema,
  type CreateWaterLogInput,
} from "@/modules/water/schemas";

export class WaterServiceError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "NOT_FOUND" | "FORBIDDEN",
  ) {
    super(message);
    this.name = "WaterServiceError";
  }
}

export async function getWaterPageData(userId: string) {
  return withPrisma(async (db) => {
    const { start, end } = getLocalDayBounds();

    const target = await db.nutritionTarget.findUnique({
      where: { userId },
      select: { waterMl: true },
    });

    const logs = await db.waterLog.findMany({
      where: {
        userId,
        loggedAt: { gte: start, lte: end },
      },
      orderBy: { loggedAt: "desc" },
    });

    const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);
    const targetMl = target?.waterMl ?? 0;

    return {
      logs,
      totalMl,
      targetMl,
      remainingMl: Math.max(0, targetMl - totalMl),
      percent: targetMl > 0 ? Math.min(100, Math.round((totalMl / targetMl) * 100)) : 0,
    };
  });
}

export async function createWaterLog(userId: string, rawInput: unknown) {
  const parsed = createWaterLogSchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new WaterServiceError(
      parsed.error.issues[0]?.message ?? "Некорректный объём воды",
      "VALIDATION",
    );
  }

  const input: CreateWaterLogInput = parsed.data;

  return withPrisma(async (db) => {
    return db.waterLog.create({
      data: {
        userId,
        amountMl: input.amountMl,
        loggedAt: new Date(),
      },
    });
  });
}

export async function deleteWaterLog(userId: string, logId: string) {
  return withPrisma(async (db) => {
    const existing = await db.waterLog.findUnique({
      where: { id: logId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      throw new WaterServiceError("Запись не найдена", "NOT_FOUND");
    }

    if (existing.userId !== userId) {
      throw new WaterServiceError("Нельзя удалить чужую запись", "FORBIDDEN");
    }

    await db.waterLog.delete({ where: { id: logId } });
  });
}
