import type { MealType } from "@/generated/prisma/client";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Завтрак",
  LUNCH: "Обед",
  DINNER: "Ужин",
  SNACK: "Перекус",
};

export const MEAL_TYPE_ORDER: MealType[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];
