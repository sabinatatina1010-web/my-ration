import Link from "next/link";
import { redirect } from "next/navigation";

import { ProgressMeter } from "@/components/dashboard/progress-meter";
import { WaterForm } from "@/components/water/water-form";
import { WaterLogList } from "@/components/water/water-log-list";
import { auth } from "@/lib/auth";
import { isOnboardingCompleted } from "@/modules/profile/service";
import { getWaterPageData } from "@/modules/water/service";

export const instant = false;

export default async function WaterPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const onboarded = await isOnboardingCompleted(session.user.id);
  if (!onboarded) {
    redirect("/profile/onboarding");
  }

  const data = await getWaterPageData(session.user.id);
  const todayLabel = new Date().toLocaleDateString("ru-RU", {
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
              Контроль воды
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-brand-deep">
              Водный баланс
            </h1>
            <p className="mt-3 capitalize text-base text-foreground/75">
              {todayLabel}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep"
          >
            К dashboard
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          Прогресс дня
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProgressMeter
            label="Выпито"
            current={data.totalMl}
            target={data.targetMl || 1}
            unit="мл"
            accentClassName="bg-[#4f7f9f]"
          />
          <div className="rounded-2xl border border-brand/10 bg-white/70 p-4">
            <p className="text-sm font-medium text-foreground/70">Осталось</p>
            <p className="mt-2 text-xl font-semibold text-brand-deep">
              {data.remainingMl} мл
            </p>
            <p className="mt-2 text-xs text-foreground/55">
              Норма из анкеты: {data.targetMl} мл · {data.percent}%
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <WaterLogList logs={data.logs} />
        <WaterForm />
      </div>
    </div>
  );
}
