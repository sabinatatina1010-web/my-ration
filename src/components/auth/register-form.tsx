"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { registerAction, type AuthFormState } from "@/modules/auth/actions";

const initialState: AuthFormState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <TextField
        name="name"
        type="text"
        label="Имя"
        autoComplete="name"
        required
        placeholder="Сабина"
      />
      <TextField
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        placeholder="you@email.com"
      />
      <TextField
        name="password"
        type="password"
        label="Пароль"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="Минимум 8 символов"
      />

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Создаём аккаунт…" : "Создать аккаунт"}
      </Button>

      <p className="text-center text-sm text-foreground/70">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-brand-deep underline-offset-4 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
