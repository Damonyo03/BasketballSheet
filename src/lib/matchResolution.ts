import { createClient } from '@/lib/supabase/client';

/**
 * Handles the finalization of a match, including:
 * 1. Updating team W/L records
 * 2. Advancing the winner in the bracket
 * 3. Marking match as finished
 */
export async function resolveMatch(matchId: string) {
  const supabase = createClient();

  // 1. Fetch match and its inputs
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*, league:leagues(format)')
    .eq('id', matchId)
    .single();

  if (matchError || !match) throw new Error('Match not found');

  const { data: inputs } = await supabase
    .from('match_score_inputs')
    .select('*')
    .eq('match_id', matchId)
    .eq('is_finalized', true);

  if (!inputs || inputs.length < 2) {
    throw new Error('Agreement required: Both committees must finalize their reports.');
  }

  const homeInput = inputs.find(i => i.team_side === 'home')?.score_json;
  const awayInput = inputs.find(i => i.team_side === 'away')?.score_json;

  if (!homeInput || !awayInput) throw new Error('Incomplete finalized data');

  // Verify Agreement
  const hRepHome = homeInput.score;
  const hRepAway = homeInput.reported_opponent_score;
  const aRepHome = awayInput.reported_opponent_score;
  const aRepAway = awayInput.score;

  if (hRepHome !== aRepHome || hRepAway !== aRepAway) {
    throw new Error('Score Mismatch: The scores reported by Home and Away committees do not match. Please review and re-finalize.');
  }

  // 2. Final scores from each committee
  // We prioritize the side's reporting of their OWN score for the official record, 
  // but they must match the other side's observation.
  const finalHomeScore = homeInput.score;
  const finalAwayScore = awayInput.score;

  const winnerId = finalHomeScore > finalAwayScore ? match.home_team_id : match.away_team_id;
  const loserId = finalHomeScore > finalAwayScore ? match.away_team_id : match.home_team_id;

  // 3. Update Teams W/L/Pts
  await supabase.rpc('update_team_stats', {
    winner_id: winnerId,
    loser_id: loserId,
    w_pts: finalHomeScore > finalAwayScore ? finalHomeScore : finalAwayScore,
    l_pts: finalHomeScore > finalAwayScore ? finalAwayScore : finalHomeScore
  });

  // 4. Marking Match Finished
  await supabase
    .from('matches')
    .update({
      home_score: finalHomeScore,
      away_score: finalAwayScore,
      status: 'finished',
      winner_team_id: winnerId
    })
    .eq('id', matchId);

  // 5. Bracket Advancement (If Single Elimination)
  if (match.parent_match_id) {
    // Winner of Match M in Round R moves to Round R+1
    // Logic: If MatchOrder is Odd, they are Home. If Even, they are Away in the parent match.
    const isHomeSlot = match.match_order % 2 !== 0;
    
    const updatePayload: any = {};
    if (isHomeSlot) updatePayload.home_team_id = winnerId;
    else updatePayload.away_team_id = winnerId;

    await supabase
      .from('matches')
      .update(updatePayload)
      .eq('id', match.parent_match_id);
  }

  return { winnerId, finalHomeScore, finalAwayScore };
}
