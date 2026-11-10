"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  WaterServiceError,
  createWaterLog,
  deleteWaterLog,
} from "@/modules/water/service";

export type WaterFormState = {
  error: string | null;
  success: string | null;
};

export async function createWaterLogAction(
  _prevState: WaterFormState,
  formData: FormData,
): Promise<WaterFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Нужно войти в аккаунт", success: null };
  }

  try {
    await createWaterLog(session.user.id, {
      amountMl: formData.get("amountMl"),
    });
  } catch (error) {
    if (error instanceof WaterServiceError) {
      return { error: error.message, success: null };
    }
    throw error;
  }

  revalidatePath("/water");
  revalidatePath("/dashboard");

  return { error: null, success: "Вода добавлена" };
}

export async function deleteWaterLogAction(formData: FormData): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new WaterServiceError("Нужно войти в аккаунт", "FORBIDDEN");
  }

  const logId = String(formData.get("logId") ?? "");
  if (!logId) {
    throw new WaterServiceError("Не указана запись", "VALIDATION");
  }

  await deleteWaterLog(session.user.id, logId);
  revalidatePath("/water");
  revalidatePath("/dashboard");
}
