"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasOpenAIKey } from "@/lib/env";
import {
  PhotoAnalysisError,
  analyzeFoodPhoto,
} from "@/modules/photo-diary/analyze";
import {
  PhotoDiaryServiceError,
  savePhotoFoodEntry,
} from "@/modules/photo-diary/service";
import {
  PhotoStorageError,
  storeFoodPhoto,
} from "@/modules/photo-diary/storage";
import type { PhotoAnalysis } from "@/modules/photo-diary/schemas";

export type AnalyzePhotoResult = {
  error: string | null;
  photoUrl: string | null;
  analysis: PhotoAnalysis | null;
  rawJson: string | null;
};

export type ConfirmPhotoResult = {
  error: string | null;
  success: string | null;
  entryId: string | null;
};

export async function analyzeFoodPhotoAction(
  formData: FormData,
): Promise<AnalyzePhotoResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Нужно войти в аккаунт",
      photoUrl: null,
      analysis: null,
      rawJson: null,
    };
  }

  if (!hasOpenAIKey()) {
    return {
      error:
        "OPENAI_API_KEY не настроен. Добавьте ключ в .env — без него AI-фотодневник не может работать.",
      photoUrl: null,
      analysis: null,
      rawJson: null,
    };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Выберите фото еды",
      photoUrl: null,
      analysis: null,
      rawJson: null,
    };
  }

  try {
    const stored = await storeFoodPhoto(file);
    const result = await analyzeFoodPhoto({
      mimeType: stored.mimeType,
      base64: stored.base64,
    });

    return {
      error: null,
      photoUrl: stored.publicUrl,
      analysis: result.analysis,
      rawJson: JSON.stringify(result.raw),
    };
  } catch (error) {
    if (
      error instanceof PhotoStorageError ||
      error instanceof PhotoAnalysisError
    ) {
      return {
        error: error.message,
        photoUrl: null,
        analysis: null,
        rawJson: null,
      };
    }

    throw error;
  }
}

export async function confirmPhotoFoodEntryAction(
  formData: FormData,
): Promise<ConfirmPhotoResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Нужно войти в аккаунт",
      success: null,
      entryId: null,
    };
  }

  try {
    const entry = await savePhotoFoodEntry(session.user.id, {
      mealType: formData.get("mealType"),
      name: formData.get("name"),
      description: formData.get("description"),
      calories: formData.get("calories"),
      proteinGrams: formData.get("proteinGrams"),
      fatGrams: formData.get("fatGrams"),
      carbsGrams: formData.get("carbsGrams"),
      portionGrams: formData.get("portionGrams"),
      photoUrl: formData.get("photoUrl"),
      aiRawResponse: formData.get("aiRawResponse"),
    });

    revalidatePath("/diary");
    revalidatePath("/dashboard");
    revalidatePath("/photo-diary");

    return {
      error: null,
      success: "Блюдо из фото добавлено в дневник",
      entryId: entry.id,
    };
  } catch (error) {
    if (error instanceof PhotoDiaryServiceError) {
      return {
        error: error.message,
        success: null,
        entryId: null,
      };
    }

    throw error;
  }
}
