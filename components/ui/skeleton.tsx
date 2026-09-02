import { HTMLAttributes } from 'react';

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-slate-800/80 border border-slate-700/50 ${className}`}
      {...props}
    />
  );
}
