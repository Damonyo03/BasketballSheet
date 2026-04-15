/**
 * Single Elimination Bracket Generation logic with BYEs
 */
export type Participant = {
  id: string;
  name: string;
  seed: number;
};

export type MatchNode = {
  round: number;
  matchOrder: number;
  homeTeam: Participant | null; // null means waiting for previous winner or BYE
  awayTeam: Participant | null;
  isBye: boolean;
};

export function generateSingleElimination(participants: Participant[]): MatchNode[] {
  const numTeams = participants.length;
  if (numTeams < 2) return [];

  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(numTeams)));
  const numByes = nextPow2 - numTeams;

  // Initial seeding (simplified): Highest seed vs lowest seed
  // For a truly professional bracket, we'd use a specific seeding pattern (1 vs 16, 8 vs 9, etc.)
  const sorted = [...participants].sort((a, b) => a.seed - b.seed);
  
  // Fill with dummy BYE participants
  const bracketSlots: (Participant | null)[] = [];
  for (let i = 0; i < nextPow2; i++) {
    if (i < numTeams) {
      bracketSlots.push(sorted[i]);
    } else {
      bracketSlots.push(null); // BYE
    }
  }

  // Generate First Round Matches
  const matches: MatchNode[] = [];
  const half = nextPow2 / 2;
  
  for (let i = 0; i < half; i++) {
    const home = bracketSlots[i];
    const away = bracketSlots[nextPow2 - 1 - i];
    
    matches.push({
      round: 1,
      matchOrder: i + 1,
      homeTeam: home,
      awayTeam: away,
      isBye: home === null || away === null
    });
  }

  // Note: Future rounds are generated as "Empty" slots waiting for winners
  let currentRoundSize = half / 2;
  let round = 2;
  while (currentRoundSize >= 1) {
    for (let i = 0; i < currentRoundSize; i++) {
      matches.push({
        round,
        matchOrder: i + 1,
        homeTeam: null,
        awayTeam: null,
        isBye: false
      });
    }
    currentRoundSize /= 2;
    round++;
  }

  return matches;
}

/**
 * Round Robin generation logic (Circle Method)
 */
export function generateRoundRobin(participants: Participant[]): MatchNode[] {
  const teams = [...participants];
  if (teams.length % 2 !== 0) {
    teams.push({ id: 'BYE', name: 'BYE', seed: 999 });
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const matches: MatchNode[] = [];

  for (let r = 0; r < numRounds; r++) {
    for (let m = 0; m < matchesPerRound; m++) {
      const home = teams[m];
      const away = teams[numTeams - 1 - m];

      if (home.id !== 'BYE' && away.id !== 'BYE') {
        matches.push({
          round: r + 1,
          matchOrder: m + 1,
          homeTeam: home,
          awayTeam: away,
          isBye: false
        });
      }
    }
    // Rotate teams except the first one
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }

  return matches;
}
