import Link from "next/link";
import { redirect } from "next/navigation";

import { WeightChart } from "@/components/dashboard/weight-chart";
import { WeightForm } from "@/components/weight/weight-form";
import { WeightLogList } from "@/components/weight/weight-log-list";
import { auth } from "@/lib/auth";
import { GOAL_LABELS } from "@/modules/profile/labels";
import { isOnboardingCompleted } from "@/modules/profile/service";
import { getWeightPageData } from "@/modules/weight/service";
import type { NutritionGoal } from "@/generated/prisma/client";

export const instant = false;

export default async function WeightPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const onboarded = await isOnboardingCompleted(session.user.id);
  if (!onboarded) {
    redirect("/profile/onboarding");
  }

  const data = await getWeightPageData(session.user.id);
  const goalLabel = data.profile
    ? GOAL_LABELS[data.profile.goal as NutritionGoal]
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-brand/15 bg-surface p-8 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
              Контроль веса
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-brand-deep">
              Динамика веса
            </h1>
            <p className="mt-3 text-base text-foreground/75">
              Сейчас:{" "}
              <strong>
                {data.latest?.weightKg ?? data.profile?.weightKg ?? "—"} кг
              </strong>
              {data.profile?.targetWeightKg
                ? ` · цель ${data.profile.targetWeightKg} кг`
                : ""}
              {goalLabel ? ` · ${goalLabel}` : ""}
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
          График за 30 дней
        </h2>
        <div className="mt-6">
          <WeightChart
            data={data.chartData}
            fallbackWeightKg={data.profile?.weightKg ?? 0}
          />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <WeightLogList logs={data.logs} />
        <WeightForm
          defaultWeightKg={data.latest?.weightKg ?? data.profile?.weightKg}
        />
      </div>
    </div>
  );
}
