"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  FoodEstimateError,
  estimateFoodNutrition,
  type FoodEstimateResult,
} from "@/modules/diary/food-estimate";
import {
  DiaryServiceError,
  createFoodEntry,
  deleteFoodEntry,
} from "@/modules/diary/service";

export type DiaryFormState = {
  error: string | null;
  success: string | null;
};

export async function createFoodEntryAction(
  _prevState: DiaryFormState,
  formData: FormData,
): Promise<DiaryFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Нужно войти в аккаунт", success: null };
  }

  try {
    await createFoodEntry(session.user.id, {
      mealType: formData.get("mealType"),
      name: formData.get("name"),
      description: formData.get("description"),
      calories: formData.get("calories"),
      proteinGrams: formData.get("proteinGrams"),
      fatGrams: formData.get("fatGrams"),
      carbsGrams: formData.get("carbsGrams"),
      portionGrams: formData.get("portionGrams"),
    });
  } catch (error) {
    if (error instanceof DiaryServiceError) {
      return { error: error.message, success: null };
    }

    throw error;
  }

  revalidatePath("/diary");
  revalidatePath("/dashboard");

  return { error: null, success: "Блюдо добавлено в дневник" };
}

export async function deleteFoodEntryAction(formData: FormData): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new DiaryServiceError("Нужно войти в аккаунт", "FORBIDDEN");
  }

  const entryId = String(formData.get("entryId") ?? "");

  if (!entryId) {
    throw new DiaryServiceError("Не указана запись", "VALIDATION");
  }

  await deleteFoodEntry(session.user.id, entryId);
  revalidatePath("/diary");
  revalidatePath("/dashboard");
}

export async function estimateFoodFromTextAction(input: {
  name: string;
  description?: string;
}): Promise<{ error: string | null; estimate: FoodEstimateResult | null }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Нужно войти в аккаунт", estimate: null };
  }

  const name = input.name.trim();
  if (!name) {
    return { error: "Сначала укажите название блюда", estimate: null };
  }

  try {
    const estimate = await estimateFoodNutrition({
      name,
      description: input.description?.trim() || undefined,
    });
    return { error: null, estimate };
  } catch (error) {
    if (error instanceof FoodEstimateError) {
      return { error: error.message, estimate: null };
    }

    throw error;
  }
}
