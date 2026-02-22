import React from 'react';
import { CellValue, Player, Phase, PhaseSubState } from '../types';
import { BOARD_SIZE } from '../constants';
import { Piece } from './Piece';
import { gameService } from './gameService';

interface BoardProps {
  board: CellValue[][];
  onCellClick: (x: number, y: number) => void;
  currentPlayer: Player;
  selectedPiece: { x: number; y: number } | null;
  phase: Phase;
  phaseSubState: PhaseSubState;
  waitingForCapture: boolean;
  invalidMoveCell?: { x: number; y: number } | null;
}

export const Board: React.FC<BoardProps> = ({ 
  board, 
  onCellClick, 
  currentPlayer, 
  selectedPiece, 
  phase,
  phaseSubState,
  waitingForCapture
  , invalidMoveCell
}) => {
  // Start a match when game begins (call this in your game start logic, not in Board)
  // gameService.startMatch('singleplayer', 'AI');

  // Register captures during gameplay
  const handleCapture = () => {
    gameService.registerCapture();
  };

  // End the match when game finishes (call this in your game end logic, not in Board)
  // gameService.endMatch('wins'); // or 'losses' or 'draws'

  return (
    <div className="board-wrapper animate-slide-up">
      {/* Container with a fixed background color for the grid lines to ensure visibility */}
      <div className="board-container bg-[#333] p-1.5 rounded-3xl shadow-2xl border-4 border-[#111] flex items-center justify-center relative overflow-hidden">
        {/* The internal grid is strictly rendered above all background elements */}
        <div className="grid grid-cols-6 grid-rows-6 gap-0 w-full h-full relative z-10 border border-[#222]">
          {board.map((row, x) => 
            row.map((cell, y) => {
              const isSelected = selectedPiece?.x === x && selectedPiece?.y === y;
              const canCapture = waitingForCapture && cell !== null && cell !== currentPlayer;
              
              return (
                <div 
                  key={`${x}-${y}`}
                  onClick={() => onCellClick(x, y)}
                  className={`
                    relative bg-white dark:bg-slate-800
                    border border-[#333] 
                    flex items-center justify-center cursor-pointer 
                    transition-all duration-300 aspect-square
                    ${isSelected ? 'bg-primary/25 z-20' : ''}
                    ${canCapture ? 'bg-rose-500/40 animate-pulse' : ''}
                    hover:bg-slate-50 dark:hover:bg-slate-700
                  `}
                >
                  {/* invalid move feedback */}
                  {invalidMoveCell && invalidMoveCell.x === x && invalidMoveCell.y === y && (
                    <div className="absolute inset-0 pointer-events-none border-4 border-rose-500 rounded-2xl animate-pulse" />
                  )}
                  {/* Pieces are rendered inside, but grid borders are handled by the cell container */}
                  {cell && <Piece player={cell} isSelected={isSelected} />}
                  
                  {phase === Phase.PLACEMENT && !cell && (
                      <div className="size-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};