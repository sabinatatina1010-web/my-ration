/**
 * Shared domain types for MyRation.
 * Prisma enums are the source of truth for persisted values.
 */

export type {
  ActivityLevel,
  AssistantRole,
  FoodEntrySource,
  MealType,
  NutritionGoal,
  Sex,
} from "@/generated/prisma/client";

export interface MacroNutrients {
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
}

export interface DailyTargets extends MacroNutrients {
  waterMl: number;
}
