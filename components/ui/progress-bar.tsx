import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  animated?: boolean;
  gradient?: boolean;
}

export function ProgressBar({
  value = 0,
  max = 100,
  className = '',
  animated = true,
  gradient = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        'relative',
        'h-2',
        'w-full',
        'overflow-hidden',
        'rounded-full',
        'bg-slate-700/50',
        className
      )}
    >
      <div
        className={cn(
          'h-full',
          'rounded-full',
          'transition-all',
          animated ? 'duration-600' : '',
          'ease-out',
          gradient
            ? 'bg-gradient-to-r from-orange-500 to-orange-300'
            : 'bg-orange-500'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}