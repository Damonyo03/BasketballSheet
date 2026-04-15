'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import GlassCard from '@/components/ui/GlassCard';
import QuarterBadge from '@/components/ui/QuarterBadge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function PublicLivePage() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchLiveMatches = useCallback(async () => {
    // 1. Fetch matches that are 'live' or 'scheduled' for today
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(name, short_name, logo_url, color),
        away_team:teams!away_team_id(name, short_name, logo_url, color),
        league:leagues(name)
      `)
      .neq('status', 'finished')
      .order('scheduled_at', { ascending: true });

    if (!error && matches) {
      // 2. Map and fetch committee inputs for live matches
      const updatedMatches = await Promise.all(matches.map(async (m) => {
        const { data: inputs } = await supabase
          .from('match_score_inputs')
          .select('*')
          .eq('match_id', m.id);
        
        // Aggregate scores: Home Side Comm provides Home Score, Away Side Comm provides Away Score
        const homeInput = inputs?.find(i => i.team_side === 'home')?.score_json;
        const awayInput = inputs?.find(i => i.team_side === 'away')?.score_json;

        // Discrepancy logic: Check if they disagree on each other's scores
        const hasDiscrepancy = homeInput && awayInput && (
          homeInput.score !== (awayInput.reported_home_score ?? m.home_score) || 
          awayInput.score !== (homeInput.reported_away_score ?? m.away_score)
        );

        return {
          ...m,
          current_home_score: homeInput?.score ?? m.home_score,
          current_away_score: awayInput?.score ?? m.away_score,
          current_quarter: homeInput?.quarter ?? m.quarter,
          is_discrepancy: hasDiscrepancy
        };
      }));

      setLiveMatches(updatedMatches);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLiveMatches();
    
    // Subscribe to changes in score inputs for real-time updates
    const channel = supabase
      .channel('live-scores')
      .on('postgres_changes', { event: '*', table: 'match_score_inputs', schema: 'public' }, () => {
        fetchLiveMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchLiveMatches]);

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 pt-6 pb-24 space-y-6 animate-slide-up">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-orange-500/80 mb-1">
            Live Tournament
          </p>
          <h1 className="font-display text-4xl brand-gradient-text leading-tight">Northside League</h1>
        </div>
        <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-red-500 live-dot" />
           <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">REALTIME</span>
        </div>
      </header>

      {/* Hero Live Match */}
      {liveMatches.length > 0 ? (
        liveMatches.filter(m => m.status === 'live').map(match => (
          <GlassCard key={match.id} className="!p-0 overflow-hidden" glowOrange>
             <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/2">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{match.league?.name}</span>
                <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded animate-pulse">LIVE Q{match.current_quarter}</span>
             </div>
             
             <div className="p-6 flex items-center justify-between">
                <div className="text-center flex-1">
                   <p className="font-display text-4xl text-white outline-text">{match.current_home_score}</p>
                   <p className="text-sm font-bold text-white/80 mt-1 uppercase tracking-tighter">{match.home_team.short_name}</p>
                </div>
                <div className="px-4 font-display text-xl text-white/10 italic">VS</div>
                <div className="text-center flex-1">
                   <p className="font-display text-4xl text-white outline-text">{match.current_away_score}</p>
                   <p className="text-sm font-bold text-white/80 mt-1 uppercase tracking-tighter">{match.away_team.short_name}</p>
                </div>
             </div>

             <button 
               onClick={() => router.push(`/match/${match.id}`)}
               className="w-full py-3 bg-white/5 border-t border-white/5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hover:bg-white/10 transition-colors"
             >
               View Full Stats & Play-by-Play
             </button>
          </GlassCard>
        ))
      ) : (
        <GlassCard className="!p-10 text-center space-y-3">
           <span className="text-4xl">😴</span>
           <p className="text-white/30 italic text-sm font-medium">No live games at the moment. Check back later!</p>
        </GlassCard>
      )}

      {/* Upcoming Section */}
      <section className="space-y-4 pt-2">
         <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/20 ml-1">Upcoming Games</h2>
         <div className="space-y-3">
            {liveMatches.filter(m => m.status === 'scheduled').map(match => (
               <GlassCard key={match.id} className="!p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-white/20 uppercase">Home</span>
                        <span className="text-sm font-bold text-white">{match.home_team.short_name}</span>
                     </div>
                     <span className="text-white/10 font-bold italic">vs</span>
                     <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-white/20 uppercase">Away</span>
                        <span className="text-sm font-bold text-white">{match.away_team.short_name}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                        {match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                     </p>
                     <p className="text-[8px] text-white/20 uppercase font-bold">{match.venue || 'Center Gym'}</p>
                  </div>
               </GlassCard>
            ))}
         </div>
      </section>
    </div>
  );
}
