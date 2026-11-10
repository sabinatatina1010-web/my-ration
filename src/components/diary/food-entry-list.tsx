import type { FoodEntry, MealType } from "@/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { deleteFoodEntryAction } from "@/modules/diary/actions";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/modules/diary/labels";

type FoodEntryListProps = {
  grouped: Record<MealType, FoodEntry[]>;
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FoodEntryList({ grouped }: FoodEntryListProps) {
  const hasEntries = MEAL_TYPE_ORDER.some((mealType) => grouped[mealType].length > 0);

  if (!hasEntries) {
    return (
      <div className="rounded-3xl border border-dashed border-brand/20 bg-surface p-8 text-center backdrop-blur">
        <p className="font-display text-2xl font-semibold text-brand-deep">
          Дневник пока пуст
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          Добавьте первое блюдо справа — калории и БЖУ сразу появятся в прогрессе дня.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {MEAL_TYPE_ORDER.map((mealType) => {
        const entries = grouped[mealType];
        if (entries.length === 0) {
          return null;
        }

        return (
          <section
            key={mealType}
            className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur"
          >
            <h3 className="font-display text-xl font-semibold text-brand-deep">
              {MEAL_TYPE_LABELS[mealType]}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-brand/10 bg-white/70 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-deep">{entry.name}</p>
                      <p className="mt-1 text-xs text-foreground/55">
                        {formatTime(entry.eatenAt)}
                        {entry.portionGrams ? ` · ${entry.portionGrams} г` : ""}
                      </p>
                      {entry.description ? (
                        <p className="mt-2 text-sm text-foreground/70">
                          {entry.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-foreground/75">
                        {Math.round(entry.calories)} ккал · Б {entry.proteinGrams} · Ж{" "}
                        {entry.fatGrams} · У {entry.carbsGrams}
                      </p>
                    </div>
                    <form action={deleteFoodEntryAction}>
                      <input type="hidden" name="entryId" value={entry.id} />
                      <Button type="submit" variant="ghost" className="px-3 py-2">
                        Удалить
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
