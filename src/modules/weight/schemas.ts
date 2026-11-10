import { z } from "zod";

export const createWeightLogSchema = z.object({
  weightKg: z.coerce
    .number()
    .min(30, "Вес слишком маленький")
    .max(300, "Вес слишком большой"),
  note: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.string().trim().max(300, "Заметка слишком длинная").optional(),
  ),
});

export type CreateWeightLogInput = z.infer<typeof createWeightLogSchema>;
