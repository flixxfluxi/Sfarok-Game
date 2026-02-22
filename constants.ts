
import { Player } from './types';

export const BOARD_SIZE = 6;
export const PIECES_PER_PLAYER = 12;

// The "X" shape starting pattern in center 4x4
// For a 6x6, the 4x4 area is indices [1-4]
export const INITIAL_BOARD = [
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, Player.RED, Player.BLUE, null, null],
  [null, null, Player.BLUE, Player.RED, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
];

export const COLORS = {
  RED: 'from-rose-400 to-rose-600 border-rose-700 shadow-rose-500/30',
  BLUE: 'from-sky-400 to-sky-600 border-sky-700 shadow-sky-500/30',
};
