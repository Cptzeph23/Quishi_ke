/**
 * FILE:    frontend/src/lib/api/chatbot.ts
 * PURPOSE: AI chatbot API — send messages, retrieve session history
 */
import { api } from "./client";
import type { ChatResponse, ChatSession } from "@/lib/types";

export const chatbotApi = {
  /** Send a message, optionally continuing an existing session. */
  send: (message: string, sessionId?: string) =>
    api.post<ChatResponse>("/chatbot/", {
      message,
      ...(sessionId ? { session_id: sessionId } : {}),
    }).then((r) => r.data),

  /** Retrieve full message history for a session. */
  history: (sessionId: string) =>
    api.get<ChatSession>("/chatbot/", { params: { session_id: sessionId } })
       .then((r) => r.data),
};