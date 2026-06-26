import { apiCall } from "./apicall";

export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  imageUrl: string | null;
  topicTitles: string[];
  totalTopics: number;
  topicsCompleted: number;
  progressPercent: number;
}

export interface CourseTopic {
  id: string;
  title: string;
  order: number;
  overview: string | null;
  completed: boolean;
}

export interface CourseDetail extends CourseListItem {
  topics: CourseTopic[];
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const fetchCourses = (token: string): Promise<CourseListItem[]> =>
  apiCall("/courses", { headers: authHeaders(token) });

export const fetchCourse = (token: string, id: string): Promise<CourseDetail> =>
  apiCall(`/courses/${id}`, { headers: authHeaders(token) });

export interface CoursePreview {
  description: string;
  icon: string;
  color: string;
  topics: string[];
  imageUrl?: string | null;
}

export const postGenerateTopics = (token: string, title: string): Promise<CoursePreview> =>
  apiCall("/courses/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });

export const postCreateCourse = (token: string, title: string, preview?: CoursePreview): Promise<CourseDetail> =>
  apiCall("/courses", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title, ...preview }),
  });

export const postCompleteTopic = (
  token: string,
  courseId: string,
  topicId: string
): Promise<{ success: boolean }> =>
  apiCall(`/courses/${courseId}/topics/${topicId}/complete`, {
    method: "POST",
    headers: authHeaders(token),
  });

export const patchCourse = (
  token: string,
  id: string,
  data: { title?: string; description?: string; icon?: string; color?: string },
): Promise<CourseDetail> =>
  apiCall(`/courses/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

export const deleteCourse = (token: string, id: string): Promise<{ success: boolean }> =>
  apiCall(`/courses/${id}`, { method: "DELETE", headers: authHeaders(token) });

export const postAddTopic = (
  token: string,
  courseId: string,
  title: string,
): Promise<CourseTopic> =>
  apiCall(`/courses/${courseId}/topics`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });

export const patchTopic = (
  token: string,
  courseId: string,
  topicId: string,
  title: string,
): Promise<CourseTopic> =>
  apiCall(`/courses/${courseId}/topics/${topicId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });

export const deleteTopic = (
  token: string,
  courseId: string,
  topicId: string,
): Promise<{ success: boolean }> =>
  apiCall(`/courses/${courseId}/topics/${topicId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

export const putTopicOverview = (
  token: string,
  courseId: string,
  topicId: string,
  overview: string,
): Promise<{ success: boolean }> =>
  apiCall(`/courses/${courseId}/topics/${topicId}/overview`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ overview }),
  });

export const putReorderTopics = (
  token: string,
  courseId: string,
  topicIds: string[],
): Promise<{ success: boolean }> =>
  apiCall(`/courses/${courseId}/topics/reorder`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ topicIds }),
  });
