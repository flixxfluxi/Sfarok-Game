import React, { useState } from 'react';
import { signUp, login, loginWithGoogle } from './authService';

interface LoginScreenProps {
  t: (key: any) => string;
  onGuestLogin: (nickname?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ t, onGuestLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // ✅ Terms checkbox

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err?.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept Terms & Privacy Policy');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!identifier || !password || !nickname) throw new Error('Email, password and username required');
        await signUp(identifier, password, nickname);
      } else {
        if (!identifier || !password) throw new Error('Email/username and password required');
        await login(identifier, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestClick = () => {
    const guestName = nickname.trim() || 'Guest';
    onGuestLogin(guestName);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10 max-w-sm mx-auto w-full animate-fade-in">
      <div className="text-center">
        <div className="size-24 bg-primary rounded-4xl flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-primary/30">
          <span className="material-symbols-outlined text-white text-5xl">account_circle</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">{t('login_welcome')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium opacity-80 uppercase tracking-widest">{t('login_sub')}</p>
      </div>

      {error && (
        <div className="w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{isSignUp ? t('signup_email') : t('login_email')}</label>
          <input 
            type="text" 
            placeholder="name@example.com or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t('login_password')}</label>
          <input 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-soft"
          />
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t('signup_username')}</label>
            <input 
              type="text" 
              placeholder="WarriorName"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-soft"
            />
          </div>
        )}

        {/* Terms & Privacy */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            id="terms-checkbox"
            className="h-4 w-4"
          />
          <label htmlFor="terms-checkbox" className="text-xs text-slate-400">
            I agree to the <a href="/terms" className="text-primary underline">Terms & Conditions</a> and <a href="/privacy" className="text-primary underline">Privacy Policy</a>
          </label>
        </div>

        <button
          disabled={!identifier || !password || (isSignUp && !nickname) || !acceptedTerms || isLoading}
          className="w-full h-16 bg-primary text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none mt-4"
        >
          {isSignUp ? t('signup_btn') : t('login_btn')}
        </button>

        <div className="text-center mt-2">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-primary font-bold">{isSignUp ? t('have_account') : t('create_account')}</button>
        </div>
      </form>

      <div className="w-full space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-bg-light dark:bg-bg-dark px-3 text-slate-400 font-black">Or</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-16 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-soft active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="size-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          {t('login_google_btn')}
        </button>

        <button
          onClick={handleGuestClick}
          className="w-full h-16 bg-gray-500 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-600 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {t('login_guest') || 'Continue as Guest'}
        </button>
      </div>
    </div>
  );
};