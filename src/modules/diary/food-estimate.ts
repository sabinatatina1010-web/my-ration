import { z } from "zod";

import { hasOpenAIKey } from "@/lib/env";
import { estimateMacrosLocally } from "@/modules/diary/food-estimate-local";
import {
  normalizeMacros,
  type MacroBreakdown,
} from "@/modules/diary/macros";

export class FoodEstimateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FoodEstimateError";
  }
}

const aiEstimateSchema = z.object({
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
  carbsGrams: z.number().nonnegative(),
  portionGrams: z.number().positive().optional(),
  note: z.string().optional(),
});

export type FoodEstimateResult = MacroBreakdown & {
  portionGrams?: number;
  note: string;
  source: "local" | "openai";
};

async function estimateWithOpenAI(
  name: string,
  description?: string,
): Promise<FoodEstimateResult> {
  const { getOpenAIClient } = await import("@/lib/openai");
  const client = getOpenAIClient();

  const prompt = [
    "Оцени калорийность и БЖУ блюда для дневника питания.",
    "Верни только JSON: { calories, proteinGrams, fatGrams, carbsGrams, portionGrams?, note? }.",
    `Название: ${name}`,
    description ? `Описание: ${description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "Ты нутрициолог. Отвечай только валидным JSON без markdown.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new FoodEstimateError("AI не вернул оценку калорий");
  }

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd < 0) {
    throw new FoodEstimateError("AI вернул ответ в неожиданном формате");
  }

  const parsed = aiEstimateSchema.safeParse(
    JSON.parse(text.slice(jsonStart, jsonEnd + 1)),
  );

  if (!parsed.success) {
    throw new FoodEstimateError("AI вернул некорректные значения БЖУ");
  }

  const macros = normalizeMacros(parsed.data);

  return {
    ...macros,
    portionGrams: parsed.data.portionGrams,
    note: parsed.data.note ?? "Оценка AI ориентировочная, можно уточнить.",
    source: "openai",
  };
}

export async function estimateFoodNutrition(input: {
  name: string;
  description?: string;
}): Promise<FoodEstimateResult> {
  const text = [input.name, input.description].filter(Boolean).join(". ");
  const local = estimateMacrosLocally(text);

  if (local) {
    return {
      ...local,
      note: "Оценка по составу блюда (локальный расчёт). Можно поправить вручную.",
      source: "local",
    };
  }

  if (!hasOpenAIKey()) {
    throw new FoodEstimateError(
      "Не удалось распознать продукты. Укажите белки, жиры и углеводы — калории посчитаются автоматически. Для умной оценки добавьте OPENAI_API_KEY в .env.",
    );
  }

  try {
    return await estimateWithOpenAI(input.name, input.description);
  } catch (error) {
    if (error instanceof FoodEstimateError) {
      throw error;
    }

    throw new FoodEstimateError(
      "AI-оценка сейчас недоступна. Введите БЖУ вручную — калории посчитаются сами.",
    );
  }
}
