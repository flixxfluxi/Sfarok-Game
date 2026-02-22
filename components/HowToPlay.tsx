import React from 'react';

export const HowToPlay: React.FC<{ onBack: () => void, t: (key: any) => string }> = ({ onBack, t }) => (
  <div className="flex-1 flex flex-col p-8 max-w-md mx-auto w-full animate-fade-in">
    <header className="flex items-center justify-between mb-10">
      <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 text-primary active:scale-90 transition-all">
        <span className="material-symbols-outlined text-[28px]">chevron_left</span>
      </button>
      <h1 className="text-2xl font-black tracking-tight italic uppercase">{t('how_title')}</h1>
      <div className="w-10"></div>
    </header>

    <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar pb-6">
      <Section title={t('how_objective')} content={t('how_objective_sub')} icon="target" />
      <Section title={t('how_placement')} content={t('how_placement_sub')} icon="grid_view" />
      <Section title={t('how_movement')} content={t('how_movement_sub')} icon="move_item" />
      <Section title={t('how_combos')} content={t('how_combos_sub')} icon="auto_mode" />
      <Section title={t('how_winning')} content={t('how_winning_sub')} icon="emoji_events" />
    </div>

    <button 
      onClick={onBack}
      className="mt-6 h-16 w-full bg-primary text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
    >
      {t('how_ready')}
    </button>
  </div>
);

const Section: React.FC<{ title: string, content: string, icon: string }> = ({ title, content, icon }) => (
  <div className="bg-white dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
    <div className="flex items-center gap-3 mb-3">
        <div className="size-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <h3 className="text-primary font-black uppercase tracking-wider text-[11px]">{title}</h3>
    </div>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
      {content}
    </p>
  </div>
);