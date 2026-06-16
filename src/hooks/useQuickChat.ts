import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchConversationMessages,
  createConversation,
  deleteConversation,
} from "../api/quickchat";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useConversations() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["quickConversations"],
    queryFn: async () => {
      const token = await getToken();
      return fetchConversations(token!);
    },
  });
}

export function useConversationMessages(id: string | null) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["quickConversationMessages", id],
    queryFn: async () => {
      const token = await getToken();
      return fetchConversationMessages(token!, id!);
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return createConversation(token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quickConversations"] });
    },
  });
}

export function useDeleteConversation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteConversation(token!, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quickConversations"] });
    },
  });
}

export function useQuickChatStream() {
  const { getToken } = useAuth();

  const sendMessage = async (
    conversationId: string,
    messages: Message[],
    userMessage: string,
    onDelta: (chunk: string) => void,
    onDone: (fullText: string) => void
  ): Promise<void> => {
    const token = await getToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const response = await fetch(
      `${baseUrl}/quick-chat/conversations/${conversationId}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, messages, userMessage }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to quick chat API");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          onDone(fullText);
          return;
        }
        try {
          const parsed = JSON.parse(data) as { delta?: string };
          if (parsed.delta) {
            fullText += parsed.delta;
            onDelta(parsed.delta);
          }
        } catch {
          // ignore malformed chunks
        }
      }
    }

    onDone(fullText);
  };

  return { sendMessage };
}
