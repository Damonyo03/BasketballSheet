'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GlassCard from '@/components/ui/GlassCard';
import ScoreButton from '@/components/ui/ScoreButton';
import QuarterBadge from '@/components/ui/QuarterBadge';
import PlayerSelectSheet from '@/components/ui/PlayerSelectSheet';
import FoulSelectSheet from '@/components/ui/FoulSelectSheet';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

// Types adapted from existing lib/gameData.ts
type FoulType = 'regular' | 'technical' | 'unsportsmanlike';
type Player = { id: string; name: string; number: string; team_id: string };
type PlayerStats = { points: number; fouls: number; technicalFouls: number; unsportsmanlikeFouls: number; isEjected: boolean; isSuspended: boolean; suspendedAt: number | null };

const SUSPENSION_DURATION_MS = 2 * 60 * 1000;
const TECH_FOUL_EJECTION_LIMIT = 2;

export default function CommitteeScoringPage() {
  const { id: matchId } = useParams();
  const searchParams = useSearchParams();
  const teamSide = searchParams.get('team') as 'home' | 'away';
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useAuth();

  // --- Match & Team State ---
  const [match, setMatch] = useState<any>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Scoring State (Matches the JSON structure) ---
  const [score, setScore] = useState(0);
  const [quarter, setQuarter] = useState(1);
  const [quarterScores, setQuarterScores] = useState<number[]>([0, 0, 0, 0]);
  const [teamFouls, setTeamFouls] = useState<number[]>([0, 0, 0, 0]);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>({});
  const [events, setEvents] = useState<any[]>([]);

  // --- UI State ---
  const [sheet, setSheet] = useState<{ type: 'none' | 'player-score' | 'player-foul' | 'foul-type' | 'finalize'; points?: number; player?: Player }>({ type: 'none' });
  const [notification, setNotification] = useState<{ message: string; color: string } | null>(null);

  // 1. Initial Load
  useEffect(() => {
    async function init() {
      if (!matchId || !profile) return;

      // Fetch Match
      const { data: matchData } = await supabase
        .from('matches')
        .select(`*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)`)
        .eq('id', matchId)
        .single();
      
      if (!matchData) return;
      setMatch(matchData);

      // Verify assignment
      const isAssigned = (teamSide === 'home' && matchData.home_committee_id === profile.id) ||
                         (teamSide === 'away' && matchData.away_committee_id === profile.id);
      
      // Load Existing Input if any
      const { data: inputData } = await supabase
        .from('match_score_inputs')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', profile.id)
        .single();

      if (inputData && inputData.score_json) {
        const sj = inputData.score_json;
        setScore(sj.score || 0);
        setQuarter(sj.quarter || 1);
        setQuarterScores(sj.quarterScores || [0, 0, 0, 0]);
        setTeamFouls(sj.teamFouls || [0, 0, 0, 0]);
        setPlayerStats(sj.playerStats || {});
        setEvents(sj.events || []);
      }

      // Fetch Roster
      const teamId = teamSide === 'home' ? matchData.home_team_id : matchData.away_team_id;
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId);
      
      if (playersData) {
        setRoster(playersData.map(p => ({ id: p.id, name: p.name, number: p.jersey_number, team_id: p.team_id })));
        
        // Initialize stats if empty
        if (!inputData) {
          const initStats: Record<string, PlayerStats> = {};
          playersData.forEach(p => {
            initStats[p.id] = { points: 0, fouls: 0, technicalFouls: 0, unsportsmanlikeFouls: 0, isEjected: false, isSuspended: false, suspendedAt: null };
          });
          setPlayerStats(initStats);
        }
      }

      setLoading(false);
    }
    init();
  }, [matchId, profile, teamSide, supabase]);

  // 2. Sync to Supabase
  const syncState = useCallback(async () => {
    if (!matchId || !profile) return;

    const score_json = {
      score,
      quarter,
      quarterScores,
      teamFouls,
      playerStats,
      events
    };

    await supabase.from('match_score_inputs').upsert({
      match_id: matchId as string,
      user_id: profile.id,
      team_side: teamSide,
      score_json,
      updated_at: new Date().toISOString()
    });
  }, [matchId, profile, score, quarter, quarterScores, teamFouls, playerStats, events, teamSide, supabase]);

  // Trigger sync on changes (debounced would be better, but simple for now)
  useEffect(() => {
    if (!loading) syncState();
  }, [score, quarter, quarterScores, teamFouls, playerStats, events, syncState, loading]);

  // --- Handlers ---
  const showNotification = (message: string, color = '#FF6B1A') => {
    setNotification({ message, color });
    setTimeout(() => setNotification(null), 3500);
  };

  const handlePlayerScore = (player: Player, points: number) => {
    setScore(s => s + points);
    setQuarterScores(prev => {
      const updated = [...prev];
      updated[quarter - 1] += points;
      return updated;
    });
    setPlayerStats(prev => ({
      ...prev,
      [player.id]: { ...prev[player.id], points: (prev[player.id]?.points || 0) + points }
    }));
    setEvents(prev => [{ id: Date.now(), type: 'score', playerName: player.name, playerNumber: player.number, points, quarter, time: `Q${quarter}` }, ...prev]);
    setSheet({ type: 'none' });
  };

  const handleFoul = (player: Player, foulType: FoulType) => {
    setPlayerStats(prev => {
      const s = { ...prev[player.id] };
      if (!s) return prev;

      if (foulType === 'regular') {
        s.fouls += 1;
        if (s.fouls >= 5) {
          s.isEjected = true;
          showNotification(`${player.name} FOULED OUT!`, '#EF4444');
        }
        setTeamFouls(prevT => {
          const updated = [...prevT];
          const qIdx = Math.min(quarter - 1, 3);
          updated[qIdx] += 1;
          if (updated[qIdx] >= 5) showNotification(`BONUS for Opponent!`, '#FF6B1A');
          return updated;
        });
      } else if (foulType === 'technical') {
        s.technicalFouls += 1;
        if (s.technicalFouls >= TECH_FOUL_EJECTION_LIMIT) {
          s.isEjected = true;
          showNotification(`${player.name} EJECTED (2 Techs)`, '#EF4444');
        }
      } else if (foulType === 'unsportsmanlike') {
        s.unsportsmanlikeFouls += 1;
        s.isSuspended = true;
        s.suspendedAt = Date.now();
        showNotification(`${player.name} sits for 2 mins`, '#F97316');
      }

      return { ...prev, [player.id]: s };
    });

    setEvents(prev => [{ id: Date.now(), type: foulType, playerName: player.name, playerNumber: player.number, points: 0, quarter, time: `Q${quarter}` }, ...prev]);
    setSheet({ type: 'none' });
  };

  if (loading || !match) return <div className="min-h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  const currentTeam = teamSide === 'home' ? match.home_team : match.away_team;

  // --- Logic Helpers ---
  const [finalData, setFinalData] = useState({ pogId: '', opponentScore: '' });
  const [photos, setPhotos] = useState<{ pog: File | null; team: File | null }>({ pog: null, team: null });
  const [finalizing, setFinalizing] = useState(false);

  // Calculate Top Performers for recommendation
  const topPerformers = useMemo(() => {
    return Object.entries(playerStats)
      .map(([id, stats]) => {
        const player = roster.find(r => r.id === id);
        // Requirement formula: (PTS * 1) + (REB * 1.2) + (AST * 1.5)
        const pogScore = stats.points * 1; 
        return { player, pogScore, stats };
      })
      .filter(p => p.player && p.pogScore > 0)
      .sort((a, b) => b.pogScore - a.pogScore)
      .slice(0, 3);
  }, [playerStats, roster]);

  const handlePhotoChange = (e: any, type: 'pog' | 'team') => {
    if (e.target.files?.[0]) setPhotos(p => ({ ...p, [type]: e.target.files[0] }));
  };

  const handleFinalSubmit = async () => {
    if (!finalData.pogId) return alert('Please select POG');
    if (finalData.opponentScore === '') return alert('Please report opponent score');
    
    setFinalizing(true);
    try {
      // 1. Upload Photos
      let pogUrl = '';
      let teamUrl = '';
      const { uploadFile } = await import('@/lib/storage');
      if (photos.pog) pogUrl = await uploadFile(photos.pog, 'match-media', `pog-${matchId}`);
      if (photos.team) teamUrl = await uploadFile(photos.team, 'match-media', `team-${matchId}`);

      // 2. Update Input
      const finalScoreJson = {
        score,
        reported_opponent_score: parseInt(finalData.opponentScore),
        quarter,
        quarterScores,
        teamFouls,
        playerStats,
        events,
        pog_id: finalData.pogId,
        pog_photo: pogUrl,
        team_photo: teamUrl
      };

      const { error: upsertError } = await supabase.from('match_score_inputs').upsert({
        match_id: matchId as string,
        user_id: profile!.id,
        team_side: teamSide,
        score_json: finalScoreJson,
        is_finalized: true,
        updated_at: new Date().toISOString()
      });

      if (upsertError) throw upsertError;

      // 3. Resolve Match
      const { resolveMatch } = await import('@/lib/matchResolution');
      try {
        const result = await resolveMatch(matchId as string);
        showNotification(`🏆 Match Finalized! ${result.finalHomeScore} - ${result.finalAwayScore}`, '#22c55e');
        setTimeout(() => router.push('/dashboard/committee'), 2000);
      } catch (err: any) {
        if (err.message.includes('Agreement required')) {
          showNotification('Saved! Waiting for other committee to finalize...', '#EAB308');
          setTimeout(() => router.push('/dashboard/committee'), 3000);
        } else {
          showNotification(err.message, '#ef4444');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Error finalizing: ' + err.message);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-24 space-y-4 animate-slide-up">
      {/* Notifications */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-[90] glass-strong rounded-2xl px-4 py-3 animate-slide-up" style={{ borderColor: `${notification.color}40`, borderWidth: 1 }}>
          <p className="text-sm font-bold text-center text-white">{notification.message}</p>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-white/30">Match #{match.match_order}</p>
          <h2 className="font-display text-2xl text-white">{currentTeam.name}</h2>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{teamSide} Side Committee</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-white/20 uppercase mb-1">Q{quarter}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(q => (
              <QuarterBadge key={q} quarter={q} isActive={quarter === q} onClick={() => setQuarter(q)} />
            ))}
          </div>
        </div>
      </header>

      {/* Main Stats Card */}
      <GlassCard className="!p-6 flex flex-col items-center gap-2">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30">Total Points</p>
        <span className="font-display text-8xl text-white leading-none">{score}</span>
        <div className="flex gap-4 mt-2">
          {quarterScores.map((qs, i) => (
             <div key={i} className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-white/20 uppercase">Q{i+1}</span>
                <span className="text-sm font-display text-white/60">{qs}</span>
             </div>
          ))}
        </div>
      </GlassCard>

      {/* Team Fouls & Bonus */}
      <div className="flex gap-3">
         <GlassCard className="flex-1 !p-4 flex items-center justify-between">
            <div>
               <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Team Fouls</p>
               <p className="font-display text-2xl text-white">{teamFouls[quarter-1] || 0}</p>
            </div>
            {teamFouls[quarter-1] >= 5 && <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse">BONUS</span>}
         </GlassCard>
         <GlassCard className="flex-1 !p-4 flex flex-col justify-center gap-1">
            <button 
              onClick={() => router.push('/dashboard/committee')}
              className="text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
            >
              Exit Interface
            </button>
         </GlassCard>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
         {/* ... score/foul controls ... */}
      </div>

      <div className="pt-2">
         <button 
           onClick={() => setSheet({ type: 'finalize' } as any)}
           className="press-scale w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-[11px] font-black text-green-400 uppercase tracking-[0.2em] shadow-lg shadow-green-500/5"
         >
           🏁 Finish & Finalize Game
         </button>
      </div>

      {/* Roster / Stats Quick Look */}
      {/* ... */}

      {/* Finalize Sheet */}
      {sheet.type === 'finalize' && (
        <div className="fixed inset-0 z-[100] animate-in fade-in slide-in-from-bottom-10">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSheet({ type: 'none' })} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-[40px] glass pb-safe p-8 space-y-6">
            <header className="text-center space-y-1">
              <h3 className="font-display text-3xl text-white">Finalize Match</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Post-Game Report</p>
            </header>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Your Score</label>
                  <div className="w-full glass bg-white/5 py-4 px-5 rounded-2xl text-center font-display text-2xl text-white outline-none border border-green-500/20">
                    {score}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Opponent Score</label>
                  <input 
                    type="number"
                    placeholder="??"
                    className="w-full glass bg-white/10 py-4 px-5 rounded-2xl text-center font-display text-2xl text-orange-500 outline-none border border-white/10 focus:border-orange-500/50 transition-all"
                    value={finalData.opponentScore}
                    onChange={(e) => setFinalData({...finalData, opponentScore: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Select Player of the Game</label>
                <select 
                  className="w-full glass bg-white/5 py-4 px-5 rounded-2xl border-white/10 text-sm font-bold text-white outline-none"
                  value={finalData.pogId}
                  onChange={(e) => setFinalData({...finalData, pogId: e.target.value})}
                >
                  <option value="">Select POG...</option>
                  {roster.map(p => <option key={p.id} value={p.id}>#{p.number} {p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 text-center block">POG Photo</label>
                  <label className="aspect-square glass rounded-2xl flex flex-col items-center justify-center gap-2 border-dashed border-white/20 hover:border-orange-500/40 transition-colors cursor-pointer relative overflow-hidden">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoChange(e, 'pog')} />
                    {photos.pog ? <img src={URL.createObjectURL(photos.pog)} className="absolute inset-0 w-full h-full object-cover" /> : <><span className="text-2xl">📸</span><span className="text-[8px] font-black text-white/20 uppercase">Take/Upload</span></>}
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 text-center block">Team Photo</label>
                  <label className="aspect-square glass rounded-2xl flex flex-col items-center justify-center gap-2 border-dashed border-white/20 hover:border-orange-500/40 transition-colors cursor-pointer relative overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'team')} />
                    {photos.team ? <img src={URL.createObjectURL(photos.team)} className="absolute inset-0 w-full h-full object-cover" /> : <><span className="text-2xl">🏆</span><span className="text-[8px] font-black text-white/20 uppercase">Take/Upload</span></>}
                  </label>
                </div>
              </div>

              <button 
                onClick={handleFinalSubmit}
                disabled={finalizing}
                className="press-scale w-full py-5 rounded-3xl brand-gradient text-[11px] font-black text-white uppercase tracking-[0.3em] shadow-xl shadow-orange-500/30 disabled:opacity-50"
              >
                {finalizing ? 'PROCESSSING...' : 'COMPLETE & POST REPORT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... previous sheets ... */}
    </div>
  );

}

