import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { postGenerateQuiz } from "../api/quiz";

export function useGenerateQuiz(courseId: string | undefined, topicId: string | undefined) {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (body: {
      objectives: string[];
      courseTitle: string;
      topicTitle: string;
    }) => {
      const token = await getToken();
      return postGenerateQuiz(token!, courseId!, topicId!, body);
    },
    onError: () => {
      toast.error("Failed to generate quiz.");
    },
  });
}
