'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import GlassCard from '@/components/ui/GlassCard';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CommitteeDashboard() {
  const [assignedMatches, setAssignedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { profile } = useAuth();
  const router = useRouter();

  const fetchAssignedMatches = useCallback(async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        league:leagues(name),
        home_team:teams!home_team_id(name, short_name),
        away_team:teams!away_team_id(name, short_name)
      `)
      .or(`home_committee_id.eq.${profile.id},away_committee_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssignedMatches(data);
    }
    setLoading(false);
  }, [supabase, profile]);

  useEffect(() => {
    fetchAssignedMatches();
  }, [fetchAssignedMatches]);

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 pt-6 pb-24 space-y-6 animate-slide-up">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500/80 mb-1">
          Scoring Duty
        </p>
        <h2 className="font-display text-4xl brand-gradient-text leading-tight">Committee Panel</h2>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2 ml-1">
          <span className="w-2 h-2 rounded-full bg-green-500 live-dot" />
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/40">My Assignments</h3>
        </div>

        {assignedMatches.length === 0 ? (
          <GlassCard className="!p-10 text-center space-y-3">
             <span className="text-4xl opacity-20">📋</span>
             <p className="text-white/30 italic text-sm">No matches assigned to you yet.</p>
          </GlassCard>
        ) : (
          assignedMatches.map(match => {
            const isHomeComm = match.home_committee_id === profile?.id;
            const assignedTeam = isHomeComm ? match.home_team : match.away_team;
            
            return (
              <GlassCard key={match.id} className="!p-0 overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-white/5 bg-white/2 flex items-center justify-between">
                   <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">
                     {match.league?.name} • R{match.round_number}
                   </span>
                   <span className={cn(
                     "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
                     match.status === 'live' ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/40"
                   )}>
                     {match.status}
                   </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="text-center flex-1">
                       <p className="text-2xl font-display text-white">{match.home_team?.short_name}</p>
                       <p className="text-[10px] text-white/30 uppercase font-black">Home</p>
                     </div>
                     <div className="px-4 font-display text-xl text-white/10 italic">VS</div>
                     <div className="text-center flex-1">
                       <p className="text-2xl font-display text-white">{match.away_team?.short_name}</p>
                       <p className="text-[10px] text-white/30 uppercase font-black">Away</p>
                     </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => router.push(`/dashboard/committee/score/${match.id}?team=${isHomeComm ? 'home' : 'away'}`)}
                      className="press-scale w-full py-3.5 rounded-xl brand-gradient text-[11px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Update Stats for {assignedTeam?.short_name}</span>
                      <span className="text-lg">🏀</span>
                    </button>
                    <p className="text-center text-[9px] text-white/20 mt-3 font-bold tracking-widest uppercase italic">
                      You are assigned to the {isHomeComm ? 'HOME' : 'AWAY'} side
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </section>
    </div>
  );
}
