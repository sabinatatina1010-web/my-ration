import { z } from "zod";

export const mealTypeSchema = z.enum([
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
]);

export const createFoodEntrySchema = z.object({
  mealType: mealTypeSchema,
  name: z
    .string()
    .trim()
    .min(1, "Укажите название блюда")
    .max(120, "Название слишком длинное"),
  description: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.string().trim().max(500, "Описание слишком длинное").optional(),
  ),
  calories: z.coerce
    .number()
    .min(0, "Калории не могут быть отрицательными")
    .max(5000, "Слишком большое значение калорий"),
  proteinGrams: z.coerce
    .number()
    .min(0, "Белки не могут быть отрицательными")
    .max(500, "Слишком большое значение белков"),
  fatGrams: z.coerce
    .number()
    .min(0, "Жиры не могут быть отрицательными")
    .max(500, "Слишком большое значение жиров"),
  carbsGrams: z.coerce
    .number()
    .min(0, "Углеводы не могут быть отрицательными")
    .max(1000, "Слишком большое значение углеводов"),
  portionGrams: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.coerce
      .number()
      .min(1, "Порция слишком маленькая")
      .max(5000, "Порция слишком большая")
      .optional(),
  ),
});

export type CreateFoodEntryInput = z.infer<typeof createFoodEntrySchema>;
