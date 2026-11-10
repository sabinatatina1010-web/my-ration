import { z } from "zod";

import { mealTypeSchema } from "@/modules/diary/schemas";

export const photoAnalysisSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  mealType: mealTypeSchema.default("LUNCH"),
  calories: z.number().nonnegative().max(5000),
  proteinGrams: z.number().nonnegative().max(500),
  fatGrams: z.number().nonnegative().max(500),
  carbsGrams: z.number().nonnegative().max(1000),
  portionGrams: z.number().positive().max(5000).optional(),
  confidence: z.number().min(0).max(1).optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        portionGrams: z.number().optional(),
      }),
    )
    .optional(),
});

export const confirmPhotoEntrySchema = z.object({
  mealType: mealTypeSchema,
  name: z.string().trim().min(1).max(120),
  description: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.string().trim().max(500).optional(),
  ),
  calories: z.coerce.number().min(0).max(5000),
  proteinGrams: z.coerce.number().min(0).max(500),
  fatGrams: z.coerce.number().min(0).max(500),
  carbsGrams: z.coerce.number().min(0).max(1000),
  portionGrams: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.coerce.number().min(1).max(5000).optional(),
  ),
  photoUrl: z.string().min(1),
  aiRawResponse: z.string().optional(),
});

export type PhotoAnalysis = z.infer<typeof photoAnalysisSchema>;
export type ConfirmPhotoEntryInput = z.infer<typeof confirmPhotoEntrySchema>;
