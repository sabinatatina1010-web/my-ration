import { withPrisma } from "@/lib/prisma";
import { getDaysAgo } from "@/modules/dashboard/date-range";
import {
  createWeightLogSchema,
  type CreateWeightLogInput,
} from "@/modules/weight/schemas";

export class WeightServiceError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "NOT_FOUND" | "FORBIDDEN",
  ) {
    super(message);
    this.name = "WeightServiceError";
  }
}

export async function getWeightPageData(userId: string) {
  return withPrisma(async (db) => {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: {
        weightKg: true,
        targetWeightKg: true,
        goal: true,
      },
    });

    const historyStart = getDaysAgo(29);
    const logs = await db.weightLog.findMany({
      where: {
        userId,
        loggedAt: { gte: historyStart },
      },
      orderBy: { loggedAt: "desc" },
    });

    const latest = logs[0] ?? null;
    const chartData = [...logs]
      .reverse()
      .map((log) => ({
        date: log.loggedAt.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        }),
        weightKg: log.weightKg,
      }));

    return {
      profile,
      latest,
      logs,
      chartData,
    };
  });
}

export async function createWeightLog(userId: string, rawInput: unknown) {
  const parsed = createWeightLogSchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new WeightServiceError(
      parsed.error.issues[0]?.message ?? "Некорректные данные веса",
      "VALIDATION",
    );
  }

  const input: CreateWeightLogInput = parsed.data;

  return withPrisma(async (db) => {
    const log = await db.weightLog.create({
      data: {
        userId,
        weightKg: input.weightKg,
        note: input.note,
        loggedAt: new Date(),
      },
    });

    await db.userProfile.updateMany({
      where: { userId },
      data: { weightKg: input.weightKg },
    });

    return log;
  });
}

export async function deleteWeightLog(userId: string, logId: string) {
  return withPrisma(async (db) => {
    const existing = await db.weightLog.findUnique({
      where: { id: logId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      throw new WeightServiceError("Запись не найдена", "NOT_FOUND");
    }

    if (existing.userId !== userId) {
      throw new WeightServiceError("Нельзя удалить чужую запись", "FORBIDDEN");
    }

    await db.weightLog.delete({ where: { id: logId } });
  });
}
