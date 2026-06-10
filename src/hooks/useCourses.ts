import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchCourses,
  fetchCourse,
  postCreateCourse,
  postGenerateTopics,
  postCompleteTopic,
  patchCourse,
  deleteCourse,
  postAddTopic,
  patchTopic,
  deleteTopic,
  putReorderTopics,
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

export function useUpdateCourse(courseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title?: string; description?: string; icon?: string; color?: string }) => {
      const token = await getToken();
      return patchCourse(token!, courseId, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["courses", courseId], data);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const token = await getToken();
      return deleteCourse(token!, courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useAddTopic(courseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const token = await getToken();
      return postAddTopic(token!, courseId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
    },
  });
}

export function useUpdateTopic(courseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ topicId, title }: { topicId: string; title: string }) => {
      const token = await getToken();
      return patchTopic(token!, courseId, topicId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
    },
  });
}

export function useDeleteTopic(courseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: string) => {
      const token = await getToken();
      return deleteTopic(token!, courseId, topicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
    },
  });
}

export function useReorderTopics(courseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (topicIds: string[]) => {
      const token = await getToken();
      return putReorderTopics(token!, courseId, topicIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
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
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}
