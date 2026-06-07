import { apiCall } from "./apicall";
import type { Message } from "../hooks/useTopicChat";

export interface LearningObjective {
  id: string;
  text: string;
  order: number;
  covered: boolean;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const fetchObjectives = (
  token: string,
  courseId: string,
  topicId: string
): Promise<LearningObjective[]> =>
  apiCall(`/courses/${courseId}/topics/${topicId}/objectives`, {
    headers: authHeaders(token),
  });

export const postGenerateObjectives = (
  token: string,
  courseId: string,
  topicId: string,
  body: { courseTitle: string; topicTitle: string }
): Promise<LearningObjective[]> =>
  apiCall(`/courses/${courseId}/topics/${topicId}/objectives/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

export const postEvaluateObjectives = (
  token: string,
  courseId: string,
  topicId: string,
  body: { messages: Message[]; objectiveTexts: string[] }
): Promise<{ coveredIndices: number[] }> =>
  apiCall(`/courses/${courseId}/topics/${topicId}/objectives/evaluate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
