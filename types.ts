export enum Player {
  RED = 'RED',
  BLUE = 'BLUE'
}

export enum Phase {
  PLACEMENT = 'PLACEMENT',
  MOVEMENT = 'MOVEMENT',
  GAME_OVER = 'GAME_OVER'
}

export enum PhaseSubState {
  NORMAL = 'NORMAL',
  COMBO_MOVE = 'COMBO_MOVE',
  REMOVE_PHASE = 'REMOVE_PHASE'
}

export enum Screen {
  LOGIN = 'LOGIN',
  MENU = 'MENU',
  MODE_SELECT = 'MODE_SELECT',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  GAME = 'GAME',
  SETTINGS = 'SETTINGS',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  ONLINE_WAITING = 'ONLINE_WAITING'
}

export enum GameMode {
  OFFLINE_AI = 'OFFLINE_AI',
  OFFLINE_LOCAL = 'OFFLINE_LOCAL',
  ONLINE = 'ONLINE'
}

export enum AILevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export type CellValue = Player | null;

export interface Profile {
  uid?: string;
  email: string;
  nickname: string;
  isGuest: boolean;
  photoURL?: string;
}

export interface GameState {
  board: CellValue[][];
  currentPlayer: Player;
  phase: Phase;
  phaseSubState: PhaseSubState;
  captured: { RED: number; BLUE: number };
  piecesToPlace: { RED: number; BLUE: number };
  placedCount: { RED: number; BLUE: number };
  winner: Player | null;
  movesCount: number;
  waitingForCapture: boolean;
  pendingCaptures: number;
  selectedPiece: { x: number; y: number } | null;
  mode: GameMode;
  aiLevel?: AILevel;
  playerColor?: Player; 
  roomCode?: string;
  formedLines?: string[];
  comboUsedPieceIds?: string[]; // IDs are strings "x,y" representing the position of the piece AFTER it moved in the chain
}

export interface Settings {
  darkMode: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  nickname: string;
  language: 'en' | 'ar';
}

export interface Piece {
  x: number;
  y: number;
  player: Player;
}

export interface Move {
  from: { x: number; y: number };
  to: { x: number; y: number };
  capture?: boolean;
  newLines?: string[];
}