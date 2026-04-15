'use client';

import { cn } from '@/lib/utils';

interface QuarterBadgeProps {
  quarter: number;
  isActive: boolean;
  onClick?: () => void;
}

export default function QuarterBadge({ quarter, isActive, onClick }: QuarterBadgeProps) {
  const label = quarter <= 4 ? `Q${quarter}` : `OT${quarter - 4}`;

  return (
    <button
      onClick={onClick}
      className={cn(
        'press-scale px-3 py-1.5 rounded-xl text-xs font-bold tracking-widest transition-all duration-200',
        isActive
          ? 'brand-gradient text-white shadow-lg'
          : 'glass text-white/40 hover:text-white/60'
      )}
    >
      {label}
    </button>
  );
}
