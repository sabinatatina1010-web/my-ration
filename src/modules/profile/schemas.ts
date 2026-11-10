import { z } from "zod";

export const profileQuestionnaireSchema = z
  .object({
    sex: z.enum(["FEMALE", "MALE", "OTHER"]),
    ageYears: z.coerce
      .number()
      .int("Возраст должен быть целым числом")
      .min(14, "Минимальный возраст — 14 лет")
      .max(100, "Максимальный возраст — 100 лет"),
    heightCm: z.coerce
      .number()
      .min(120, "Рост слишком маленький")
      .max(230, "Рост слишком большой"),
    weightKg: z.coerce
      .number()
      .min(30, "Вес слишком маленький")
      .max(300, "Вес слишком большой"),
    targetWeightKg: z.preprocess(
      (value) => {
        if (value === "" || value === null || value === undefined) {
          return undefined;
        }
        return value;
      },
      z.coerce
        .number()
        .min(30, "Целевой вес слишком маленький")
        .max(300, "Целевой вес слишком большой")
        .optional(),
    ),
    activityLevel: z.enum([
      "SEDENTARY",
      "LIGHT",
      "MODERATE",
      "ACTIVE",
      "VERY_ACTIVE",
    ]),
    goal: z.enum(["LOSE_WEIGHT", "MAINTAIN", "GAIN_WEIGHT"]),
  })
  .superRefine((data, ctx) => {
    if (
      data.goal === "LOSE_WEIGHT" &&
      data.targetWeightKg !== undefined &&
      data.targetWeightKg >= data.weightKg
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetWeightKg"],
        message: "Для похудения целевой вес должен быть меньше текущего",
      });
    }

    if (
      data.goal === "GAIN_WEIGHT" &&
      data.targetWeightKg !== undefined &&
      data.targetWeightKg <= data.weightKg
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetWeightKg"],
        message: "Для набора массы целевой вес должен быть больше текущего",
      });
    }
  });

export type ProfileQuestionnaireInput = z.infer<
  typeof profileQuestionnaireSchema
>;
