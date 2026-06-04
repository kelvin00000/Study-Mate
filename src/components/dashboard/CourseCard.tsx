interface CourseCardProps {
  title: string;
  description?: string;
  topicsCompleted: number;
  totalTopics: number;
  progressPercent: number;
  color?: string;
  icon?: string;
}

export function CourseCard({
  title,
  description,
  topicsCompleted,
  totalTopics,
  progressPercent,
  color = 'var(--primary)',
  icon = '📚',
}: CourseCardProps) {
  return (
    <div
      className="flex flex-col bg-white rounded-2xl p-5 border transition-shadow hover:shadow-lg cursor-pointer"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        {icon}
      </div>

      {/* Text */}
      <h3
        className="font-semibold text-base leading-snug mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm leading-relaxed mb-3 line-clamp-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress */}
      <div className="mt-3">
        <div
          className="flex justify-between text-xs mb-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>
            {topicsCompleted}/{totalTopics} topics
          </span>
          <span className="font-semibold" style={{ color }}>
            {progressPercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F0FF' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
