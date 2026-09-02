import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`border border-dashed border-slate-700 bg-[#0f172a]/60 p-8 text-center flex flex-col items-center justify-center transition-all ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
        <Icon className="w-6 h-6 text-orange-400" />
      </div>
      <h3 className="text-base font-semibold text-[#f8fafc] mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white px-4 py-2 text-sm font-medium transition-all duration-150 border border-orange-400 shadow-sm flex items-center gap-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
