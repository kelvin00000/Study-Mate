import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { getAchievements } from "../api/achievements";

export function useAchievements() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const token = await getToken();
      return getAchievements(token!);
    },
    staleTime: 2 * 60_000,
  });
}
