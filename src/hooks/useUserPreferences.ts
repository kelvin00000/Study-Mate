import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiCall } from "../api/apicall";

interface UserPreferences {
  interests: string[];
  educationLevel: number;
  explanationDepth: number;
  learningGoal: string;
  studySessionDuration: number;
}

export function useUserPreferences() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const token = await getToken();
      return apiCall("/user/preferences", {
        headers: { Authorization: `Bearer ${token}` },
      }) as Promise<UserPreferences>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
