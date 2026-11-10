import { Prisma } from "@/generated/prisma/client";

import { withPrisma } from "@/lib/prisma";
import {
  confirmPhotoEntrySchema,
  type ConfirmPhotoEntryInput,
} from "@/modules/photo-diary/schemas";

export class PhotoDiaryServiceError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "UNAUTHORIZED",
  ) {
    super(message);
    this.name = "PhotoDiaryServiceError";
  }
}

export async function savePhotoFoodEntry(
  userId: string,
  rawInput: unknown,
) {
  const parsed = confirmPhotoEntrySchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new PhotoDiaryServiceError(
      parsed.error.issues[0]?.message ?? "Некорректные данные блюда",
      "VALIDATION",
    );
  }

  const input: ConfirmPhotoEntryInput = parsed.data;

  let aiRawResponse: Prisma.InputJsonValue | undefined;
  if (input.aiRawResponse) {
    try {
      aiRawResponse = JSON.parse(input.aiRawResponse) as Prisma.InputJsonValue;
    } catch {
      aiRawResponse = { raw: input.aiRawResponse };
    }
  }

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
        photoUrl: input.photoUrl,
        aiRawResponse,
        source: "AI_PHOTO",
        eatenAt: new Date(),
      },
    });
  });
}
