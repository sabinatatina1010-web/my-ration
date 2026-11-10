import Link from "next/link";
import { redirect } from "next/navigation";

import { AssistantChat } from "@/components/assistant/assistant-chat";
import { AssistantThreadList } from "@/components/assistant/assistant-thread-list";
import { auth } from "@/lib/auth";
import { hasOpenAIKey } from "@/lib/env";
import { getAssistantPageData } from "@/modules/assistant/service";
import { isOnboardingCompleted } from "@/modules/profile/service";

export const instant = false;

export default async function AssistantPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const onboarded = await isOnboardingCompleted(session.user.id);
  if (!onboarded) {
    redirect("/profile/onboarding");
  }

  const data = await getAssistantPageData(session.user.id);

  if (data.activeThread) {
    redirect(`/assistant/${data.activeThread.id}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-brand/15 bg-surface p-8 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
              AI-помощник
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-brand-deep">
              Персональный нутрициолог
            </h1>
            <p className="mt-3 max-w-2xl text-base text-foreground/75">
              Спрашивайте про меню, БЖУ, перекусы и прогресс — ответы с учётом
              вашей анкеты и дневника.
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

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AssistantThreadList threads={data.threads} />
        <AssistantChat messages={[]} openAiConfigured={hasOpenAIKey()} />
      </div>
    </div>
  );
}
