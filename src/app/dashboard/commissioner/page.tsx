  const [matches, setMatches] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);

  const fetchMatches = useCallback(async (leagueId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(name, short_name),
        away_team:teams!away_team_id(name, short_name)
      `)
      .eq('league_id', leagueId)
      .order('round_number', { ascending: true })
      .order('match_order', { ascending: true });
    if (!error && data) setMatches(data);
  }, [supabase]);

  const fetchCommittees = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'committee');
    if (!error && data) setCommittees(data);
  }, [supabase]);

  useEffect(() => {
    fetchLeagues().then(() => {
      setLoading(false);
      fetchCommittees();
    });
  }, [fetchLeagues, fetchCommittees]);

  useEffect(() => {
    if (selectedLeague) {
      fetchTeams(selectedLeague.id);
      fetchMatches(selectedLeague.id);
      setPreviewMatches([]);
    }
  }, [selectedLeague, fetchTeams, fetchMatches]);

  // ... (previous creation functions) ...

  const handleUpdateAssignment = async (matchId: string, side: 'home' | 'away', committeeId: string) => {
    const updates: any = {};
    if (side === 'home') updates.home_committee_id = committeeId;
    else updates.away_committee_id = committeeId;

    const { error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId);

    if (!error) {
      fetchMatches(selectedLeague!.id);
    }
  };

  return (
    <div className="px-4 pt-6 pb-24 space-y-8 animate-slide-up">
      {/* ... header and league creation ... */}

      {/* --- League Nav --- */}
      {/* ... leagues tabs ... */}

      {selectedLeague && (
        <>
          {/* --- Teams Section --- */}
          {/* ... teams setup ... */}

          {/* --- Bracket Section --- */}
          {/* ... bracket generation ... */}

          {/* --- Match Scheduling & Assignment --- */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between ml-1">
              <h2 className="text-sm font-bold tracking-widest uppercase text-white/60">
                Match Assignments
              </h2>
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                {matches.length} Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {matches.map(match => (
                <GlassCard key={match.id} className="!p-5 space-y-4">
                   <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded leading-none">R{match.round_number}</span>
                         <span className="text-xs font-bold text-white/60">Match #{match.match_order}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{match.status}</span>
                   </div>

                   <div className="flex items-center justify-between text-sm py-1">
                      <div className="text-center flex-1">
                         <p className="font-display text-lg text-white">{match.home_team?.short_name || 'TBD'}</p>
                         <select 
                            className="mt-2 w-full glass bg-white/5 text-[9px] font-bold uppercase tracking-wider rounded-lg p-1.5 outline-none border-none"
                            value={match.home_committee_id || ''}
                            onChange={(e) => handleUpdateAssignment(match.id, 'home', e.target.value)}
                         >
                            <option value="">Assign Home Comm.</option>
                            {committees.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                         </select>
                      </div>
                      <div className="px-6 text-white/20 font-display text-xl">VS</div>
                      <div className="text-center flex-1">
                         <p className="font-display text-lg text-white">{match.away_team?.short_name || 'TBD'}</p>
                         <select 
                            className="mt-2 w-full glass bg-white/5 text-[9px] font-bold uppercase tracking-wider rounded-lg p-1.5 outline-none border-none"
                            value={match.away_committee_id || ''}
                            onChange={(e) => handleUpdateAssignment(match.id, 'away', e.target.value)}
                         >
                            <option value="">Assign Away Comm.</option>
                            {committees.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                         </select>
                      </div>
                   </div>
                </GlassCard>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
