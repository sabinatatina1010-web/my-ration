import type { WeightLog } from "@/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { deleteWeightLogAction } from "@/modules/weight/actions";

type WeightLogListProps = {
  logs: WeightLog[];
};

export function WeightLogList({ logs }: WeightLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brand/20 bg-surface p-8 text-center backdrop-blur">
        <p className="font-display text-2xl font-semibold text-brand-deep">
          Пока нет замеров
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          Добавьте первый вес — график заполнится автоматически.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
      <h2 className="font-display text-2xl font-semibold text-brand-deep">
        История замеров
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {logs.map((log) => (
          <li
            key={log.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-brand/10 bg-white/70 px-4 py-4"
          >
            <div>
              <p className="text-lg font-semibold text-brand-deep">
                {log.weightKg} кг
              </p>
              <p className="mt-1 text-xs text-foreground/55">
                {log.loggedAt.toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {log.note ? (
                <p className="mt-2 text-sm text-foreground/70">{log.note}</p>
              ) : null}
            </div>
            <form action={deleteWeightLogAction}>
              <input type="hidden" name="logId" value={log.id} />
              <Button type="submit" variant="ghost" className="px-3 py-2">
                Удалить
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
