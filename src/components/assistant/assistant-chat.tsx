"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textarea-field";
import { sendAssistantMessageAction } from "@/modules/assistant/actions";

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string | Date;
};

type AssistantChatProps = {
  threadId?: string;
  messages: ChatMessage[];
  openAiConfigured: boolean;
};

const SUGGESTIONS = [
  "Что съесть на ужин в рамках моей нормы?",
  "Как распределить белки на день?",
  "Почему вес стоит на месте?",
  "Какие перекусы лучше выбрать?",
];

export function AssistantChat({
  threadId,
  messages,
  openAiConfigured,
}: AssistantChatProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pending]);

  if (!openAiConfigured) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
        <h2 className="font-display text-2xl font-semibold text-amber-950">
          AI-помощник пока недоступен
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-900/90">
          Добавьте <code className="rounded bg-white/70 px-1.5 py-0.5">OPENAI_API_KEY</code>{" "}
          в файл <code className="rounded bg-white/70 px-1.5 py-0.5">.env</code> и
          перезапустите сервер. Без ключа ответы не имитируются.
        </p>
      </section>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col rounded-3xl border border-brand/15 bg-surface backdrop-blur">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand/20 bg-white/50 p-6">
            <p className="font-display text-2xl font-semibold text-brand-deep">
              Спросите AI-нутрициолога
            </p>
            <p className="mt-2 text-sm text-foreground/70">
              Он знает вашу анкету, нормы, дневник и прогресс за сегодня.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-xl border border-brand/15 bg-white/80 px-3 py-2 text-left text-sm text-brand-deep transition hover:bg-white"
                  onClick={() => setContent(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "USER"
                  ? "ml-auto bg-brand text-white"
                  : "bg-white/80 text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}

        {pending ? (
          <div className="max-w-[90%] rounded-2xl bg-white/80 px-4 py-3 text-sm text-foreground/60">
            AI думает…
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-brand/10 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const value = content.trim();
          if (!value) {
            setError("Введите вопрос");
            return;
          }

          const formData = new FormData();
          formData.set("content", value);
          if (threadId) {
            formData.set("threadId", threadId);
          }

          startTransition(async () => {
            setError(null);
            const result = await sendAssistantMessageAction(
              { error: null },
              formData,
            );

            if (result?.error) {
              setError(result.error);
              return;
            }

            setContent("");
          });
        }}
      >
        <TextareaField
          name="content"
          label="Ваш вопрос"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Например: что лучше съесть после тренировки?"
        />

        {error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="mt-4">
          <Button type="submit" disabled={pending || !content.trim()}>
            {pending ? "Отправляем…" : "Спросить AI"}
          </Button>
        </div>
      </form>
    </div>
  );
}
