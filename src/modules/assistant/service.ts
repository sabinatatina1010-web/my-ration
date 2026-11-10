import { withPrisma } from "@/lib/prisma";
import { hasOpenAIKey } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";
import { buildAssistantUserContext } from "@/modules/assistant/context";
import { buildAssistantSystemPrompt } from "@/modules/assistant/prompt";
import {
  sendAssistantMessageSchema,
  type SendAssistantMessageInput,
} from "@/modules/assistant/schemas";

export class AssistantServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "VALIDATION"
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "AI_UNAVAILABLE"
      | "AI_FAILED",
  ) {
    super(message);
    this.name = "AssistantServiceError";
  }
}

export async function getAssistantPageData(userId: string) {
  return withPrisma(async (db) => {
    const threads = await db.assistantThread.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    const activeThread = threads[0]
      ? await db.assistantThread.findUnique({
          where: { id: threads[0].id },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              take: 100,
            },
          },
        })
      : null;

    return {
      threads,
      activeThread,
    };
  });
}

export async function getAssistantThread(userId: string, threadId: string) {
  return withPrisma(async (db) => {
    const thread = await db.assistantThread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    });

    if (!thread) {
      throw new AssistantServiceError("Диалог не найден", "NOT_FOUND");
    }

    if (thread.userId !== userId) {
      throw new AssistantServiceError("Нет доступа к диалогу", "FORBIDDEN");
    }

    return thread;
  });
}

function makeThreadTitle(content: string): string {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length > 60 ? `${compact.slice(0, 57)}...` : compact;
}

export async function sendAssistantMessage(
  userId: string,
  rawInput: unknown,
) {
  if (!hasOpenAIKey()) {
    throw new AssistantServiceError(
      "OPENAI_API_KEY не настроен. Добавьте ключ в .env, чтобы AI-помощник работал.",
      "AI_UNAVAILABLE",
    );
  }

  const parsed = sendAssistantMessageSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new AssistantServiceError(
      parsed.error.issues[0]?.message ?? "Некорректное сообщение",
      "VALIDATION",
    );
  }

  const input: SendAssistantMessageInput = parsed.data;

  const thread = await withPrisma(async (db) => {
    if (input.threadId) {
      const existing = await db.assistantThread.findUnique({
        where: { id: input.threadId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 40,
          },
        },
      });

      if (!existing) {
        throw new AssistantServiceError("Диалог не найден", "NOT_FOUND");
      }

      if (existing.userId !== userId) {
        throw new AssistantServiceError("Нет доступа к диалогу", "FORBIDDEN");
      }

      return existing;
    }

    return db.assistantThread.create({
      data: {
        userId,
        title: makeThreadTitle(input.content),
      },
      include: {
        messages: true,
      },
    });
  });

  const userContext = await buildAssistantUserContext(userId);
  const systemPrompt = buildAssistantSystemPrompt(userContext);

  const history = thread.messages.map((message) => ({
    role: message.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
    content: message.content,
  }));

  let assistantText = "";

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: input.content },
      ],
    });

    assistantText = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch {
    throw new AssistantServiceError(
      "AI сейчас недоступен. Проверьте OPENAI_API_KEY и попробуйте ещё раз.",
      "AI_FAILED",
    );
  }

  if (!assistantText) {
    throw new AssistantServiceError(
      "AI не вернул ответ. Попробуйте переформулировать вопрос.",
      "AI_FAILED",
    );
  }

  return withPrisma(async (db) => {
    await db.assistantMessage.create({
      data: {
        threadId: thread.id,
        role: "USER",
        content: input.content,
      },
    });

    const assistantMessage = await db.assistantMessage.create({
      data: {
        threadId: thread.id,
        role: "ASSISTANT",
        content: assistantText,
      },
    });

    await db.assistantThread.update({
      where: { id: thread.id },
      data: {
        updatedAt: new Date(),
        title: thread.title ?? makeThreadTitle(input.content),
      },
    });

    const updatedThread = await db.assistantThread.findUnique({
      where: { id: thread.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    });

    return {
      thread: updatedThread!,
      assistantMessage,
    };
  });
}

export async function createAssistantThread(userId: string) {
  return withPrisma(async (db) => {
    return db.assistantThread.create({
      data: {
        userId,
        title: "Новый диалог",
      },
    });
  });
}
