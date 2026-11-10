/**
 * AI assistant / nutrition coach domain module.
 */

export {
  getAssistantPageData,
  getAssistantThread,
  sendAssistantMessage,
  createAssistantThread,
  AssistantServiceError,
} from "@/modules/assistant/service";
export {
  sendAssistantMessageSchema,
  type SendAssistantMessageInput,
} from "@/modules/assistant/schemas";
export {
  sendAssistantMessageAction,
  startNewAssistantThreadAction,
  type AssistantChatState,
} from "@/modules/assistant/actions";
export { buildAssistantUserContext } from "@/modules/assistant/context";
export { buildAssistantSystemPrompt } from "@/modules/assistant/prompt";
