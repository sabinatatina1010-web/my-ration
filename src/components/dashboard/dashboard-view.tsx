import Link from "next/link";

import { ProgressMeter } from "@/components/dashboard/progress-meter";
import { WeightChart } from "@/components/dashboard/weight-chart";
import type { DashboardSummary } from "@/modules/dashboard/service";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
} from "@/modules/profile/labels";
import type { ActivityLevel, NutritionGoal } from "@/generated/prisma/client";

type DashboardViewProps = {
  userName: string | null | undefined;
  summary: DashboardSummary;
};

export function DashboardView({ userName, summary }: DashboardViewProps) {
  const goalLabel =
    GOAL_LABELS[summary.profile.goal as NutritionGoal] ?? summary.profile.goal;
  const activityLabel =
    ACTIVITY_LABELS[summary.profile.activityLevel as ActivityLevel] ??
    summary.profile.activityLevel;

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-brand/15 bg-surface p-8 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
              Dashboard
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-brand-deep">
              Здравствуйте{userName ? `, ${userName}` : ""}
            </h1>
            <p className="mt-3 capitalize text-foreground/70">
              {summary.todayLabel}
            </p>
            <p className="mt-2 max-w-2xl text-sm text-foreground/70">
              Цель: {goalLabel}. Активность: {activityLabel}. Текущий вес:{" "}
              {summary.latestWeightKg ?? summary.profile.weightKg} кг
              {summary.profile.targetWeightKg
                ? ` · цель ${summary.profile.targetWeightKg} кг`
                : ""}
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/diary"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-deep"
            >
              Дневник питания
            </Link>
            <Link
              href="/photo-diary"
              className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-white"
            >
              AI-фото
            </Link>
            <Link
              href="/water"
              className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-white"
            >
              Вода
            </Link>
            <Link
              href="/weight"
              className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-white"
            >
              Вес
            </Link>
            <Link
              href="/assistant"
              className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-white"
            >
              AI-помощник
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-white"
            >
              Анкета
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-brand-deep">
            Прогресс за сегодня
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Сравнение факта с дневной нормой. Добавляйте блюда в{" "}
            <Link href="/diary" className="font-semibold text-brand-deep underline-offset-4 hover:underline">
              дневнике
            </Link>
            .
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ProgressMeter
              label="Калории"
              current={summary.today.calories}
              target={summary.targets.calories}
              unit="ккал"
            />
            <ProgressMeter
              label="Белки"
              current={summary.today.proteinGrams}
              target={summary.targets.proteinGrams}
              unit="г"
              accentClassName="bg-[#3f7f5f]"
            />
            <ProgressMeter
              label="Жиры"
              current={summary.today.fatGrams}
              target={summary.targets.fatGrams}
              unit="г"
              accentClassName="bg-accent"
            />
            <ProgressMeter
              label="Углеводы"
              current={summary.today.carbsGrams}
              target={summary.targets.carbsGrams}
              unit="г"
              accentClassName="bg-[#6f8f4f]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
            <h2 className="font-display text-2xl font-semibold text-brand-deep">
              Вода
            </h2>
            <div className="mt-4">
              <ProgressMeter
                label="Выпито сегодня"
                current={summary.today.waterMl}
                target={summary.targets.waterMl}
                unit="мл"
                accentClassName="bg-[#4f7f9f]"
              />
            </div>
            <p className="mt-3 text-sm text-foreground/65">
              Записей воды сегодня: {summary.today.waterEntriesCount}.{" "}
              <Link
                href="/water"
                className="font-semibold text-brand-deep underline-offset-4 hover:underline"
              >
                Добавить воду
              </Link>
            </p>
          </div>

          <div className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
            <h2 className="font-display text-2xl font-semibold text-brand-deep">
              Остаток на день
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/70 px-3 py-3">
                <dt className="text-foreground/55">Калории</dt>
                <dd className="mt-1 font-semibold text-brand-deep">
                  {summary.remaining.calories} ккал
                </dd>
              </div>
              <div className="rounded-2xl bg-white/70 px-3 py-3">
                <dt className="text-foreground/55">Белки</dt>
                <dd className="mt-1 font-semibold text-brand-deep">
                  {summary.remaining.proteinGrams} г
                </dd>
              </div>
              <div className="rounded-2xl bg-white/70 px-3 py-3">
                <dt className="text-foreground/55">Жиры</dt>
                <dd className="mt-1 font-semibold text-brand-deep">
                  {summary.remaining.fatGrams} г
                </dd>
              </div>
              <div className="rounded-2xl bg-white/70 px-3 py-3">
                <dt className="text-foreground/55">Углеводы</dt>
                <dd className="mt-1 font-semibold text-brand-deep">
                  {summary.remaining.carbsGrams} г
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-foreground/65">
              Приёмов пищи сегодня: {summary.today.mealsCount}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          Динамика веса
        </h2>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground/70">
            Последние 14 дней по реальным записям из базы.
          </p>
          <Link
            href="/weight"
            className="text-sm font-semibold text-brand-deep underline-offset-4 hover:underline"
          >
            Открыть вес
          </Link>
        </div>
        <div className="mt-6">
          <WeightChart
            data={summary.weightHistory}
            fallbackWeightKg={summary.profile.weightKg}
          />
        </div>
      </section>
    </div>
  );
}
