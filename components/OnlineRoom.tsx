
import React, { useState } from 'react';
import { Player } from '../types';
import { generateRoomCode } from '../multiplayer';

interface OnlineRoomProps {
  onBack: () => void;
  onStart: (roomCode: string, color: Player) => void;
  t: (key: any) => string;
}

export const OnlineRoom: React.FC<OnlineRoomProps> = ({ onBack, onStart, t }) => {
  const [roomCode, setRoomCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleCreate = () => {
    const code = generateRoomCode();
    setCreatedCode(code);
  };

  const handleJoin = () => {
    if (roomCode.length >= 4) {
      onStart(roomCode.toUpperCase(), Player.BLUE);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-sm mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-primary">
          <span className="material-symbols-outlined text-[32px]">chevron_left</span>
        </button>
        <h1 className="text-2xl font-bold tracking-tight">{t('online_title')}</h1>
        <div className="w-10"></div>
      </header>

      {!createdCode ? (
        <div className="flex-1 flex flex-col gap-8 justify-center">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">{t('online_join')}</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 font-bold text-center tracking-[0.5em] outline-none focus:border-primary transition-all"
              />
              <button 
                onClick={handleJoin}
                disabled={roomCode.length < 4}
                className="h-14 aspect-square bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined">login</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-light dark:bg-bg-dark px-2 text-slate-400 font-bold tracking-widest">{t('online_host')}</span></div>
          </div>

          <button 
            onClick={handleCreate}
            className="h-16 w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            {t('online_create')}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
          <div className="space-y-2">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('online_share')}</span>
             <div className="text-5xl font-black tracking-[0.2em] bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-primary text-primary shadow-2xl shadow-primary/20">
               {createdCode}
             </div>
          </div>

          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-3">
               <div className="size-2 rounded-full bg-primary animate-ping" />
               <span className="font-bold text-sm text-slate-500">{t('online_waiting')}</span>
            </div>
            
            <p className="text-xs text-slate-400 px-8">{t('online_sim_sub')}</p>

            <button 
              onClick={() => onStart(createdCode, Player.RED)}
              className="h-16 w-full bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              {t('online_start_host')}
            </button>
            
            <button 
              onClick={() => setCreatedCode(null)}
              className="text-xs font-black uppercase tracking-widest text-red-500"
            >
              {t('online_cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
