import { withPrisma } from "@/lib/prisma";
import {
  formatDayLabel,
  getDaysAgo,
  getLocalDayBounds,
} from "@/modules/dashboard/date-range";
import type { MacroNutrients } from "@/types";

export type DashboardMacroProgress = MacroNutrients & {
  waterMl: number;
};

export type DashboardSummary = {
  profile: {
    weightKg: number;
    targetWeightKg: number | null;
    goal: string;
    activityLevel: string;
    heightCm: number;
    ageYears: number | null;
  };
  targets: DashboardMacroProgress;
  today: DashboardMacroProgress & {
    mealsCount: number;
    waterEntriesCount: number;
  };
  remaining: DashboardMacroProgress;
  latestWeightKg: number | null;
  weightHistory: Array<{
    date: string;
    weightKg: number;
  }>;
  todayLabel: string;
};

function emptyMacros(): DashboardMacroProgress {
  return {
    calories: 0,
    proteinGrams: 0,
    fatGrams: 0,
    carbsGrams: 0,
    waterMl: 0,
  };
}

function remainingValue(target: number, consumed: number): number {
  return Math.max(0, Math.round((target - consumed) * 10) / 10);
}

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary | null> {
  return withPrisma(async (db) => {
    const profile = await db.userProfile.findUnique({ where: { userId } });
    const nutritionTarget = await db.nutritionTarget.findUnique({
      where: { userId },
    });

    if (!profile?.onboardingCompleted || !nutritionTarget) {
      return null;
    }

    const { start, end } = getLocalDayBounds();
    const historyStart = getDaysAgo(13);

    const foodEntries = await db.foodEntry.findMany({
      where: {
        userId,
        eatenAt: { gte: start, lte: end },
      },
      select: {
        calories: true,
        proteinGrams: true,
        fatGrams: true,
        carbsGrams: true,
      },
    });

    const waterEntries = await db.waterLog.findMany({
      where: {
        userId,
        loggedAt: { gte: start, lte: end },
      },
      select: { amountMl: true },
    });

    const weightLogs = await db.weightLog.findMany({
      where: {
        userId,
        loggedAt: { gte: historyStart },
      },
      orderBy: { loggedAt: "asc" },
      select: {
        weightKg: true,
        loggedAt: true,
      },
    });

    const latestWeight = await db.weightLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      select: { weightKg: true },
    });

    const today = foodEntries.reduce<DashboardMacroProgress>(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        proteinGrams: acc.proteinGrams + entry.proteinGrams,
        fatGrams: acc.fatGrams + entry.fatGrams,
        carbsGrams: acc.carbsGrams + entry.carbsGrams,
        waterMl: acc.waterMl,
      }),
      emptyMacros(),
    );

    today.waterMl = waterEntries.reduce(
      (sum, entry) => sum + entry.amountMl,
      0,
    );

    const targets: DashboardMacroProgress = {
      calories: nutritionTarget.calories,
      proteinGrams: nutritionTarget.proteinGrams,
      fatGrams: nutritionTarget.fatGrams,
      carbsGrams: nutritionTarget.carbsGrams,
      waterMl: nutritionTarget.waterMl,
    };

    const remaining: DashboardMacroProgress = {
      calories: remainingValue(targets.calories, today.calories),
      proteinGrams: remainingValue(targets.proteinGrams, today.proteinGrams),
      fatGrams: remainingValue(targets.fatGrams, today.fatGrams),
      carbsGrams: remainingValue(targets.carbsGrams, today.carbsGrams),
      waterMl: remainingValue(targets.waterMl, today.waterMl),
    };

    return {
      profile: {
        weightKg: profile.weightKg,
        targetWeightKg: profile.targetWeightKg,
        goal: profile.goal,
        activityLevel: profile.activityLevel,
        heightCm: profile.heightCm,
        ageYears: profile.ageYears,
      },
      targets,
      today: {
        ...today,
        calories: Math.round(today.calories),
        proteinGrams: Math.round(today.proteinGrams * 10) / 10,
        fatGrams: Math.round(today.fatGrams * 10) / 10,
        carbsGrams: Math.round(today.carbsGrams * 10) / 10,
        mealsCount: foodEntries.length,
        waterEntriesCount: waterEntries.length,
      },
      remaining,
      latestWeightKg: latestWeight?.weightKg ?? profile.weightKg,
      weightHistory: weightLogs.map((log) => ({
        date: formatDayLabel(log.loggedAt),
        weightKg: log.weightKg,
      })),
      todayLabel: new Date().toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    };
  });
}
