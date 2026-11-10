import type {
  ActivityLevel,
  NutritionGoal,
  Sex,
} from "@/generated/prisma/client";

export const SEX_LABELS: Record<Sex, string> = {
  FEMALE: "Женский",
  MALE: "Мужской",
  OTHER: "Другой",
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: "Сидячий образ жизни",
  LIGHT: "Лёгкая активность (1–3 тренировки/нед.)",
  MODERATE: "Умеренная активность (3–5 тренировок/нед.)",
  ACTIVE: "Высокая активность (6–7 тренировок/нед.)",
  VERY_ACTIVE: "Очень высокая / физическая работа",
};

export const GOAL_LABELS: Record<NutritionGoal, string> = {
  LOSE_WEIGHT: "Похудеть",
  MAINTAIN: "Поддерживать вес",
  GAIN_WEIGHT: "Набрать массу",
};
