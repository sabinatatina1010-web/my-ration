import Link from "next/link";

import { auth } from "@/lib/auth";

export async function HomeAuthNav() {
  const session = await auth();

  if (session?.user) {
    return (
      <Link
        href="/dashboard"
        className="rounded-full bg-white/70 px-4 py-2 font-bold text-brand-deep transition hover:bg-white"
      >
        Кабинет
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="hidden font-semibold text-brand-deep/80 underline-offset-4 hover:underline sm:inline"
      >
        Войти
      </Link>
      <Link
        href="/register"
        className="cta-gradient rounded-full px-4 py-2 font-bold text-white transition"
      >
        Регистрация
      </Link>
    </>
  );
}

export async function HomeAuthCta() {
  const session = await auth();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={session?.user ? "/dashboard" : "/register"}
        className="cta-gradient inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-extrabold uppercase tracking-[0.04em] text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      >
        {session?.user ? "Открыть кабинет" : "Начать бесплатно"}
      </Link>
      {!session?.user ? (
        <Link
          href="/login"
          className="inline-flex items-center rounded-full border border-brand/15 bg-white/75 px-6 py-3.5 text-sm font-bold text-brand-deep transition hover:bg-white"
        >
          У меня уже есть аккаунт
        </Link>
      ) : null}
    </div>
  );
}
