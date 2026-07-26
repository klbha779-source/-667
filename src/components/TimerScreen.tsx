import React from 'react';
import { TimerMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, X, RotateCcw, AlertTriangle } from 'lucide-react';
import SupervisorCamera from './SupervisorCamera';

interface TimerScreenProps {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  cycles: number;
  subjectName?: string;
  onStop: () => void;
  onTogglePause: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
}

const MODE_CONFIG: Record<TimerMode, { color: string; label: string; description: string }> = {
  IDLE: { color: 'text-gray-900', label: '', description: '' },
  FOCUS: { 
    color: 'text-white', 
    label: 'وقت التركيز',
    description: 'ركز تماماً ولا تشتت انتباهك بأي شيء آخر'
  },
  RECALL: { 
    color: 'text-white', 
    label: 'وقت الاسترجاع',
    description: 'اكتب أو راجع ما تعلمته في الـ 25 دقيقة الماضية بسرعة'
  },
  SHORT_BREAK: { 
    color: 'text-white', 
    label: 'استراحة قصيرة',
    description: 'لقد أنهيت هرماً! خذ قسطاً من الراحة'
  },
  LONG_REVIEW: { 
    color: 'text-white', 
    label: 'مراجعة شاملة',
    description: 'أنهيت هرمين! وقت ربط المعلومات والمراجعة العميقة'
  },
  DAWN_REVIEW: { 
    color: 'text-white', 
    label: 'مراجعة الفجر',
    description: 'راجع ما درسته يوم أمس لتثبيت المعلومات'
  }
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TimerScreen({ mode, timeLeft, isActive, cycles, subjectName, onStop, onTogglePause, onPauseTimer, onResumeTimer }: TimerScreenProps) {
  if (mode === 'IDLE') return null;

  const config = MODE_CONFIG[mode];
  const isPyramidMode = mode === 'FOCUS' || mode === 'RECALL';
  const currentCycleInPyramid = (cycles % 3) + 1; // 1, 2, or 3
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${config.color} transition-colors duration-1000 overflow-hidden drop-shadow-xl`}
    >
      <SupervisorCamera onPause={onPauseTimer} onResume={onResumeTimer} />

      {/* Top Bar */}
      <div className="absolute top-6 right-6 flex flex-col sm:flex-row items-end sm:items-center gap-3 text-white/80 pointer-events-auto">
        <div className="font-semibold text-lg flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
          {subjectName && <span>{subjectName}</span>}
          {subjectName && <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}
          <span>{config.label}</span>
        </div>
        <button 
          onClick={onStop}
          className="p-3 bg-black/10 hover:bg-black/20 rounded-full backdrop-blur-sm transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="flex flex-col items-center text-center max-w-lg w-full relative">
        <motion.div 
          key={timeLeft}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[8rem] sm:text-[12rem] font-bold leading-none tracking-tighter tabular-nums drop-shadow-lg"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        <motion.p 
          key={mode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl mt-4 font-medium text-white/90"
        >
          {config.description}
        </motion.p>

        {isPyramidMode && (
          <div className="flex gap-3 mt-12">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`h-2.5 w-16 sm:w-24 rounded-full transition-all duration-500 ${
                  step < currentCycleInPyramid 
                    ? 'bg-white' 
                    : step === currentCycleInPyramid 
                      ? mode === 'FOCUS' ? 'bg-white/60 animate-pulse' : 'bg-white/80'
                      : 'bg-black/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 flex gap-4">
        <button 
          onClick={onTogglePause}
          className="bg-white text-black p-6 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      {/* Strict Mode Notice */}
      {!isActive && (
        <div className="absolute bottom-32 flex items-center gap-2 text-white/70 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
          <AlertTriangle size={16} />
          <span className="text-sm font-medium">المؤقت متوقف مؤقتاً</span>
        </div>
      )}
    </motion.div>
  );
}
