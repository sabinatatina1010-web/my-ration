"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  WeightServiceError,
  createWeightLog,
  deleteWeightLog,
} from "@/modules/weight/service";

export type WeightFormState = {
  error: string | null;
  success: string | null;
};

export async function createWeightLogAction(
  _prevState: WeightFormState,
  formData: FormData,
): Promise<WeightFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Нужно войти в аккаунт", success: null };
  }

  try {
    await createWeightLog(session.user.id, {
      weightKg: formData.get("weightKg"),
      note: formData.get("note"),
    });
  } catch (error) {
    if (error instanceof WeightServiceError) {
      return { error: error.message, success: null };
    }
    throw error;
  }

  revalidatePath("/weight");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { error: null, success: "Вес сохранён" };
}

export async function deleteWeightLogAction(formData: FormData): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new WeightServiceError("Нужно войти в аккаунт", "FORBIDDEN");
  }

  const logId = String(formData.get("logId") ?? "");
  if (!logId) {
    throw new WeightServiceError("Не указана запись", "VALIDATION");
  }

  await deleteWeightLog(session.user.id, logId);
  revalidatePath("/weight");
  revalidatePath("/dashboard");
}
