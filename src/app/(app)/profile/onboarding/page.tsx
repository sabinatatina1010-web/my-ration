import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/lib/auth";
import { getProfileBundle } from "@/modules/profile/service";

export const instant = false;

export default async function ProfileOnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { profile } = await getProfileBundle(session.user.id);

  if (profile?.onboardingCompleted) {
    redirect("/profile");
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-brand/15 bg-surface p-8 backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
        Шаг 1 из 1
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-brand-deep">
        Анкета
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/75">
        Укажите данные — рассчитаем калории, белки, жиры, углеводы и норму воды
        под вашу цель.
      </p>
      <div className="mt-8">
        <ProfileForm
          initialValues={{
            sex: profile?.sex,
            ageYears: profile?.ageYears,
            heightCm: profile?.heightCm,
            weightKg: profile?.weightKg,
            targetWeightKg: profile?.targetWeightKg,
            activityLevel: profile?.activityLevel,
            goal: profile?.goal,
          }}
        />
      </div>
    </section>
  );
}
