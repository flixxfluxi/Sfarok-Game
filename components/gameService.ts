import { storageService, Stats, GameResult } from './storageService';

export type GameMode = 'singleplayer' | 'multiplayer' | 'online';

export interface Match {
  mode: GameMode;
  opponent: string;
  captures: number;
  startTime: number;
}

export class GameService {
  private currentMatch: Match | null = null;
  private matchStartTime: number | null = null;
  public playerColor: number = 0; // Standard Player.RED

  startMatch(mode: GameMode, opponent: string): void {
    this.currentMatch = {
      mode,
      opponent,
      captures: 0,
      startTime: Date.now()
    };
    this.matchStartTime = Date.now();
  }

  endMatch(result: GameResult): void {
    if (!this.matchStartTime) return;

    const duration = Math.floor((Date.now() - this.matchStartTime) / 1000);

    const statsDelta: Partial<Stats> = {
      totalMatches: 1,
      wins: result === 'win' ? 1 : 0,
      losses: result === 'loss' ? 1 : 0,
      draws: result === 'draw' ? 1 : 0,
      captures: this.currentMatch?.captures || 0,
      timePlayed: duration
    };
    storageService.updateStats(statsDelta);

    if (this.currentMatch) {
      storageService.addMatchToHistory({
        result,
        mode: this.currentMatch.mode,
        duration,
        opponent: this.currentMatch.opponent,
        captures: this.currentMatch.captures
      });
    }

    this.currentMatch = null;
    this.matchStartTime = null;
  }

  registerCapture(): void {
    if (this.currentMatch) {
      this.currentMatch.captures++;
    }
  }

  getCurrentMatch(): Match | null {
    return this.currentMatch;
  }

  getMatchStartTime(): number | null {
    return this.matchStartTime;
  }
}

export const gameService = new GameService();