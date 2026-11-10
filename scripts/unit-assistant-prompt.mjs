import assert from "node:assert/strict";
import { buildAssistantSystemPrompt } from "../src/modules/assistant/prompt.ts";
import { sendAssistantMessageSchema } from "../src/modules/assistant/schemas.ts";

const prompt = buildAssistantSystemPrompt(
  "Имя: Тест\nДневные нормы: 1800 ккал",
);

assert.match(prompt, /Мой рацион/);
assert.match(prompt, /Контекст пользователя/);
assert.match(prompt, /1800 ккал/);
assert.match(prompt, /не назначай лекарства/i);

const valid = sendAssistantMessageSchema.safeParse({
  content: "  Что поесть?  ",
  threadId: "",
});
assert.equal(valid.success, true);
assert.equal(valid.data.content, "Что поесть?");
assert.equal(valid.data.threadId, undefined);

const empty = sendAssistantMessageSchema.safeParse({ content: "   " });
assert.equal(empty.success, false);

console.log("UNIT_ASSISTANT_PROMPT_OK");
