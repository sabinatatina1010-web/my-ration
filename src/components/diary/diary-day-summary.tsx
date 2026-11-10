import { ProgressMeter } from "@/components/dashboard/progress-meter";
import type { DiaryDayTotals } from "@/modules/diary/service";
import type { MacroNutrients } from "@/types";

type DiaryDaySummaryProps = {
  totals: DiaryDayTotals;
  targets: (MacroNutrients & { waterMl: number }) | null;
  dateLabel: string;
};

export function DiaryDaySummary({
  totals,
  targets,
  dateLabel,
}: DiaryDaySummaryProps) {
  return (
    <section className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
      <h2 className="font-display text-2xl font-semibold text-brand-deep">
        Итоги дня
      </h2>
      <p className="mt-2 capitalize text-sm text-foreground/70">{dateLabel}</p>
      <p className="mt-1 text-sm text-foreground/65">
        Записей: {totals.entriesCount}
      </p>

      {targets ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProgressMeter
            label="Калории"
            current={totals.calories}
            target={targets.calories}
            unit="ккал"
          />
          <ProgressMeter
            label="Белки"
            current={totals.proteinGrams}
            target={targets.proteinGrams}
            unit="г"
            accentClassName="bg-[#3f7f5f]"
          />
          <ProgressMeter
            label="Жиры"
            current={totals.fatGrams}
            target={targets.fatGrams}
            unit="г"
            accentClassName="bg-accent"
          />
          <ProgressMeter
            label="Углеводы"
            current={totals.carbsGrams}
            target={targets.carbsGrams}
            unit="г"
            accentClassName="bg-[#6f8f4f]"
          />
        </div>
      ) : (
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/70 px-3 py-3">
            <dt className="text-foreground/55">Калории</dt>
            <dd className="mt-1 font-semibold text-brand-deep">
              {totals.calories} ккал
            </dd>
          </div>
          <div className="rounded-2xl bg-white/70 px-3 py-3">
            <dt className="text-foreground/55">Белки</dt>
            <dd className="mt-1 font-semibold text-brand-deep">
              {totals.proteinGrams} г
            </dd>
          </div>
          <div className="rounded-2xl bg-white/70 px-3 py-3">
            <dt className="text-foreground/55">Жиры</dt>
            <dd className="mt-1 font-semibold text-brand-deep">
              {totals.fatGrams} г
            </dd>
          </div>
          <div className="rounded-2xl bg-white/70 px-3 py-3">
            <dt className="text-foreground/55">Углеводы</dt>
            <dd className="mt-1 font-semibold text-brand-deep">
              {totals.carbsGrams} г
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
