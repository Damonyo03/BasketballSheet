'use client';

import { cn } from '@/lib/utils';
import type { FoulType, TeamInfo } from '@/lib/gameData';

interface FoulSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (foulType: FoulType) => void;
  team: TeamInfo;
}

const foulOptions: { type: FoulType; label: string; emoji: string; description: string; color: string }[] = [
  {
    type: 'regular',
    label: 'Personal Foul',
    emoji: '🤚',
    description: 'Standard personal foul. 5 fouls = fouled out.',
    color: '#EAB308',
  },
  {
    type: 'technical',
    label: 'Technical Foul',
    emoji: '🟥',
    description: '2 technical fouls = EJECTED + 2-game suspension.',
    color: '#EF4444',
  },
  {
    type: 'unsportsmanlike',
    label: 'Unsportsmanlike Foul',
    emoji: '⚠️',
    description: 'Player must sit out for 2 minutes before returning.',
    color: '#F97316',
  },
];

export default function FoulSelectSheet({ isOpen, onClose, onSelect, team }: FoulSelectSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[70] animate-slide-up"
      >
        <div
          className="glass-strong rounded-t-[28px] overflow-hidden"
          style={{ borderTop: '2px solid rgba(239,68,68,0.4)' }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="px-5 pb-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Record Foul</h3>
                <p className="text-xs mt-0.5" style={{ color: team.color }}>{team.shortName} — {team.name}</p>
              </div>
              <button
                onClick={onClose}
                className="press-scale w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <span className="text-white/50 text-sm">✕</span>
              </button>
            </div>
          </div>

          {/* Foul Options */}
          <div className="px-4 pb-8 space-y-2">
            {foulOptions.map(opt => (
              <button
                key={opt.type}
                onClick={() => onSelect(opt.type)}
                className="press-scale w-full glass glass-hover rounded-2xl p-4 text-left flex items-start gap-3"
              >
                <span className="text-2xl mt-0.5">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: opt.color }}>{opt.label}</p>
                  <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{opt.description}</p>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}30` }}
                >
                  <span className="text-white/50 text-xs">›</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
