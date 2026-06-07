import { useAuth } from "@clerk/clerk-react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useTopicChat() {
  const { getToken } = useAuth();

  const sendMessage = async (
    messages: Message[],
    courseTitle: string,
    topicName: string,
    onDelta: (chunk: string) => void,
    onDone: (fullText: string) => void,
    save?: { topicId: string; userMessage: string }
  ): Promise<void> => {
    const token = await getToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const response = await fetch(`${baseUrl}/chat/topic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseTitle, topicName, messages, ...save }),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to chat API");
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
