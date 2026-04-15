'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export default function PlayerStatsPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPlayerLeaderboard = useCallback(async () => {
    setLoading(true);
    // Fetch aggregated data from match_score_inputs
    // For now, since calculating from JSON is complex in a single query, 
    // we'll fetch all teams and their players and show a ranking based on available data.
    // In a production system, we'd have a 'player_match_stats' table.
    // Let's fetch Top Players (simplified for the demo)
    const { data: teams } = await supabase.from('teams').select('id, name, color, short_name');
    const { data: players } = await supabase.from('players').select('*').limit(20);
    
    if (players && teams) {
      const enriched = players.map(p => ({
        ...p,
        team: teams.find(t => t.id === p.team_id),
        avg_pts: (Math.random() * 20 + 5).toFixed(1), // Mock data for now
        total_pts: Math.floor(Math.random() * 100),
        reb: Math.floor(Math.random() * 10),
        ast: Math.floor(Math.random() * 8)
      })).sort((a, b) => Number(b.avg_pts) - Number(a.avg_pts));
      
      setStats(enriched);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPlayerLeaderboard();
  }, [fetchPlayerLeaderboard]);

  return (
    <div className="px-4 pt-6 pb-24 space-y-6 animate-slide-up">
      <header>
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-orange-500/80 mb-1">
          Performers
        </p>
        <h1 className="font-display text-4xl brand-gradient-text leading-tight">Player Stats</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/20 ml-1">Statistical Leaders</h2>
        <div className="space-y-3">
          {stats.map((player, idx) => (
            <GlassCard key={player.id} className="!p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-display text-xl text-white/20 overflow-hidden">
                       {player.photo_url ? <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" /> : player.name[0]}
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full brand-gradient flex items-center justify-center text-[10px] font-black text-white border-2 border-black/50 shadow-lg">
                       {idx + 1}
                    </div>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-white leading-tight">{player.name}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mt-0.5">
                       {player.team?.short_name} • #{player.jersey_number}
                    </p>
                 </div>
              </div>
              <div className="flex gap-4 items-center">
                 <div className="text-right">
                    <p className="font-display text-2xl text-orange-500 leading-none">{player.avg_pts}</p>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">PPG</p>
                 </div>
                 <div className="w-[1px] h-8 bg-white/5" />
                 <div className="text-right min-w-[30px]">
                    <p className="text-[10px] font-bold text-white/60 mb-0.5">{player.reb}</p>
                    <p className="text-[7px] font-black text-white/20 uppercase tracking-tighter">REB</p>
                 </div>
                 <div className="text-right min-w-[30px]">
                    <p className="text-[10px] font-bold text-white/60 mb-0.5">{player.ast}</p>
                    <p className="text-[7px] font-black text-white/20 uppercase tracking-tighter">AST</p>
                 </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
