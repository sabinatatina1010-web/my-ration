import type { WaterLog } from "@/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { deleteWaterLogAction } from "@/modules/water/actions";

type WaterLogListProps = {
  logs: WaterLog[];
};

export function WaterLogList({ logs }: WaterLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brand/20 bg-surface p-8 text-center backdrop-blur">
        <p className="font-display text-2xl font-semibold text-brand-deep">
          Сегодня воды ещё нет
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          Добавьте первый стакан — прогресс обновится на dashboard.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
      <h2 className="font-display text-2xl font-semibold text-brand-deep">
        Записи за сегодня
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {logs.map((log) => (
          <li
            key={log.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/10 bg-white/70 px-4 py-4"
          >
            <div>
              <p className="text-lg font-semibold text-brand-deep">
                {log.amountMl} мл
              </p>
              <p className="mt-1 text-xs text-foreground/55">
                {log.loggedAt.toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <form action={deleteWaterLogAction}>
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
