export interface Settings {
  language: string;
  theme: 'light' | 'dark';
  sound: boolean;
  notifications: boolean;
  moveAnimations: boolean;
}

export interface Stats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  captures: number;
  timePlayed: number;
}

export interface MatchHistoryEntry {
  id: number;
  date: string;
  result: 'win' | 'loss' | 'draw';
  mode: string;
  duration: number;
  opponent: string;
  captures: number;
}

export class StorageService {
  private storage = window.localStorage;
  private defaults = {
    settings: {
      language: 'en',
      theme: 'light',
      sound: true,
      notifications: true,
      moveAnimations: true
    },
    stats: {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      captures: 0,
      timePlayed: 0
    },
    matchHistory: [] as MatchHistoryEntry[]
  };

  // Settings
  getSettings(): Settings {
    return JSON.parse(this.storage.getItem('game_settings') || JSON.stringify(this.defaults.settings));
  }

  saveSettings(settings: Settings): void {
    this.storage.setItem('game_settings', JSON.stringify(settings));
  }

  updateSetting(key: keyof Settings, value: any): void {
    const settings = this.getSettings();
    (settings as any)[key] = value;
    this.saveSettings(settings);
  }

  // Stats
  getStats(): Stats {
    return JSON.parse(this.storage.getItem('game_stats') || JSON.stringify(this.defaults.stats));
  }

  updateStats(delta: Partial<Stats>): void {
    const stats = this.getStats();
    Object.keys(delta).forEach((key) => {
      const k = key as keyof Stats;
      stats[k] = (stats[k] || 0) + (delta[k] || 0);
    });
    this.storage.setItem('game_stats', JSON.stringify(stats));
  }

  // Match History
  getMatchHistory(): MatchHistoryEntry[] {
    return JSON.parse(this.storage.getItem('match_history') || JSON.stringify(this.defaults.matchHistory));
  }

  addMatchToHistory(matchData: Omit<MatchHistoryEntry, 'id' | 'date'>): void {
    const history = this.getMatchHistory();
    const newEntry: MatchHistoryEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...matchData
    };
    history.unshift(newEntry);
    if (history.length > 50) history.pop(); // Keep last 50 matches
    this.storage.setItem('match_history', JSON.stringify(history));
  }

  clearMatchHistory(): void {
    this.storage.setItem('match_history', JSON.stringify([]));
  }

  // Utility
  clearAll(): void {
    this.storage.removeItem('game_settings');
    this.storage.removeItem('game_stats');
    this.storage.removeItem('match_history');
  }

  exportData() {
    return {
      settings: this.getSettings(),
      stats: this.getStats(),
      matchHistory: this.getMatchHistory()
    };
  }

  importData(data: { settings: Settings; stats: Stats; matchHistory: MatchHistoryEntry[] }): void {
    this.saveSettings(data.settings);
    this.storage.setItem('game_stats', JSON.stringify(data.stats));
    this.storage.setItem('match_history', JSON.stringify(data.matchHistory));
  }
}

export const storageService = new StorageService();