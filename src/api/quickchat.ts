import { apiCall } from "./apicall";

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export interface QuickChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export const createConversation = (token: string): Promise<Conversation> =>
  apiCall("/quick-chat/conversations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const fetchConversations = (token: string): Promise<Conversation[]> =>
  apiCall("/quick-chat/conversations", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchConversationMessages = (
  token: string,
  id: string
): Promise<QuickChatMessage[]> =>
  apiCall(`/quick-chat/conversations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteConversation = (token: string, id: string): Promise<void> =>
  apiCall(`/quick-chat/conversations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
