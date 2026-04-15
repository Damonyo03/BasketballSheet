'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export default function BracketPage() {
  const { id: leagueId } = useParams();
  const [matches, setMatches] = useState<any[]>([]);
  const [league, setLeague] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchBracketData = useCallback(async () => {
    if (!leagueId) return;
    setLoading(true);

    const { data: leagueData } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();
    
    setLeague(leagueData);

    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(name, short_name, color),
        away_team:teams!away_team_id(name, short_name, color)
      `)
      .eq('league_id', leagueId)
      .order('round_number', { ascending: true })
      .order('match_order', { ascending: true });

    if (matchesData) setMatches(matchesData);
    setLoading(false);
  }, [supabase, leagueId]);

  useEffect(() => {
    fetchBracketData();
  }, [fetchBracketData]);

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Group matches by round
  const rounds: Record<number, any[]> = {};
  matches.forEach(m => {
    if (!rounds[m.round_number]) rounds[m.round_number] = [];
    rounds[m.round_number].push(m);
  });

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  return (
    <div className="px-4 pt-6 pb-24 space-y-8 animate-slide-up">
      <header className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => router.push('/')}
            className="text-[10px] font-black tracking-widest uppercase text-white/30 hover:text-orange-500 transition-colors mb-1 flex items-center gap-1"
          >
            ← Back to Hub
          </button>
          <h1 className="font-display text-4xl brand-gradient-text leading-tight">{league?.name}</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tournament Bracket</p>
        </div>
        <div className="glass rounded-2xl px-3 py-2 text-center">
           <p className="text-[8px] font-black text-white/20 uppercase mb-0.5">Format</p>
           <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{league?.format?.replace('_', ' ') || 'Single Elim'}</p>
        </div>
      </header>

      <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth min-h-[60vh]">
        {roundNumbers.map((roundNum, idx) => (
          <div key={roundNum} className="flex-shrink-0 w-72 snap-center space-y-6">
            <div className="flex items-center gap-3 ml-2">
               <span className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                 {roundNum}
               </span>
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                 {roundNum === roundNumbers.length ? 'Finals' : roundNum === roundNumbers.length - 1 ? 'Semi-Finals' : `Round ${roundNum}`}
               </h2>
            </div>

            <div className={cn(
              "flex flex-col justify-around h-full",
              idx > 0 && "py-4" // Visual spacing for later rounds
            )}>
              {rounds[roundNum].map((match) => (
                <div key={match.id} className="relative py-4">
                  {/* Connector Lines (Simplified) */}
                  {idx < roundNumbers.length - 1 && (
                    <div className="absolute top-1/2 -right-4 w-4 h-[1px] bg-white/10" />
                  )}

                  <GlassCard 
                    className={cn(
                      "!p-0 overflow-hidden transition-all hover:scale-[1.02]",
                      match.status === 'live' ? "border-orange-500/50 shadow-lg shadow-orange-500/10" : ""
                    )}
                  >
                    {/* Home Team */}
                    <div className={cn(
                      "flex items-center justify-between px-4 py-3 border-b border-white/5",
                      match.winner_team_id === match.home_team_id ? "bg-green-500/10" : ""
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: match.home_team?.color || '#333' }} />
                        <span className={cn(
                          "text-sm font-bold truncate transition-colors",
                          match.winner_team_id === match.home_team_id ? "text-green-400" : "text-white/80"
                        )}>
                          {match.home_team?.short_name || (match.round_number > 1 ? 'TBD' : 'BYE')}
                        </span>
                      </div>
                      <span className="font-display text-lg text-white/40">{match.status !== 'scheduled' ? match.home_score : '-'}</span>
                    </div>

                    {/* Away Team */}
                    <div className={cn(
                      "flex items-center justify-between px-4 py-3",
                      match.winner_team_id === match.away_team_id ? "bg-green-500/10" : ""
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: match.away_team?.color || '#333' }} />
                        <span className={cn(
                          "text-sm font-bold truncate transition-colors",
                          match.winner_team_id === match.away_team_id ? "text-green-400" : "text-white/80"
                        )}>
                          {match.away_team?.short_name || (match.round_number > 1 ? 'TBD' : 'BYE')}
                        </span>
                      </div>
                      <span className="font-display text-lg text-white/40">{match.status !== 'scheduled' ? match.away_score : '-'}</span>
                    </div>

                    {/* Status Badge for Live Games */}
                    {match.status === 'live' && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg animate-pulse">
                        LIVE
                      </div>
                    )}
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {roundNumbers.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl space-y-4">
           <span className="text-5xl">🔭</span>
           <p className="text-white/40 font-medium italic">Bracket is being generated by the Commissioner...</p>
        </div>
      )}
    </div>
  );
}
