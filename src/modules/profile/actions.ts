"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  ProfileServiceError,
  saveProfileQuestionnaire,
} from "@/modules/profile/service";

export type ProfileFormState = {
  error: string | null;
};

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return {
    sex: formData.get("sex") ?? "",
    ageYears: formData.get("ageYears") ?? "",
    heightCm: formData.get("heightCm") ?? "",
    weightKg: formData.get("weightKg") ?? "",
    targetWeightKg: formData.get("targetWeightKg") ?? "",
    activityLevel: formData.get("activityLevel") ?? "",
    goal: formData.get("goal") ?? "",
  };
}

export async function saveProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Нужно войти в аккаунт" };
  }

  try {
    await saveProfileQuestionnaire(
      session.user.id,
      formDataToObject(formData),
    );
  } catch (error) {
    if (error instanceof ProfileServiceError) {
      return { error: error.message };
    }

    throw error;
  }

  redirect("/dashboard");
}
