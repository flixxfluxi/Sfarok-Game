// ================================
// CORE ENUMS
// ================================

export enum Player {
  RED = "RED",
  BLUE = "BLUE"
}

export enum Phase {
  PLACEMENT = "PLACEMENT",
  MOVEMENT = "MOVEMENT",
  GAME_OVER = "GAME_OVER"
}

export enum PhaseSubState {
  NORMAL = "NORMAL",
  COMBO_MOVE = "COMBO_MOVE",
  REMOVE_PHASE = "REMOVE_PHASE"
}

export enum Screen {
  LOGIN = "LOGIN",
  MENU = "MENU",
  MODE_SELECT = "MODE_SELECT",
  DIFFICULTY_SELECT = "DIFFICULTY_SELECT",
  GAME = "GAME",
  SETTINGS = "SETTINGS",
  HOW_TO_PLAY = "HOW_TO_PLAY",
  ONLINE_WAITING = "ONLINE_WAITING"
}

export enum GameMode {
  OFFLINE_AI = "OFFLINE_AI",
  OFFLINE_LOCAL = "OFFLINE_LOCAL",
  ONLINE = "ONLINE"
}

export enum AILevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

// ================================
// BASIC TYPES
// ================================

export type CellValue = Player | null;

export type Position = {
  x: number;
  y: number;
};

// ================================
// ENGINE TYPES
// ================================

export type Move = {
  from: Position;
  to: Position;
  captured?: Position;
};

export type Piece = {
  id: string; // format "x,y"
  player: Player;
  position: Position;
};

export type GameResult = "win" | "loss" | "draw";

// ================================
// GAME STATE
// ================================

export interface GameState {
  board: CellValue[][];
  currentPlayer: Player;
  phase: Phase;
  phaseSubState: PhaseSubState;

  captured: Record<Player, number>;
  piecesToPlace: Record<Player, number>;
  placedCount: Record<Player, number>;

  winner: Player | null;
  movesCount: number;

  waitingForCapture: boolean;
  pendingCaptures: number;

  selectedPiece: Position | null;

  mode: GameMode;
  aiLevel?: AILevel;
  playerColor?: Player;
  roomCode?: string;

  formedLines?: string[];
  comboUsedPieceIds?: string[];
}

// ================================
// USER / PROFILE
// ================================

export interface Profile {
  uid?: string;
  email: string;
  nickname: string;
  isGuest: boolean;
  photoURL?: string;
}

// ================================
// SETTINGS
// ================================

export interface Settings {
  darkMode: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  nickname: string;
  language: "en" | "ar";
}

// ================================
// TRANSLATION
// ================================

export type TranslationKey = string;