import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoMark } from "@/components/brand/logo-mark";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { auth } from "@/lib/auth";

export const instant = false;

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="hero-atmosphere flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-brand-deep"
        >
          <LogoMark className="h-7 w-7 text-brand" />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Мой рацион
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/diary"
            className="hidden text-sm font-semibold text-brand-deep/70 transition hover:text-brand-deep sm:block"
          >
            Дневник
          </Link>
          <Link
            href="/photo-diary"
            className="hidden text-sm font-semibold text-brand-deep/70 transition hover:text-brand-deep lg:block"
          >
            AI-фото
          </Link>
          <Link
            href="/water"
            className="hidden text-sm font-semibold text-brand-deep/70 transition hover:text-brand-deep lg:block"
          >
            Вода
          </Link>
          <Link
            href="/weight"
            className="hidden text-sm font-semibold text-brand-deep/70 transition hover:text-brand-deep lg:block"
          >
            Вес
          </Link>
          <Link
            href="/assistant"
            className="hidden text-sm font-semibold text-brand-deep/70 transition hover:text-brand-deep lg:block"
          >
            AI
          </Link>
          <Link
            href="/profile"
            className="hidden text-sm font-semibold text-brand-deep/70 transition hover:text-brand-deep sm:block"
          >
            Анкета
          </Link>
          <p className="hidden text-sm text-muted md:block">
            {session.user.name ?? session.user.email}
          </p>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16">{children}</main>
    </div>
  );
}
