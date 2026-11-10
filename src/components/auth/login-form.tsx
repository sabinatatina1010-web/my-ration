"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { loginAction, type AuthFormState } from "@/modules/auth/actions";

const initialState: AuthFormState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
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
        autoComplete="current-password"
        required
        placeholder="Минимум 8 символов"
      />

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Входим…" : "Войти"}
      </Button>

      <p className="text-center text-sm text-foreground/70">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-brand-deep underline-offset-4 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
