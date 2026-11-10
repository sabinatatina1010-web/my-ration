"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth";
import {
  AuthServiceError,
  registerUser,
} from "@/modules/auth/service";

export type AuthFormState = {
  error: string | null;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const user = await registerUser(formDataToObject(formData));

    await signIn("credentials", {
      email: user.email,
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { error: error.message };
    }

    if (error instanceof AuthError) {
      return { error: "Не удалось выполнить вход после регистрации" };
    }

    throw error;
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Неверный email или пароль" };
    }

    throw error;
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
