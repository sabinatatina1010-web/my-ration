import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { LogoMark } from "@/components/brand/logo-mark";
import {
  HomeAuthCta,
  HomeAuthNav,
} from "@/components/layout/home-auth-controls";

function NavFallback() {
  return <div className="h-10 w-36 rounded-full bg-brand/10" aria-hidden />;
}

function CtaFallback() {
  return (
    <div className="mt-8 flex flex-wrap gap-3" aria-hidden>
      <div className="h-12 w-48 rounded-full bg-accent/40" />
      <div className="h-12 w-52 rounded-full border border-brand/10 bg-white/70" />
    </div>
  );
}

function LeafAccent({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M39 7C27 9 17.5 17 13 29c7-.5 13.2 1.8 18.2 6.8C39 28 41.5 18.5 39 7Z"
        fill="currentColor"
      />
      <path
        d="M27 14c-2.4 6.2-6.6 11-12.2 14.4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <section className="hero-atmosphere relative overflow-hidden">
        <LeafAccent className="leaf-float pointer-events-none absolute left-[8%] top-[18%] h-10 w-10 text-brand/35" />
        <LeafAccent className="leaf-float-delayed pointer-events-none absolute right-[42%] top-[12%] hidden h-8 w-8 text-brand/25 md:block" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-brand-deep"
          >
            <LogoMark className="h-8 w-8 text-brand" />
            <span className="font-display text-xl font-extrabold tracking-tight">
              Мой рацион
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-brand-deep/75 md:flex">
            <a href="#about" className="transition hover:text-brand-deep">
              О нас
            </a>
            <a href="#features" className="transition hover:text-brand-deep">
              Возможности
            </a>
            <a href="#start" className="transition hover:text-brand-deep">
              Старт
            </a>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <Suspense fallback={<NavFallback />}>
              <HomeAuthNav />
            </Suspense>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-10">
          <div className="hero-rise max-w-xl">
            <p className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-deep sm:text-5xl lg:text-[3.4rem]">
              Мой рацион
            </p>
            <h1 className="mt-4 text-2xl font-bold leading-snug text-brand-deep sm:text-3xl">
              Правильное питание без жёстких диет
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Считайте калории и БЖУ, ведите дневник и получайте AI-подсказки под
              ваш темп жизни.
            </p>
            <Suspense fallback={<CtaFallback />}>
              <HomeAuthCta />
            </Suspense>
          </div>

          <div className="hero-image-in relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-white/35 blur-2xl" />
            <Image
              src="/images/hero-bowl.jpg"
              alt="Здоровая тарелка с курицей, овощами и яйцом"
              width={960}
              height={720}
              priority
              className="relative w-full rounded-[2rem] object-cover shadow-[0_24px_60px_rgba(29,92,58,0.16)]"
            />
            <LeafAccent className="leaf-float pointer-events-none absolute -bottom-3 left-6 h-9 w-9 text-brand/45" />
            <LeafAccent className="leaf-float-delayed pointer-events-none absolute -right-2 top-10 h-8 w-8 text-brand/30" />
          </div>
        </div>
      </section>

      <section id="about" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">
            Питаться правильно и вкусно — легко
          </h2>

          <div className="mt-10 grid items-stretch gap-6 overflow-hidden rounded-[2rem] bg-brand-soft lg:grid-cols-[1.1fr_1fr]">
            <div className="relative min-h-[260px]">
              <Image
                src="/images/about-plating.jpg"
                alt="Приготовление полезного блюда"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
              <p className="text-base leading-relaxed text-brand-deep/85 sm:text-lg">
                «Мой рацион» помогает держать питание под контролем без сложной
                математики: нормы калорий и БЖУ, дневник, фото еды и персональный
                AI-помощник — в одном спокойном кабинете.
              </p>
              <Link
                href="/register"
                className="cta-gradient mt-8 inline-flex w-fit items-center justify-center rounded-full px-6 py-3 text-sm font-extrabold uppercase tracking-[0.04em] text-white"
              >
                Попробовать
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="bg-[linear-gradient(180deg,#ffffff_0%,#eef8ef_100%)] px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">
            Мой рацион — ваш правильный выбор
          </h2>
          <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">
            Всё нужное для привычки питаться осознанно — без перегруза.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            <article className="relative overflow-hidden rounded-[1.75rem] bg-brand-soft lg:row-span-2">
              <div className="relative h-56 lg:h-full lg:min-h-[420px]">
                <Image
                  src="/images/feature-ingredients.jpg"
                  alt="Свежие продукты"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-deep/80 to-transparent p-5">
                  <h3 className="text-lg font-extrabold text-white">
                    Понятные нормы
                  </h3>
                  <p className="mt-1 text-sm text-white/90">
                    Калории, БЖУ и вода — по вашей анкете
                  </p>
                </div>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[1.75rem] bg-white lg:col-span-2">
              <div className="grid h-full min-h-[220px] md:grid-cols-2">
                <div className="relative min-h-[200px]">
                  <Image
                    src="/images/feature-diary.jpg"
                    alt="Дневник питания"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-col justify-center p-6">
                  <h3 className="text-xl font-extrabold text-brand-deep">
                    Дневник и AI-фото
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Добавляйте блюда вручную или по фото — оценка порции и БЖУ
                    за секунды.
                  </p>
                </div>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[1.75rem] bg-brand-soft">
              <div className="relative h-56">
                <Image
                  src="/images/feature-coach.jpg"
                  alt="AI-помощник по питанию"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-deep/80 to-transparent p-5">
                  <h3 className="text-lg font-extrabold text-white">
                    AI-нутрициолог
                  </h3>
                  <p className="mt-1 text-sm text-white/90">
                    Ответы с учётом вашего прогресса
                  </p>
                </div>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[1.75rem] bg-white p-6 shadow-[0_10px_30px_rgba(29,92,58,0.06)]">
              <div>
                <h3 className="text-xl font-extrabold text-brand-deep">
                  Вес и вода
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Замеры, график и дневная норма воды рядом с рационом.
                </p>
              </div>
              <Link
                href="/register"
                className="mt-6 inline-flex w-fit text-sm font-extrabold text-accent underline-offset-4 hover:underline"
              >
                Начать контроль →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section id="start" className="bg-brand-soft px-6 py-16 sm:py-20">
        <div className="hero-rise-delayed mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-white px-8 py-10 shadow-[0_18px_50px_rgba(29,92,58,0.08)] sm:flex-row sm:items-center sm:px-12">
          <div>
            <p className="font-display text-3xl font-extrabold tracking-tight text-brand-deep">
              Готовы начать?
            </p>
            <p className="mt-2 max-w-md text-muted">
              Создайте аккаунт и заполните короткую анкету — нормы рассчитаются
              сразу.
            </p>
          </div>
          <Link
            href="/register"
            className="cta-gradient inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-extrabold uppercase tracking-[0.04em] text-white"
          >
            Создать аккаунт
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand/10 bg-white px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <div className="flex items-center gap-2 text-brand-deep">
            <LogoMark className="h-5 w-5 text-brand" />
            <span className="font-bold">Мой рацион</span>
          </div>
          <p>AI-платформа правильного питания</p>
        </div>
      </footer>
    </div>
  );
}
