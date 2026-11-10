import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="hero-atmosphere flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-brand-deep"
        >
          <LogoMark className="h-7 w-7 text-brand" />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Мой рацион
          </span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
