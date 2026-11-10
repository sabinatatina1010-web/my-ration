"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  AssistantServiceError,
  createAssistantThread,
  sendAssistantMessage,
} from "@/modules/assistant/service";

export type AssistantChatState = {
  error: string | null;
};

export async function sendAssistantMessageAction(
  _prevState: AssistantChatState,
  formData: FormData,
): Promise<AssistantChatState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Нужно войти в аккаунт" };
  }

  try {
    const result = await sendAssistantMessage(session.user.id, {
      content: formData.get("content"),
      threadId: formData.get("threadId"),
    });

    revalidatePath("/assistant");
    revalidatePath(`/assistant/${result.thread.id}`);

    if (!formData.get("threadId")) {
      redirect(`/assistant/${result.thread.id}`);
    }

    return { error: null };
  } catch (error) {
    if (error instanceof AssistantServiceError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function startNewAssistantThreadAction(): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AssistantServiceError("Нужно войти в аккаунт", "FORBIDDEN");
  }

  const thread = await createAssistantThread(session.user.id);
  revalidatePath("/assistant");
  redirect(`/assistant/${thread.id}`);
}
