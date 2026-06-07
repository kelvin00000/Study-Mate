import { useTopicChat } from './useTopicChat';
import { setOverview } from '../lib/overviewCache';
import type { CourseDetail } from '../api/courses';

const overviewPrompt = (topicName: string, courseTitle: string) =>
  `Give a welcoming introduction to "${topicName}" as part of the "${courseTitle}" course. ` +
  `Explain what it is, why it matters, and the key concepts we'll explore together. ` +
  `Keep it encouraging and under 200 words.`;

export function useGenerateOverviews() {
  const { sendMessage } = useTopicChat();

  const generateOverviews = (course: CourseDetail) => {
    course.topics.forEach((topic) => {
      sendMessage(
        [{ role: 'user', content: overviewPrompt(topic.title, course.title) }],
        course.title,
        topic.title,
        () => {},
        (fullText) => setOverview(course.id, topic.id, fullText)
      ).catch(() => {
        // silently fail — TopicChatPage will generate on demand as fallback
      });
    });
  };

  return { generateOverviews };
}
