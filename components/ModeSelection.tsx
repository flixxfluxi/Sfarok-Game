import React, { useRef, useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

import { TranslationKey } from "../types"; // adjust path if needed

interface ModeSelectionProps {
  onBack: () => void;
  onLocal: () => void;
  onAI: () => void;
  onOnline: () => void;
  t: (key: TranslationKey) => string;
}

const floatingIconVariants: Variants = {
  animate: { 
    y: [0, -15, 0], 
    rotate: [0, 8, -8, 0], 
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      ease: 'easeInOut' as const 
    } 
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.15, 
      type: 'spring' as const, 
      stiffness: 120 
    } 
  }),
  hover: { scale: 1.1, boxShadow: '0 0 90px rgba(255,255,255,1)' },
};

const glitchVariants: Variants = {
  hover: {
    x: [0, 2, -2, 0],
    y: [0, -1, 1, 0],
    skewX: [0, 2, -2, 0],
    skewY: [0, 1, -1, 0],
    textShadow: [
      '2px 2px 5px #ff00ff, -2px -2px 5px #00ffff',
      '-2px -2px 5px #ff00ff, 2px 2px 5px #00ffff',
      '2px -2px 5px #ff00ff, -2px -2px 5px #00ffff',
      '2px -2px 5px #ff00ff, -2px -2px 5px #00ffff',
    ],
    transition: { 
      duration: 0.4, 
      repeat: Infinity, 
      repeatType: 'loop' as const 
    },
  },
};

const ModeHoverAnimation: React.FC<{ mode: string }> = ({ mode }) => {
  if (mode === 'local') {
    return (
      <>
        <motion.div
          className="absolute w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black text-2xl font-bold"
          animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'mirror' as const }}
        >
          👤
        </motion.div>
        <motion.div
          className="absolute w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black text-2xl font-bold"
          animate={{ x: [20, 10, 20], y: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'mirror' as const }}
        >
          👤
        </motion.div>
      </>
    );
  } else if (mode === 'ai') {
    return (
      <motion.div
        className="absolute w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-black text-xl font-bold"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        🤖
      </motion.div>
    );
  } else if (mode === 'online') {
    return (
      <motion.div className="absolute w-16 h-16 rounded-full flex items-center justify-center">
        <motion.div
          className="absolute w-16 h-16 rounded-full border-2 border-cyan-400"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' as const }}
        />
      </motion.div>
    );
  }
  return null;
};

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onBack, onLocal, onAI, onOnline, t }) => {
  const hoverSound = useRef(new Audio('/sounds/hover.mp3'));
  const clickSound = useRef(new Audio('/sounds/click.mp3'));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorParticles, setCursorParticles] = useState<{ x: number; y: number; size: number; color: string }[]>([]);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const playHover = () => hoverSound.current.play().catch(() => {});
  const playClick = () => clickSound.current.play().catch(() => {});

  const modes = [
    { key: 'local', label: t('mode_local'), sub: t('mode_local_sub'), icon: 'person', color: 'rgba(255,165,0,0.5)', gradient: 'from-orange-500 to-orange-400', onClick: onLocal },
    { key: 'ai', label: t('mode_ai'), sub: t('mode_ai_sub'), icon: 'smart_toy', color: 'rgba(160,32,240,0.5)', gradient: 'from-purple-500 to-purple-400', onClick: onAI },
    { key: 'online', label: t('mode_online'), sub: t('mode_online_sub'), icon: 'public', color: 'rgba(0,191,255,0.5)', gradient: 'from-blue-500 to-blue-400', onClick: onOnline },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorParticles((prev) => {
        const newParticle = {
          x: mousePos.x + Math.random() * 10 - 5,
          y: mousePos.y + Math.random() * 10 - 5,
          size: Math.random() * 6 + 4,
          color: `rgba(255,255,255,${Math.random() * 0.6})`,
        };
        return [...prev.slice(-20), newParticle];
      });
    }, 50);
    return () => clearInterval(interval);
  }, [mousePos]);

  return (
    <div className="relative flex-1 flex flex-col min-h-screen overflow-hidden" onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
      <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #1e1e2f, #2f1e3e)' }} animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }} />
      {cursorParticles.map((p, idx) => (
        <motion.div key={idx} className="absolute rounded-full pointer-events-none" style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color }} animate={{ opacity: [0.7, 0], scale: [1, 0] }} transition={{ duration: 0.5 }} />
      ))}
      <header className="flex items-center justify-between mb-12 relative z-10 px-6 pt-6">
        <button onClick={() => { onBack(); playClick(); }} className="p-2 -ml-2 text-white hover:text-yellow-400 transition-colors">
          <span className="material-symbols-outlined text-[36px]">chevron_left</span>
        </button>
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg text-white">{t('mode_title')}</h1>
        <div className="w-10"></div>
      </header>
      <div className="flex-1 flex flex-col gap-8 max-w-md mx-auto relative z-10 w-full px-4 pb-12">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.key}
            custom={i}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onClick={() => { mode.onClick(); playClick(); }}
            onMouseEnter={() => { playHover(); setHoveredMode(mode.key); }}
            onMouseLeave={() => setHoveredMode(null)}
            className={`group relative overflow-hidden p-8 rounded-3xl border-2 border-white/20 bg-gradient-to-tr ${mode.gradient} shadow-2xl text-white`}
          >
            {hoveredMode === mode.key && <ModeHoverAnimation mode={mode.key} />}
            <motion.div className="flex items-center gap-6 relative z-10" variants={glitchVariants} whileHover="hover">
              <motion.div className="w-20 h-20 bg-white/10 text-current rounded-full flex items-center justify-center shadow-lg text-5xl" variants={floatingIconVariants} animate="animate">
                <span className="material-symbols-outlined">{mode.icon}</span>
              </motion.div>
              <div className="text-left">
                <h3 className="font-bold text-2xl">{mode.label}</h3>
                <p className="text-base text-white/70">{mode.sub}</p>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};