import { apiCall } from "./apicall";

export interface QuizQuestion {
  question: string;
  options: string[];      // always 4
  correctIndex: number;
  explanation: string;
}

export interface GeneratedQuiz {
  questions: QuizQuestion[];  // always 5
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const postGenerateQuiz = (
  token: string,
  courseId: string,
  topicId: string,
  body: {
    objectives: string[];
    courseTitle: string;
    topicTitle: string;
  }
): Promise<GeneratedQuiz> =>
  apiCall(`/courses/${courseId}/topics/${topicId}/quiz/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
