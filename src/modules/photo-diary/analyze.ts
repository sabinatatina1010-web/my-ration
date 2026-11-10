import { z } from "zod";

import { hasOpenAIKey } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";
import { normalizeMacros } from "@/modules/diary/macros";
import {
  photoAnalysisSchema,
  type PhotoAnalysis,
} from "@/modules/photo-diary/schemas";

export class PhotoAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoAnalysisError";
  }
}

const rawAiSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
  calories: z.number(),
  proteinGrams: z.number(),
  fatGrams: z.number(),
  carbsGrams: z.number(),
  portionGrams: z.number().optional(),
  confidence: z.number().optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        portionGrams: z.number().optional(),
      }),
    )
    .optional(),
});

export type PhotoAnalysisResult = {
  analysis: PhotoAnalysis;
  raw: unknown;
};

export async function analyzeFoodPhoto(input: {
  mimeType: string;
  base64: string;
}): Promise<PhotoAnalysisResult> {
  if (!hasOpenAIKey()) {
    throw new PhotoAnalysisError(
      "OPENAI_API_KEY не настроен. Добавьте ключ в файл .env, чтобы AI мог распознавать еду на фото.",
    );
  }

  const client = getOpenAIClient();

  const prompt = [
    "Ты нутрициолог. По фото еды оцени состав тарелки.",
    "Верни ТОЛЬКО JSON без markdown со полями:",
    "{ name, description?, mealType?, calories, proteinGrams, fatGrams, carbsGrams, portionGrams?, confidence?, items?: [{ name, portionGrams? }] }",
    "mealType одно из: BREAKFAST, LUNCH, DINNER, SNACK.",
    "Значения ориентировочные, но реалистичные для одной порции.",
  ].join("\n");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "Отвечай только валидным JSON-объектом.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${input.mimeType};base64,${input.base64}`,
              },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new PhotoAnalysisError("AI не вернул результат анализа фото");
    }

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < 0) {
      throw new PhotoAnalysisError("AI вернул ответ в неожиданном формате");
    }

    const rawJson = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as unknown;
    const parsedRaw = rawAiSchema.safeParse(rawJson);

    if (!parsedRaw.success) {
      throw new PhotoAnalysisError("AI вернул некорректные данные о блюде");
    }

    const macros = normalizeMacros(parsedRaw.data);
    const analysis = photoAnalysisSchema.parse({
      ...parsedRaw.data,
      ...macros,
      mealType: parsedRaw.data.mealType ?? "LUNCH",
    });

    return {
      analysis,
      raw: rawJson,
    };
  } catch (error) {
    if (error instanceof PhotoAnalysisError) {
      throw error;
    }

    throw new PhotoAnalysisError(
      "Не удалось проанализировать фото. Проверьте OPENAI_API_KEY и попробуйте другое изображение.",
    );
  }
}
