import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchObjectives,
  postGenerateObjectives,
  postEvaluateObjectives,
  postAddObjective,
  patchObjective,
  deleteObjective,
  type LearningObjective,
} from "../api/objectives";
import type { Message } from "./useTopicChat";

export function useObjectives(courseId: string | undefined, topicId: string | undefined) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["objectives", courseId, topicId],
    queryFn: async () => {
      const token = await getToken();
      return fetchObjectives(token!, courseId!, topicId!);
    },
    enabled: !!courseId && !!topicId,
  });
}

export function useGenerateObjectives(courseId: string | undefined, topicId: string | undefined) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { courseTitle: string; topicTitle: string }) => {
      const token = await getToken();
      return postGenerateObjectives(token!, courseId!, topicId!, body);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["objectives", courseId, topicId], data);
    },
  });
}

export function useAddObjective(courseId: string, topicId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const token = await getToken();
      return postAddObjective(token!, courseId, topicId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives", courseId, topicId] });
    },
  });
}

export function useUpdateObjective(courseId: string, topicId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ objectiveId, text }: { objectiveId: string; text: string }) => {
      const token = await getToken();
      return patchObjective(token!, courseId, topicId, objectiveId, text);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["objectives", courseId, topicId],
        (prev: LearningObjective[] | undefined) => {
          if (!prev) return prev;
          return prev.map((obj) => (obj.id === data.id ? { ...obj, text: data.text } : obj));
        },
      );
    },
  });
}

export function useDeleteObjective(courseId: string, topicId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (objectiveId: string) => {
      const token = await getToken();
      return deleteObjective(token!, courseId, topicId, objectiveId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives", courseId, topicId] });
    },
  });
}

export function useEvaluateObjectives(courseId: string | undefined, topicId: string | undefined) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { messages: Message[]; objectiveTexts: string[] }) => {
      const token = await getToken();
      return postEvaluateObjectives(token!, courseId!, topicId!, body);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["objectives", courseId, topicId],
        (prev: LearningObjective[] | undefined) => {
          if (!prev) return prev;
          return prev.map((obj, idx) => ({
            ...obj,
            covered: obj.covered || data.coveredIndices.includes(idx),
          }));
        }
      );
    },
  });
}
