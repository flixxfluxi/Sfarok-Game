import React, { useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { AILevel } from '../types';

interface DifficultySelectionProps {
  onBack: () => void;
  onSelect: (level: AILevel) => void;
  t: (key: any) => string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 120 } 
  }
};

export const DifficultySelection: React.FC<DifficultySelectionProps> = ({ onBack, onSelect, t }) => {
  const hoverSound = useRef(new Audio('/sounds/hover.mp3'));
  const clickSound = useRef(new Audio('/sounds/click.mp3'));

  const playHover = () => {
    hoverSound.current.currentTime = 0;
    hoverSound.current.play().catch(() => {});
  };

  const playClick = () => {
    clickSound.current.play().catch(() => {});
  };

  const levels = [
    {
      id: AILevel.EASY,
      title: t('diff_easy'),
      sub: t('diff_easy_sub'),
      icon: 'child_care',
      bg: 'bg-[#f97316]', 
      iconBg: 'bg-[#ea580c]' 
    },
    {
      id: AILevel.MEDIUM,
      title: t('diff_medium'),
      sub: t('diff_medium_sub'),
      icon: 'fitness_center',
      bg: 'bg-[#a855f7]', 
      iconBg: 'bg-[#9333ea]'
    },
    {
      id: AILevel.HARD,
      title: t('diff_hard'),
      sub: t('diff_hard_sub'),
      icon: 'psychology',
      bg: 'bg-[#3b82f6]', 
      iconBg: 'bg-[#2563eb]'
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#1e1a2d] p-6 items-center justify-center">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex items-center justify-between mb-10"
      >
        <button 
          onClick={() => { playClick(); onBack(); }} 
          className="p-2 -ml-2 text-white/80 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-[40px]">chevron_left</span>
        </button>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Select Difficulty
        </h1>
        <div className="w-10"></div>
      </motion.header>

      {/* Options List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md flex flex-col gap-5"
      >
        {levels.map((level) => (
          <motion.button
            key={level.id}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={playHover}
            onClick={() => { playClick(); onSelect(level.id); }}
            className={`${level.bg} relative flex items-center p-6 rounded-[2.5rem] shadow-xl text-white group overflow-hidden border-none`}
          >
            {/* Left Circular Icon Container */}
            <div className={`${level.iconBg} w-20 h-20 rounded-full flex items-center justify-center shadow-inner flex-shrink-0 transition-transform group-hover:rotate-12 duration-300`}>
              <span className="material-symbols-outlined text-4xl">
                {level.icon}
              </span>
            </div>

            {/* Text Content */}
            <div className="ml-6 text-left">
              <h3 className="text-2xl font-bold leading-tight">
                {level.title}
              </h3>
              <p className="text-white/80 text-sm font-medium mt-1">
                {level.sub}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => { playClick(); onBack(); }}
        className="mt-12 text-white/40 uppercase tracking-[0.3em] text-xs font-bold hover:text-white/80 transition-colors"
      >
        Cancel and return
      </motion.button>
    </div>
  );
};