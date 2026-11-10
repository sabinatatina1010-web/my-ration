import type { NutritionTarget } from "@/generated/prisma/client";

type NutritionTargetsCardProps = {
  target: NutritionTarget;
};

export function NutritionTargetsCard({ target }: NutritionTargetsCardProps) {
  const items = [
    { label: "Калории", value: `${target.calories} ккал` },
    { label: "Белки", value: `${target.proteinGrams} г` },
    { label: "Жиры", value: `${target.fatGrams} г` },
    { label: "Углеводы", value: `${target.carbsGrams} г` },
    { label: "Вода", value: `${target.waterMl} мл` },
  ];

  return (
    <div className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
      <h2 className="font-display text-2xl font-semibold text-brand-deep">
        Ваши дневные нормы
      </h2>
      <p className="mt-2 text-sm text-foreground/70">
        Рассчитаны по формуле Mifflin–St Jeor с учётом цели и активности.
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-brand/10 bg-white/70 px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-[0.14em] text-foreground/55">
              {item.label}
            </dt>
            <dd className="mt-2 text-lg font-semibold text-brand-deep">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
