const key = (courseId: string, topicId: string) => `sm:ov:${courseId}:${topicId}`;

export const getOverview = (courseId: string, topicId: string): string | null =>
  localStorage.getItem(key(courseId, topicId));

export const setOverview = (courseId: string, topicId: string, text: string): void =>
  localStorage.setItem(key(courseId, topicId), text);
