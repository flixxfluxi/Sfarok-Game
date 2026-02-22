import React from 'react';
import { Settings } from '../types';
import { storageService } from './storageService';

interface SettingsScreenProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
  onLogout: () => void;
  t: (key: any) => string;
  isRTL: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onUpdate, onBack, onLogout, t, isRTL }) => {
  const toggleDark = () => onUpdate({ ...settings, darkMode: !settings.darkMode });
  const toggleSound = () => onUpdate({ ...settings, soundEnabled: !settings.soundEnabled });
  const toggleHaptics = () => onUpdate({ ...settings, hapticsEnabled: !settings.hapticsEnabled });
  const updateNickname = (val: string) => onUpdate({ ...settings, nickname: val });
  const setLanguage = (lang: 'en' | 'ar') => onUpdate({ ...settings, language: lang });

  const reset = () => onUpdate({ 
    darkMode: true, 
    soundEnabled: true, 
    hapticsEnabled: true,
    nickname: settings.nickname,
    language: 'en'
  });

  // Get stats for display
  const stats = storageService.getStats();
  const winRate = stats.totalMatches > 0 ? ((stats.wins / stats.totalMatches) * 100).toFixed(0) : '0';

  return (
    <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className={`p-2 -ml-2 text-primary ${isRTL ? 'rotate-180' : 'rotate-0'}`}>
          <span className="material-symbols-outlined text-[32px]">chevron_left</span>
        </button>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings_title')}</h1>
        <div className="w-10"></div>
      </header>

      <div className="space-y-6 overflow-y-auto pr-1">
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">{t('settings_profile')}</h3>
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
             <input 
              type="text" 
              value={settings.nickname}
              onChange={(e) => updateNickname(e.target.value)}
              placeholder={t('settings_nickname')}
              className="w-full bg-transparent border-none outline-none font-bold text-lg"
             />
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t('settings_display_name')}</p>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">{t('settings_prefs')}</h3>
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">dark_mode</span>
                <span className="font-bold">{t('settings_dark_mode')}</span>
              </div>
              <Switch checked={settings.darkMode} onChange={toggleDark} isRTL={isRTL} />
            </div>
            <div className="flex items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">volume_up</span>
                <span className="font-bold">{t('settings_sound')}</span>
              </div>
              <Switch checked={settings.soundEnabled} onChange={toggleSound} isRTL={isRTL} />
            </div>
            <div className="flex items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">vibration</span>
                <span className="font-bold">{t('settings_haptics')}</span>
              </div>
              <Switch checked={settings.hapticsEnabled} onChange={toggleHaptics} isRTL={isRTL} />
            </div>
            <div className="flex flex-col p-4 px-5 space-y-3">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">language</span>
                <span className="font-bold">{t('settings_language')}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all border-2 ${settings.language === 'en' ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-700 border-transparent text-slate-500'}`}
                >
                  {t('lang_en')}
                </button>
                <button 
                  onClick={() => setLanguage('ar')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all border-2 ${settings.language === 'ar' ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-700 border-transparent text-slate-500'}`}
                >
                  {t('lang_ar')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Add stats section */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">Your Stats</h3>
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Matches Played</span>
              <span className="font-bold text-lg">{stats.totalMatches}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Wins</span>
              <span className="font-bold text-lg">{stats.wins}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Win Rate</span>
              <span className="font-bold text-lg">{winRate}%</span>
            </div>
          </div>
        </section>

        <div className="pt-4 space-y-3">
          <button 
            onClick={onLogout}
            className="w-full py-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">logout</span>
            {t('settings_logout')}
          </button>
          <button 
            onClick={reset}
            className="w-full py-5 rounded-2xl border-2 border-red-500/20 text-red-500 font-bold hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">restart_alt</span>
            {t('settings_reset')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Switch: React.FC<{ checked: boolean; onChange: () => void, isRTL: boolean }> = ({ checked, onChange, isRTL }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-7 rounded-full transition-all duration-300 relative ${checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
  >
    <div className={`absolute top-1 size-5 bg-white rounded-full shadow-md transition-all duration-300 ${isRTL ? (checked ? 'right-6' : 'right-1') : (checked ? 'left-6' : 'left-1')}`} />
  </button>
);