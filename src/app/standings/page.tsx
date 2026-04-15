'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export default function StandingsPage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLeagues = useCallback(async () => {
    const { data } = await supabase.from('leagues').select('*');
    if (data) {
      setLeagues(data);
      if (data.length > 0 && !selectedLeagueId) setSelectedLeagueId(data[0].id);
    }
  }, [supabase, selectedLeagueId]);

  const fetchStandings = useCallback(async (leagueId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('league_id', leagueId)
      .order('wins', { ascending: false })
      .order('points_for', { ascending: false });
    
    if (data) {
      const enriched = data.map(team => ({
        ...team,
        pd: (team.points_for || 0) - (team.points_against || 0)
      })).sort((a, b) => b.wins - a.wins || b.pd - a.pd);
      setStandings(enriched);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  useEffect(() => {
    if (selectedLeagueId) fetchStandings(selectedLeagueId);
  }, [selectedLeagueId, fetchStandings]);

  return (
    <div className="px-4 pt-6 pb-24 space-y-6 animate-slide-up">
      <header>
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-orange-500/80 mb-1">
          League Tables
        </p>
        <h1 className="font-display text-4xl brand-gradient-text leading-tight">Standings</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {leagues.map(l => (
          <button
            key={l.id}
            onClick={() => setSelectedLeagueId(l.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              selectedLeagueId === l.id ? "brand-gradient text-white shadow-lg shadow-orange-500/20" : "glass text-white/40"
            )}
          >
            {l.name}
          </button>
        ))}
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 bg-white/5 border-b border-white/5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
           <div className="col-span-1">#</div>
           <div className="col-span-3">Team</div>
           <div className="col-span-2 text-center">W</div>
           <div className="col-span-2 text-center">L</div>
           <div className="col-span-2 text-center">PF</div>
           <div className="col-span-2 text-center text-orange-500">PD</div>
        </div>
        <div className="divide-y divide-white/5">
           {standings.map((team, idx) => (
             <div key={team.id} className="grid grid-cols-12 px-5 py-4 items-center">
                <div className="col-span-1 text-[10px] font-bold text-white/20">{idx + 1}</div>
                <div className="col-span-3 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-[10px] text-white" style={{ background: `${team.color}20`, border: `1px solid ${team.color}40` }}>
                     {team.short_name}
                   </div>
                   <span className="text-[11px] font-bold text-white truncate">{team.name}</span>
                </div>
                <div className="col-span-2 text-center font-display text-base text-white">{team.wins}</div>
                <div className="col-span-2 text-center font-display text-base text-white/40">{team.losses}</div>
                <div className="col-span-2 text-center font-display text-base text-white/60">{team.points_for}</div>
                <div className="col-span-2 text-center font-display text-base text-orange-500">
                  {team.pd > 0 ? `+${team.pd}` : team.pd}
                </div>
             </div>
           ))}
        </div>
        {standings.length === 0 && !loading && (
          <div className="p-10 text-center text-white/20 italic text-sm">No data available for this league.</div>
        )}
      </GlassCard>
    </div>
  );
}
