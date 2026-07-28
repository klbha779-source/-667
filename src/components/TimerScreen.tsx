import React from 'react';
import { TimerMode, ColorTheme, TimerStyle } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, X, Zap, Mic, MicOff, Volume2, Moon, Sun, Smartphone, Coffee, Flame } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useKeepAwake } from '../hooks/useKeepAwake';

interface TimerScreenProps {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  currentRound: number;
  completedRounds: number;
  subjectName: string;
  isLandscape: boolean;
  onToggleLandscape: () => void;
  onStop: () => void;
  onTogglePause: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  colorTheme: ColorTheme;
  timerStyle: TimerStyle;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const TOTAL_FOCUS_TIME = 90 * 60;
const TOTAL_BREAK_TIME = 10 * 60;

export default function TimerScreen({
  mode,
  timeLeft,
  isActive,
  currentRound,
  subjectName,
  isLandscape,
  onToggleLandscape,
  onStop,
  onTogglePause,
  onPauseTimer,
  onResumeTimer,
  colorTheme,
  timerStyle,
  isDarkMode,
  setIsDarkMode,
}: TimerScreenProps) {
  const { isListening, lastCommand } = useVoiceControl({
    onPause: onPauseTimer,
    onResume: onResumeTimer,
    enabled: mode !== 'IDLE',
  });

  const { lastTouchTime, showTouchPulse } = useKeepAwake(mode !== 'IDLE');

  const totalDuration = mode === 'MATCH_FOCUS' ? TOTAL_FOCUS_TIME : TOTAL_BREAK_TIME;
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const themeClasses = {
    indigo: {
      bgDark: 'bg-slate-950',
      bgLight: 'bg-white',
      accent: 'text-indigo-600',
      border: 'border-indigo-100',
      ring: 'stroke-indigo-600',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    emerald: {
      bgDark: 'bg-zinc-950',
      bgLight: 'bg-white',
      accent: 'text-emerald-600',
      border: 'border-emerald-100',
      ring: 'stroke-emerald-600',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    amber: {
      bgDark: 'bg-stone-950',
      bgLight: 'bg-white',
      accent: 'text-amber-600',
      border: 'border-amber-100',
      ring: 'stroke-amber-600',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    purple: {
      bgDark: 'bg-slate-950',
      bgLight: 'bg-white',
      accent: 'text-purple-600',
      border: 'border-purple-100',
      ring: 'stroke-purple-600',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      badge: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    rose: {
      bgDark: 'bg-zinc-950',
      bgLight: 'bg-white',
      accent: 'text-rose-600',
      border: 'border-rose-100',
      ring: 'stroke-rose-600',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      badge: 'bg-rose-50 text-rose-700 border-rose-100',
    },
    slate: {
      bgDark: 'bg-gray-950',
      bgLight: 'bg-white',
      accent: 'text-slate-800',
      border: 'border-slate-200',
      ring: 'stroke-slate-800',
      btn: 'bg-slate-800 hover:bg-slate-900 text-white',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    gold: {
      bgDark: 'bg-stone-950',
      bgLight: 'bg-white',
      accent: 'text-yellow-600',
      border: 'border-yellow-100',
      ring: 'stroke-yellow-500',
      btn: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      badge: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    },
  }[colorTheme] || {
    bgDark: 'bg-slate-950',
    bgLight: 'bg-white',
    accent: 'text-indigo-600',
    border: 'border-indigo-100',
    ring: 'stroke-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  };

  const isBreak = mode === 'MATCH_BREAK';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed inset-0 z-[100] flex flex-col justify-between p-4 sm:p-8 font-[Cairo] select-none transition-colors duration-500 ${
        isDarkMode ? `${themeClasses.bgDark} text-slate-100` : `${themeClasses.bgLight} text-slate-900`
      }`}
    >
      <AnimatePresence>
        {lastCommand && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 ${themeClasses.btn} font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-2`}
          >
            <Volume2 size={16} className="" />
            <span>أمر صوتي: {lastCommand}</span>
          </motion.div>
        )}

        {showTouchPulse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-16 left-1/2 -translate-x-1/2 z-50 ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} font-bold text-[10px] px-3 py-1.5 rounded-md flex items-center gap-1.5`}
          >
            <Zap size={14} className={themeClasses.accent} />
            <span>لمس تلقائي • {lastTouchTime}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onStop}
            className={`p-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${
              isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <X size={20} />
            <span className="hidden sm:inline">إنهاء</span>
          </button>
        </div>

        <div className={`flex items-center gap-2 border px-4 py-2 rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : themeClasses.badge}`}>
          {isBreak ? (
            <Coffee size={18} className={themeClasses.accent} />
          ) : (
            <Flame size={18} className={themeClasses.accent} />
          )}
          <span className="font-bold text-sm tracking-wide">
            {isBreak ? 'استراحة' : `الجولة ${currentRound}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-xl transition-all ${
              isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={onToggleLandscape}
            className={`p-3 rounded-xl transition-all ${
              isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Smartphone size={20} className={isLandscape ? 'rotate-90' : ''} />
          </button>
        </div>
      </div>

      {/* Center Main Timer View */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-4xl mx-auto py-8">
        
        <div className="text-center mb-8">
          <span className={`text-xs sm:text-sm font-bold uppercase tracking-widest ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {isBreak ? 'وقت الإنعاش' : `المادة: ${subjectName}`}
          </span>
        </div>

        {timerStyle === 'circle' && (
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                className={`stroke-current ${isDarkMode ? 'text-slate-800' : 'text-slate-100'}`}
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                className={`${themeClasses.ring} transition-all duration-1000 ease-linear`}
                strokeWidth="4"
                strokeDasharray="289.02"
                strokeDashoffset={289.02 - (289.02 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-6xl sm:text-7xl font-black tracking-tighter tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        )}

        {timerStyle === 'digital' && (
          <div className={`w-full max-w-md p-10 sm:p-14 rounded-lg border text-center my-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-7xl sm:text-8xl font-mono font-black tracking-tight tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {timerStyle === 'bar' && (
          <div className="w-full max-w-xl flex flex-col items-center gap-8 my-4">
            <div className={`text-7xl sm:text-8xl font-black tracking-tight tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="w-full flex flex-col gap-3">
              <div className={`h-2 w-full rounded-md overflow-hidden ${
                isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <div
                  className={`h-full ${themeClasses.bgDark === 'bg-slate-950' && !isDarkMode ? themeClasses.btn.split(' ')[0] : (isDarkMode ? 'bg-white' : themeClasses.btn.split(' ')[0])} transition-all duration-1000`}
                  style={{ width: `${progressPercent}%`, backgroundColor: isDarkMode ? '#fff' : undefined }}
                />
              </div>
            </div>
          </div>
        )}

        {timerStyle === 'stadium' && (
          <div className={`w-full max-w-lg p-8 sm:p-10 rounded-lg border flex flex-col gap-6 text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-7xl sm:text-8xl font-black font-mono tabular-nums ${themeClasses.accent}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {/* Voice Control Indicator */}
        <div className={`mt-10 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          {isListening ? (
            <>
              <Mic size={16} className={themeClasses.accent} />
              <span>التحكم الصوتي جاهز</span>
            </>
          ) : (
            <>
              <MicOff size={16} />
              <span>التحكم الصوتي معطل</span>
            </>
          )}
        </div>

      </div>

      {/* Bottom Main Action Button */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-3 z-10">
        <button
          onClick={onTogglePause}
          className={`w-full py-4 sm:py-5 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
            isActive
              ? (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900')
              : themeClasses.btn
          }`}
        >
          {isActive ? (
            <>
              <Pause size={24} fill="currentColor" />
              <span>إيقاف مؤقت</span>
            </>
          ) : (
            <>
              <Play size={24} fill="currentColor" />
              <span>متابعة</span>
            </>
          )}
        </button>
      </div>

    </motion.div>
  );
}
