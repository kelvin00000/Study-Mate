import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { getStreak, postActivity, getLeaderboard, type RecordActivityRequest } from "../api/streak";

export function useStreak() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const token = await getToken();
      return getStreak(token!);
    },
    staleTime: 60_000,
  });
}

export function useRecordActivity() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RecordActivityRequest) => {
      const token = await getToken();
      return postActivity(token!, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
    onError: () => {
      // swallow silently — never disrupt chat UX
    },
  });
}

export function useLeaderboard(enabled = false) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["streak", "leaderboard"],
    queryFn: async () => {
      const token = await getToken();
      return getLeaderboard(token!);
    },
    staleTime: 2 * 60_000,
    enabled,
  });
}
