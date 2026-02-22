import React from 'react';
import { Player } from '../types';
import { COLORS } from '../constants';

interface PieceProps {
  player: Player;
  isSelected?: boolean;
}

export const Piece: React.FC<PieceProps> = ({ player, isSelected }) => {
  return (
    <div 
      className={`
        size-[85%] rounded-full border-b-[3px] bg-gradient-to-br shadow-lg 
        transform transition-all duration-300 piece-transition relative
        ${COLORS[player]}
        ${isSelected ? 'scale-110 -translate-y-1.5' : ''}
      `}
    >
        {/* Inner Highlight Refraction */}
        <div className="absolute top-1 left-2 w-1/2 h-1/2 bg-white/20 rounded-full blur-[2px]" />
    </div>
  );
};