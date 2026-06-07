import { apiCall } from "./apicall";
import type { Message } from "../hooks/useTopicChat";

export const fetchChatHistory = (token: string, topicId: string): Promise<Message[]> =>
  apiCall(`/chat/topic/${topicId}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
