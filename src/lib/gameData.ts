// ============================================
// POST PROPER NORTHSIDE BASKETBALL
// Game Types & Mock Roster Data
// ============================================

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  team: 'home' | 'away';
}

export interface PlayerGameState {
  points: number;
  fouls: number;
  technicalFouls: number;
  unsportsmanlikeFouls: number;
  isEjected: boolean;
  isSuspended: boolean;
  suspendedAt: number | null; // timestamp
  ejectedGamesRemaining: number;
}

export interface GameEvent {
  id: number;
  time: string;
  playerName: string;
  playerNumber: string;
  action: string;
  points: number;
  team: 'home' | 'away';
  quarter: number;
  type: 'score' | 'foul' | 'technical' | 'unsportsmanlike';
}

export type FoulType = 'regular' | 'technical' | 'unsportsmanlike';

export interface TeamInfo {
  name: string;
  shortName: string;
  color: string;
}

// ---- Teams ----
export const homeTeam: TeamInfo = { name: 'Northside Ballers', shortName: 'NSB', color: '#FF6B1A' };
export const awayTeam: TeamInfo = { name: 'Eastside Raiders', shortName: 'ESR', color: '#4A90D9' };

// ---- Rosters ----
export const homePlayers: Player[] = [
  { id: 'h1', name: 'Jay Santos', number: '7', position: 'SG', team: 'home' },
  { id: 'h2', name: 'Carlo Dela Cruz', number: '3', position: 'PG', team: 'home' },
  { id: 'h3', name: 'Mike Tan', number: '11', position: 'SF', team: 'home' },
  { id: 'h4', name: 'Jed Aquino', number: '22', position: 'PF', team: 'home' },
  { id: 'h5', name: 'Leo Bautista', number: '5', position: 'C', team: 'home' },
  { id: 'h6', name: 'Dan Villanueva', number: '9', position: 'SG', team: 'home' },
  { id: 'h7', name: 'Nico Ramos', number: '14', position: 'PF', team: 'home' },
  { id: 'h8', name: 'Kobe Lim', number: '24', position: 'SF', team: 'home' },
];

export const awayPlayers: Player[] = [
  { id: 'a1', name: 'Marco Reyes', number: '12', position: 'PF', team: 'away' },
  { id: 'a2', name: 'Enzo Garcia', number: '8', position: 'PG', team: 'away' },
  { id: 'a3', name: 'Ryan Cruz', number: '15', position: 'C', team: 'away' },
  { id: 'a4', name: 'Noel Pascual', number: '21', position: 'SG', team: 'away' },
  { id: 'a5', name: 'Gab Mendoza', number: '4', position: 'SF', team: 'away' },
  { id: 'a6', name: 'Jao Trinidad', number: '10', position: 'PG', team: 'away' },
  { id: 'a7', name: 'Paolo Sy', number: '33', position: 'C', team: 'away' },
  { id: 'a8', name: 'Ian Morales', number: '6', position: 'SG', team: 'away' },
];

// ---- Helper: create initial player states ----
export function createInitialPlayerStates(players: Player[]): Record<string, PlayerGameState> {
  const states: Record<string, PlayerGameState> = {};
  players.forEach(p => {
    states[p.id] = {
      points: 0,
      fouls: 0,
      technicalFouls: 0,
      unsportsmanlikeFouls: 0,
      isEjected: false,
      isSuspended: false,
      suspendedAt: null,
      ejectedGamesRemaining: 0,
    };
  });
  return states;
}

// ---- Constants ----
export const SUSPENSION_DURATION_MS = 2 * 60 * 1000; // 2 minutes
export const TECH_FOUL_EJECTION_LIMIT = 2;
export const EJECTION_GAME_BAN = 2;
