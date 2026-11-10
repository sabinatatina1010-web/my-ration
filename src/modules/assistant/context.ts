import { withPrisma } from "@/lib/prisma";
import { getLocalDayBounds } from "@/modules/dashboard/date-range";
import { buildAssistantSystemPrompt } from "@/modules/assistant/prompt";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  SEX_LABELS,
} from "@/modules/profile/labels";

export { buildAssistantSystemPrompt };

export async function buildAssistantUserContext(userId: string): Promise<string> {
  return withPrisma(async (db) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const profile = await db.userProfile.findUnique({ where: { userId } });
    const target = await db.nutritionTarget.findUnique({ where: { userId } });
    const { start, end } = getLocalDayBounds();

    const foodEntries = await db.foodEntry.findMany({
      where: { userId, eatenAt: { gte: start, lte: end } },
      orderBy: { eatenAt: "asc" },
      select: {
        name: true,
        mealType: true,
        calories: true,
        proteinGrams: true,
        fatGrams: true,
        carbsGrams: true,
      },
    });

    const waterLogs = await db.waterLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
      select: { amountMl: true },
    });

    const latestWeight = await db.weightLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      select: { weightKg: true, loggedAt: true },
    });

    const foodTotals = foodEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        proteinGrams: acc.proteinGrams + entry.proteinGrams,
        fatGrams: acc.fatGrams + entry.fatGrams,
        carbsGrams: acc.carbsGrams + entry.carbsGrams,
      }),
      { calories: 0, proteinGrams: 0, fatGrams: 0, carbsGrams: 0 },
    );

    const waterMl = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);

    const lines = [
      `Имя: ${user?.name ?? "пользователь"}`,
      `Email: ${user?.email ?? "—"}`,
    ];

    if (profile) {
      lines.push(
        `Пол: ${SEX_LABELS[profile.sex]}`,
        `Возраст: ${profile.ageYears ?? "—"}`,
        `Рост: ${profile.heightCm} см`,
        `Вес в анкете: ${profile.weightKg} кг`,
        `Целевой вес: ${profile.targetWeightKg ?? "не указан"}`,
        `Цель: ${GOAL_LABELS[profile.goal]}`,
        `Активность: ${ACTIVITY_LABELS[profile.activityLevel]}`,
      );
    }

    if (latestWeight) {
      lines.push(
        `Последний замер веса: ${latestWeight.weightKg} кг (${latestWeight.loggedAt.toLocaleDateString("ru-RU")})`,
      );
    }

    if (target) {
      lines.push(
        `Дневные нормы: ${target.calories} ккал, Б ${target.proteinGrams} г, Ж ${target.fatGrams} г, У ${target.carbsGrams} г, вода ${target.waterMl} мл`,
      );
    }

    lines.push(
      `Сегодня съедено: ${Math.round(foodTotals.calories)} ккал, Б ${Math.round(foodTotals.proteinGrams * 10) / 10} г, Ж ${Math.round(foodTotals.fatGrams * 10) / 10} г, У ${Math.round(foodTotals.carbsGrams * 10) / 10} г`,
      `Сегодня воды: ${waterMl} мл`,
      `Записей еды сегодня: ${foodEntries.length}`,
    );

    if (foodEntries.length > 0) {
      lines.push("Блюда сегодня:");
      for (const entry of foodEntries.slice(-8)) {
        lines.push(
          `- [${entry.mealType}] ${entry.name}: ${Math.round(entry.calories)} ккал`,
        );
      }
    }

    return lines.join("\n");
  });
}
