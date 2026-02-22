
import React from 'react';
import { AILevel } from '../types';

interface DifficultySelectionProps {
  onBack: () => void;
  onSelect: (level: AILevel) => void;
  t: (key: any) => string;
}

export const DifficultySelection: React.FC<DifficultySelectionProps> = ({ onBack, onSelect, t }) => (
  <div className="flex-1 flex flex-col p-6 max-sm mx-auto w-full">
    <header className="flex items-center justify-between mb-12">
      <button onClick={onBack} className="p-2 -ml-2 text-primary">
        <span className="material-symbols-outlined text-[32px]">chevron_left</span>
      </button>
      <h1 className="text-2xl font-bold tracking-tight">{t('diff_title')}</h1>
      <div className="w-10"></div>
    </header>

    <div className="flex-1 flex flex-col gap-4 justify-center">
      <button 
        onClick={() => onSelect(AILevel.EASY)}
        className="h-20 bg-green-500/10 border-2 border-green-500/20 rounded-3xl flex items-center justify-between px-8 hover:bg-green-500/20 transition-all"
      >
        <div className="text-left">
          <h3 className="font-black text-green-600 dark:text-green-400 text-xl italic uppercase">{t('diff_easy')}</h3>
          <p className="text-xs font-bold opacity-60">{t('diff_easy_sub')}</p>
        </div>
        <span className="material-symbols-outlined text-green-500">child_care</span>
      </button>

      <button 
        onClick={() => onSelect(AILevel.MEDIUM)}
        className="h-20 bg-orange-500/10 border-2 border-orange-500/20 rounded-3xl flex items-center justify-between px-8 hover:bg-orange-500/20 transition-all"
      >
        <div className="text-left">
          <h3 className="font-black text-orange-600 dark:text-orange-400 text-xl italic uppercase">{t('diff_medium')}</h3>
          <p className="text-xs font-bold opacity-60">{t('diff_medium_sub')}</p>
        </div>
        <span className="material-symbols-outlined text-orange-500">fitness_center</span>
      </button>

      <button 
        onClick={() => onSelect(AILevel.HARD)}
        className="h-20 bg-red-500/10 border-2 border-red-500/20 rounded-3xl flex items-center justify-between px-8 hover:bg-red-500/20 transition-all"
      >
        <div className="text-left">
          <h3 className="font-black text-red-600 dark:text-red-400 text-xl italic uppercase">{t('diff_hard')}</h3>
          <p className="text-xs font-bold opacity-60">{t('diff_hard_sub')}</p>
        </div>
        <span className="material-symbols-outlined text-red-500">psychology</span>
      </button>
    </div>
  </div>
);
