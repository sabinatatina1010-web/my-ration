import Link from "next/link";
import { redirect } from "next/navigation";

import { DiaryDaySummary } from "@/components/diary/diary-day-summary";
import { FoodEntryForm } from "@/components/diary/food-entry-form";
import { FoodEntryList } from "@/components/diary/food-entry-list";
import { auth } from "@/lib/auth";
import { getDiaryDay } from "@/modules/diary/service";
import { isOnboardingCompleted } from "@/modules/profile/service";

export const instant = false;

export default async function DiaryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const onboarded = await isOnboardingCompleted(session.user.id);
  if (!onboarded) {
    redirect("/profile/onboarding");
  }

  const day = await getDiaryDay(session.user.id);
  const dateLabel = day.date.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-brand/15 bg-surface p-8 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
              Дневник питания
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-brand-deep">
              Сегодняшний рацион
            </h1>
            <p className="mt-3 max-w-2xl text-base text-foreground/75">
              Добавляйте блюда вручную и сразу видьте, как они влияют на дневную
              норму калорий и БЖУ.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-white"
          >
            К dashboard
          </Link>
        </div>
      </section>

      <DiaryDaySummary
        totals={day.totals}
        targets={day.targets}
        dateLabel={dateLabel}
      />

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <FoodEntryList grouped={day.grouped} />
        <FoodEntryForm />
      </div>
    </div>
  );
}
