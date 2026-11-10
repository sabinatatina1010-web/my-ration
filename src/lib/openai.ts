import OpenAI from "openai";

import { env, hasOpenAIKey } from "@/lib/env";

export function getOpenAIClient(): OpenAI {
  if (!hasOpenAIKey()) {
    throw new Error(
      "OPENAI_API_KEY не настроен. Добавьте ключ в .env, чтобы использовать AI-функции.",
    );
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}
