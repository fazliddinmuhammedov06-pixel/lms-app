import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 40, className = '' }: AvatarProps) {
  // Extract initials (first letter of first and last name)
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Generate stable color based on name hash
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360; // 0-360
  const saturation = 55 + (hash % 15); // 55-70% (pleasant colors)
  const lightness = 40 + (hash % 15); // 40-55% (good contrast for white text)
  const bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        fontSize: `${size * 0.4}px`,
      }}
      className={cn(
        'flex items-center justify-center shrink-0',
        'rounded-full',
        'font-semibold text-white',
        'shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
        className
      )}
    >
      {initials || '?'}
    </div>
  );
}