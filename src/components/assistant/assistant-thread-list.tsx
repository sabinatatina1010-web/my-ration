import Link from "next/link";

import { Button } from "@/components/ui/button";
import { startNewAssistantThreadAction } from "@/modules/assistant/actions";

type ThreadItem = {
  id: string;
  title: string | null;
  updatedAt: Date;
};

type AssistantThreadListProps = {
  threads: ThreadItem[];
  activeThreadId?: string;
};

export function AssistantThreadList({
  threads,
  activeThreadId,
}: AssistantThreadListProps) {
  return (
    <aside className="rounded-3xl border border-brand/15 bg-surface p-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-brand-deep">
          Диалоги
        </h2>
        <form action={startNewAssistantThreadAction}>
          <Button type="submit" variant="secondary" className="px-3 py-2">
            Новый
          </Button>
        </form>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {threads.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-brand/20 px-3 py-4 text-sm text-foreground/65">
            Пока нет диалогов. Задайте первый вопрос.
          </li>
        ) : (
          threads.map((thread) => {
            const active = thread.id === activeThreadId;
            return (
              <li key={thread.id}>
                <Link
                  href={`/assistant/${thread.id}`}
                  className={`block rounded-2xl px-3 py-3 text-sm transition ${
                    active
                      ? "bg-brand text-white"
                      : "bg-white/70 text-brand-deep hover:bg-white"
                  }`}
                >
                  <p className="line-clamp-2 font-medium">
                    {thread.title ?? "Без названия"}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      active ? "text-white/80" : "text-foreground/55"
                    }`}
                  >
                    {thread.updatedAt.toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
