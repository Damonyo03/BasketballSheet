'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreButtonProps {
  label: string;
  points: number;
  teamColor?: string;
  onScore: (points: number) => void;
}

export default function ScoreButton({ label, points, teamColor = '#FF6B1A', onScore }: ScoreButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onScore(points);
    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-2xl px-3 py-3 min-w-[56px]',
        'transition-all duration-150 press-scale',
        'border',
        isPressed && 'score-pop'
      )}
      style={{
        background: isPressed
          ? `${teamColor}30`
          : 'rgba(255,255,255,0.05)',
        borderColor: isPressed
          ? `${teamColor}80`
          : 'rgba(255,255,255,0.08)',
        boxShadow: isPressed
          ? `0 0 20px ${teamColor}40`
          : 'none',
      }}
    >
      <span
        className="font-display text-2xl leading-none"
        style={{ color: isPressed ? teamColor : 'rgba(255,255,255,0.9)' }}
      >
        +{points}
      </span>
      <span className="text-[8px] font-bold tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </span>
    </button>
  );
}
