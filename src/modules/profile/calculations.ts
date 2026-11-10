import type {
  ActivityLevel,
  NutritionGoal,
  Sex,
} from "@/generated/prisma/client";
import type { MacroNutrients } from "@/types";

export type NutritionCalculationInput = {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
};

export type NutritionCalculationResult = MacroNutrients & {
  waterMl: number;
  bmr: number;
  tdee: number;
};

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

const GOAL_CALORIE_FACTOR: Record<NutritionGoal, number> = {
  LOSE_WEIGHT: 0.85,
  MAINTAIN: 1,
  GAIN_WEIGHT: 1.1,
};

const PROTEIN_PER_KG: Record<NutritionGoal, number> = {
  LOSE_WEIGHT: 2,
  MAINTAIN: 1.6,
  GAIN_WEIGHT: 1.8,
};

const FAT_CALORIE_SHARE: Record<NutritionGoal, number> = {
  LOSE_WEIGHT: 0.25,
  MAINTAIN: 0.3,
  GAIN_WEIGHT: 0.25,
};

/**
 * Mifflin–St Jeor BMR.
 * For Sex.OTHER we average male and female formulas.
 */
export function calculateBmr(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;

  if (sex === "MALE") {
    return base + 5;
  }

  if (sex === "FEMALE") {
    return base - 161;
  }

  return base - 78;
}

export function calculateNutritionTargets(
  input: NutritionCalculationInput,
): NutritionCalculationResult {
  const bmr = calculateBmr(
    input.sex,
    input.weightKg,
    input.heightCm,
    input.ageYears,
  );
  const tdee = bmr * ACTIVITY_MULTIPLIER[input.activityLevel];
  const rawCalories = tdee * GOAL_CALORIE_FACTOR[input.goal];
  const calorieFloor = input.sex === "MALE" ? 1500 : 1200;
  const calories = Math.max(calorieFloor, Math.round(rawCalories));

  const proteinGrams = round1(input.weightKg * PROTEIN_PER_KG[input.goal]);
  const fatGrams = round1(
    (calories * FAT_CALORIE_SHARE[input.goal]) / 9,
  );
  const carbsGrams = round1(
    Math.max(0, (calories - proteinGrams * 4 - fatGrams * 9) / 4),
  );
  const waterMl = Math.round((input.weightKg * 35) / 100) * 100;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    proteinGrams,
    fatGrams,
    carbsGrams,
    waterMl,
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
