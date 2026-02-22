import React from 'react';
import { Profile } from '../types';
import { storageService } from './storageService';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  darkMode: boolean;
  profile: Profile | null;
  t: (key: any) => string;
  isRTL: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onSettings, onHowToPlay, darkMode, profile, t, isRTL }) => {
  // Get stats for display
  const stats = storageService.getStats();
  const winRate = stats.totalMatches > 0 ? ((stats.wins / stats.totalMatches) * 100).toFixed(0) : '0';

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-14 animate-fade-in">
      {/* Header Profile Icon */}
      <div className={`fixed top-8 ${isRTL ? 'left-8' : 'right-8'} flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 pr-4 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-soft`}>
         <div className="size-9 bg-primary rounded-full flex items-center justify-center text-white font-extrabold text-sm uppercase">
           {profile?.nickname.charAt(0) || 'P'}
         </div>
         <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-slate-200">{profile?.nickname || 'Profile'}</span>
      </div>

      <div className="text-center">
        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/30 mx-auto transform hover:rotate-6 transition-transform">
          <span className="material-symbols-outlined text-white text-5xl">grid_view</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter uppercase italic leading-none">
          SFAROK <span className="text-primary">/</span> DALA
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium uppercase tracking-widest opacity-80">Ancient Game • Modern Soul</p>
      </div>

      <div className="w-full max-w-[280px] flex flex-col gap-5">
        <button 
          onClick={onPlay}
          className="h-16 w-full bg-primary text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-3"
        >
          {t('menu_play')}
          <span className={`material-symbols-outlined text-2xl ${isRTL ? 'order-first' : ''}`}>swords</span>
        </button>
        
        <button 
          onClick={onHowToPlay}
          className="h-14 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-soft hover:shadow-md transition-all flex items-center justify-center gap-3"
        >
          {t('menu_tutorial')}
          <span className={`material-symbols-outlined text-xl ${isRTL ? 'order-first' : ''}`}>menu_book</span>
        </button>

        <button 
          onClick={onSettings}
          className="h-14 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-soft hover:shadow-md transition-all flex items-center justify-center gap-3"
        >
          {t('menu_settings')}
          <span className={`material-symbols-outlined text-xl ${isRTL ? 'order-first' : ''}`}>settings</span>
        </button>
      </div>

      {/* Stats section */}
      <div className="w-full max-w-[280px] bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-soft">
        <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Your Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Matches Played</span>
            <span className="font-bold text-lg">{stats.totalMatches}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Wins</span>
            <span className="font-bold text-lg">{stats.wins}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Win Rate</span>
            <span className="font-bold text-lg">{winRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Total Captures</span>
            <span className="font-bold text-lg">{stats.captures}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Time Played</span>
            <span className="font-bold text-lg">{formatTime(stats.timePlayed)}</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-black tracking-widest uppercase">
          {darkMode ? 'Dark Arena Active' : 'Light Arena Active'}
        </div>
      </div>
    </div>
  );
};