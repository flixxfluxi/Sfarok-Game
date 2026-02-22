import React, { useState } from 'react';
import { GameState, Player, Phase, Settings, GameMode, PhaseSubState } from '../types';
import { Board } from './Board';
import { gameService } from './gameService';

interface GameScreenProps {
  gameState: GameState;
  invalidMoveCell?: { x: number; y: number } | null;
  onCellClick: (x: number, y: number) => void;
  onRestart: () => void;
  onBack: () => void;
  onSurrender: () => void;
  onPerformAction: (action: any) => void;
  settings: Settings;
  t: (key: any) => string;
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  gameState, 
  invalidMoveCell,
  onCellClick, 
  onRestart, 
  onBack, 
  onSurrender,
  onPerformAction,
  settings,
  t
}) => {
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);

  const modeLabel = gameState.mode === GameMode.OFFLINE_AI 
    ? `${t('game_offline_ai')} (${gameState.aiLevel})`
    : gameState.mode === GameMode.ONLINE
      ? `${t('game_online_room')}: ${gameState.roomCode}`
      : t('game_local');

  const isMyTurn = gameState.mode === GameMode.ONLINE 
    ? gameState.currentPlayer === gameState.playerColor 
    : true;

  const isRTL = settings.language === 'ar';

  return (
    <div className="flex-1 flex flex-col items-center p-6 pt-12 max-w-md mx-auto w-full space-y-8 animate-fade-in">
      <header className="w-full flex items-center justify-between">
        <button onClick={onBack} className={`p-2 bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-primary transition-all active:scale-90 ${isRTL ? 'rotate-180' : 'rotate-0'}`}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center">
            <h2 className="text-xl font-extrabold tracking-tighter uppercase italic leading-none">SFAROK <span className="text-primary">/</span> DALA</h2>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{modeLabel}</span>
        </div>
        <div className="w-10"></div>
      </header>

      <div className={`w-full p-5 rounded-3xl border shadow-soft transition-all duration-500 relative overflow-hidden ${
        gameState.currentPlayer === Player.RED 
          ? 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400 ring-4 ring-rose-500/10' 
          : 'bg-sky-500/5 border-sky-500/20 text-sky-700 dark:text-sky-400 ring-4 ring-sky-500/10'
      }`}>
        {!isMyTurn && (
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-30 animate-fade-in">
              <span className="text-[11px] font-black bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 uppercase tracking-widest">{t('game_waiting_opponent')}</span>
           </div>
        )}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className={`size-4 rounded-full shadow-lg ${
                gameState.currentPlayer === Player.RED ? 'bg-gradient-to-br from-rose-400 to-rose-600 animate-pulse' : 'bg-gradient-to-br from-sky-400 to-sky-600 animate-pulse'
              }`} />
              <span className="text-2xl font-black italic tracking-tight">{t('game_player')} {gameState.currentPlayer}</span>
            </div>
            <p className="text-xs font-bold opacity-70 tracking-wide uppercase">
              {gameState.phaseSubState === PhaseSubState.REMOVE_PHASE 
                ? `${t('game_select_capture')} (${gameState.pendingCaptures})`
                : gameState.phaseSubState === PhaseSubState.COMBO_MOVE
                  ? `${t('game_combo_active')} (${gameState.pendingCaptures})`
                  : gameState.phase === Phase.PLACEMENT 
                    ? `${t('game_placement')} • ${gameState.piecesToPlace[gameState.currentPlayer]} ${t('game_left')}`
                    : t('game_movement')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">{t('game_captured')}</span>
            <div className="flex items-center justify-end gap-1.5">
               <span className="font-bold text-lg text-rose-500">{gameState.captured.RED}</span>
               <span className="opacity-20 font-black">|</span>
               <span className="font-bold text-lg text-sky-500">{gameState.captured.BLUE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Continue Combo button: shown when there are extra scoring moves available
          after a scoring move (player can choose to continue the combo). */}
      {/* Combo decisions are optional; engine exposes both capture MOVEs and REMOVEs when pendingCaptures>0. UI does not force a choice. */}

      <div className={`relative ${!isMyTurn ? 'pointer-events-none' : ''}`}>
        <Board 
          board={gameState.board} 
          onCellClick={onCellClick} 
          currentPlayer={gameState.currentPlayer} 
          selectedPiece={gameState.selectedPiece}
          phase={gameState.phase}
          phaseSubState={gameState.phaseSubState}
          waitingForCapture={gameState.waitingForCapture}
          invalidMoveCell={invalidMoveCell}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button 
          onClick={onRestart}
          className="h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">restart_alt</span>
          {t('game_restart')}
        </button>
        <button 
          onClick={() => setShowSurrenderConfirm(true)}
          className="h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">flag</span>
          {t('game_surrender')}
        </button>
      </div>

      <div className="text-center pt-2">
         <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">{t('game_moves')}: {gameState.movesCount} • {t('game_win_cond_label')}: {t('game_win_cond_val')}</p>
      </div>

      {showSurrenderConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-4xl p-8 shadow-2xl border border-white/20 dark:border-slate-800 text-center animate-pop">
            <h3 className="text-2xl font-black italic mb-3 uppercase tracking-tighter">{t('game_surrender_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">{t('game_surrender_sub')}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onSurrender}
                className="h-14 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
              >
                {t('game_btn_yes')}
              </button>
              <button 
                onClick={() => setShowSurrenderConfirm(false)}
                className="h-14 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl active:scale-95 transition-all"
              >
                {t('game_btn_no')}
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState.winner && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-4xl p-10 shadow-2xl border border-white/10 dark:border-slate-800 text-center animate-pop">
            <div className={`w-28 h-28 rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 ${
              gameState.winner === Player.RED ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/40' : 'bg-gradient-to-br from-sky-400 to-sky-600 shadow-sky-500/40'
            }`}>
              <span className="material-symbols-outlined text-white text-7xl">emoji_events</span>
            </div>
            <h2 className="text-5xl font-black italic mb-2 uppercase tracking-tighter leading-none">{t('game_winner_title')}</h2>
            <p className="text-xl font-bold mb-10 text-slate-500 dark:text-slate-400">{t('game_player')} {gameState.winner} {t('game_win_sub')}</p>
            <div className="flex flex-col gap-4">
                <button 
                onClick={onRestart}
                className="h-16 w-full bg-primary text-white text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                {t('game_btn_play_again')}
                </button>
                <button 
                onClick={onBack}
                className="text-slate-400 font-black hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-[0.2em] text-[10px]"
                >
                {t('game_back_menu')}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};