import Link from "next/link";
import { redirect } from "next/navigation";

import { NutritionTargetsCard } from "@/components/profile/nutrition-targets-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/lib/auth";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  SEX_LABELS,
} from "@/modules/profile/labels";
import { getProfileBundle } from "@/modules/profile/service";

export const instant = false;

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { profile, nutritionTarget } = await getProfileBundle(session.user.id);

  if (!profile?.onboardingCompleted) {
    redirect("/profile/onboarding");
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-brand/15 bg-surface p-8 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
              Профиль
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-brand-deep">
              Анкета и нормы
            </h1>
            <p className="mt-3 text-sm text-foreground/70">
              {SEX_LABELS[profile.sex]} · {profile.ageYears} лет ·{" "}
              {profile.heightCm} см · {profile.weightKg} кг ·{" "}
              {ACTIVITY_LABELS[profile.activityLevel]} ·{" "}
              {GOAL_LABELS[profile.goal]}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-deep"
          >
            К кабинету
          </Link>
        </div>
      </section>

      {nutritionTarget ? (
        <NutritionTargetsCard target={nutritionTarget} />
      ) : null}

      <section className="rounded-3xl border border-brand/15 bg-surface p-8 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          Обновить анкету
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          После сохранения нормы пересчитаются автоматически.
        </p>
        <div className="mt-6">
          <ProfileForm
            submitLabel="Сохранить и пересчитать"
            initialValues={{
              sex: profile.sex,
              ageYears: profile.ageYears,
              heightCm: profile.heightCm,
              weightKg: profile.weightKg,
              targetWeightKg: profile.targetWeightKg,
              activityLevel: profile.activityLevel,
              goal: profile.goal,
            }}
          />
        </div>
      </section>
    </div>
  );
}
