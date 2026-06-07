import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchCourses,
  fetchCourse,
  postCreateCourse,
  postGenerateTopics,
  postCompleteTopic,
  type CoursePreview,
} from "../api/courses";

export function useCourses() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const token = await getToken();
      return fetchCourses(token!);
    },
  });
}

export function useCourse(id: string | undefined) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["courses", id],
    queryFn: async () => {
      const token = await getToken();
      return fetchCourse(token!, id!);
    },
    enabled: !!id,
  });
}

export function useGenerateCourse() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (title: string) => {
      const token = await getToken();
      return postGenerateTopics(token!, title);
    },
  });
}

export function useCreateCourse() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, preview }: { title: string; preview?: CoursePreview }) => {
      const token = await getToken();
      return postCreateCourse(token!, title, preview);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCompleteTopic(courseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: string) => {
      const token = await getToken();
      return postCompleteTopic(token!, courseId, topicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
