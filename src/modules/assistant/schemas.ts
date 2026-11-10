import { z } from "zod";

export const sendAssistantMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Введите вопрос")
    .max(2000, "Сообщение слишком длинное"),
  threadId: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.string().min(1).optional(),
  ),
});

export type SendAssistantMessageInput = z.infer<
  typeof sendAssistantMessageSchema
>;
