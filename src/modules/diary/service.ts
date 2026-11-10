import type { FoodEntry, MealType } from "@/generated/prisma/client";

import { withPrisma } from "@/lib/prisma";
import { getLocalDayBounds } from "@/modules/dashboard/date-range";
import {
  createFoodEntrySchema,
  type CreateFoodEntryInput,
} from "@/modules/diary/schemas";
import { MEAL_TYPE_ORDER } from "@/modules/diary/labels";
import type { MacroNutrients } from "@/types";

export class DiaryServiceError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "NOT_FOUND" | "FORBIDDEN",
  ) {
    super(message);
    this.name = "DiaryServiceError";
  }
}

export type DiaryDayTotals = MacroNutrients & {
  entriesCount: number;
};

export type DiaryDayBundle = {
  date: Date;
  entries: FoodEntry[];
  grouped: Record<MealType, FoodEntry[]>;
  totals: DiaryDayTotals;
  targets: (MacroNutrients & { waterMl: number }) | null;
};

function emptyTotals(): DiaryDayTotals {
  return {
    calories: 0,
    proteinGrams: 0,
    fatGrams: 0,
    carbsGrams: 0,
    entriesCount: 0,
  };
}

function sumEntries(entries: FoodEntry[]): DiaryDayTotals {
  return entries.reduce<DiaryDayTotals>(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      proteinGrams: acc.proteinGrams + entry.proteinGrams,
      fatGrams: acc.fatGrams + entry.fatGrams,
      carbsGrams: acc.carbsGrams + entry.carbsGrams,
      entriesCount: acc.entriesCount + 1,
    }),
    emptyTotals(),
  );
}

function roundTotals(totals: DiaryDayTotals): DiaryDayTotals {
  return {
    calories: Math.round(totals.calories),
    proteinGrams: Math.round(totals.proteinGrams * 10) / 10,
    fatGrams: Math.round(totals.fatGrams * 10) / 10,
    carbsGrams: Math.round(totals.carbsGrams * 10) / 10,
    entriesCount: totals.entriesCount,
  };
}

function groupByMealType(entries: FoodEntry[]): Record<MealType, FoodEntry[]> {
  const grouped = {
    BREAKFAST: [] as FoodEntry[],
    LUNCH: [] as FoodEntry[],
    DINNER: [] as FoodEntry[],
    SNACK: [] as FoodEntry[],
  };

  for (const entry of entries) {
    grouped[entry.mealType].push(entry);
  }

  return grouped;
}

export async function getDiaryDay(
  userId: string,
  reference = new Date(),
): Promise<DiaryDayBundle> {
  return withPrisma(async (db) => {
    const { start, end } = getLocalDayBounds(reference);

    const entries = await db.foodEntry.findMany({
      where: {
        userId,
        eatenAt: { gte: start, lte: end },
      },
      orderBy: [{ eatenAt: "asc" }, { createdAt: "asc" }],
    });

    const nutritionTarget = await db.nutritionTarget.findUnique({
      where: { userId },
      select: {
        calories: true,
        proteinGrams: true,
        fatGrams: true,
        carbsGrams: true,
        waterMl: true,
      },
    });

    return {
      date: start,
      entries,
      grouped: groupByMealType(entries),
      totals: roundTotals(sumEntries(entries)),
      targets: nutritionTarget,
    };
  });
}

export async function createFoodEntry(userId: string, rawInput: unknown) {
  const parsed = createFoodEntrySchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new DiaryServiceError(
      parsed.error.issues[0]?.message ?? "Некорректные данные блюда",
      "VALIDATION",
    );
  }

  const input: CreateFoodEntryInput = parsed.data;

  return withPrisma(async (db) => {
    return db.foodEntry.create({
      data: {
        userId,
        mealType: input.mealType,
        name: input.name,
        description: input.description,
        calories: input.calories,
        proteinGrams: input.proteinGrams,
        fatGrams: input.fatGrams,
        carbsGrams: input.carbsGrams,
        portionGrams: input.portionGrams,
        source: "MANUAL",
        eatenAt: new Date(),
      },
    });
  });
}

export async function deleteFoodEntry(userId: string, entryId: string) {
  return withPrisma(async (db) => {
    const entry = await db.foodEntry.findUnique({
      where: { id: entryId },
      select: { id: true, userId: true },
    });

    if (!entry) {
      throw new DiaryServiceError("Запись не найдена", "NOT_FOUND");
    }

    if (entry.userId !== userId) {
      throw new DiaryServiceError("Нельзя удалить чужую запись", "FORBIDDEN");
    }

    await db.foodEntry.delete({ where: { id: entryId } });
  });
}

export function orderedMealTypes(): MealType[] {
  return [...MEAL_TYPE_ORDER];
}
