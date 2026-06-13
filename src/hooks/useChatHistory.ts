import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchChatHistory } from "../api/chat";

export function useChatHistory(topicId: string | undefined) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["chatHistory", topicId],
    queryFn: async () => {
      const token = await getToken();
      return fetchChatHistory(token!, topicId!);
    },
    enabled: !!topicId,
    staleTime: 0, // always refetch on mount, but show cached data instantly
  });
}
