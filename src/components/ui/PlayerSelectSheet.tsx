'use client';

import { cn } from '@/lib/utils';
import type { Player, PlayerGameState, TeamInfo } from '@/lib/gameData';

interface PlayerSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (player: Player) => void;
  players: Player[];
  playerStates: Record<string, PlayerGameState>;
  team: TeamInfo;
  title: string;
  subtitle?: string;
}

export default function PlayerSelectSheet({
  isOpen,
  onClose,
  onSelect,
  players,
  playerStates,
  team,
  title,
  subtitle,
}: PlayerSelectSheetProps) {
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
        style={{ maxHeight: '75dvh' }}
      >
        <div
          className="glass-strong rounded-t-[28px] overflow-hidden"
          style={{ borderTop: `2px solid ${team.color}40` }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="px-5 pb-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
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

          {/* Player List */}
          <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: '55dvh' }}>
            <div className="space-y-1.5">
              {players.map(player => {
                const state = playerStates[player.id];
                const isUnavailable = state?.isEjected || state?.isSuspended;
                const suspendedTimeLeft = state?.suspendedAt
                  ? Math.max(0, Math.ceil((state.suspendedAt + 120000 - Date.now()) / 1000))
                  : 0;

                return (
                  <button
                    key={player.id}
                    disabled={isUnavailable}
                    onClick={() => !isUnavailable && onSelect(player)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-150',
                      isUnavailable
                        ? 'opacity-40 cursor-not-allowed'
                        : 'press-scale glass-hover',
                      !isUnavailable && 'glass'
                    )}
                    style={isUnavailable ? { background: 'rgba(255,255,255,0.02)' } : undefined}
                  >
                    {/* Jersey Number */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isUnavailable ? 'rgba(255,255,255,0.03)' : `${team.color}20`,
                        border: `1px solid ${isUnavailable ? 'rgba(255,255,255,0.05)' : `${team.color}40`}`,
                      }}
                    >
                      <span
                        className="font-display text-lg"
                        style={{ color: isUnavailable ? 'rgba(255,255,255,0.2)' : team.color }}
                      >
                        {player.number}
                      </span>
                    </div>

                    {/* Name & Position */}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-white truncate">{player.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/40">{player.position}</span>
                        {(state?.points ?? 0) > 0 && (
                          <span className="text-[10px] font-bold" style={{ color: team.color }}>
                            {state.points} PTS
                          </span>
                        )}
                        {(state?.fouls ?? 0) > 0 && (
                          <span className="text-[10px] text-yellow-400/70">{state.fouls} PF</span>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                      {state?.isEjected && (
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 tracking-widest">
                          EJECTED
                        </span>
                      )}
                      {state?.isSuspended && (
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-400 tracking-widest">
                          SITTING ({Math.floor(suspendedTimeLeft / 60)}:{String(suspendedTimeLeft % 60).padStart(2, '0')})
                        </span>
                      )}
                      {(state?.technicalFouls ?? 0) > 0 && !state?.isEjected && (
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-red-500/15 text-red-300 tracking-widest">
                          {state.technicalFouls} TECH
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
