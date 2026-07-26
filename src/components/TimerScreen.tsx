import React, { useState, useEffect } from 'react';
import { TimerMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, X, RotateCcw, AlertTriangle, Smartphone, RotateCw, Mic, MicOff, Volume2, Maximize2, Minimize2, ShieldAlert, Zap } from 'lucide-react';
import SupervisorCamera from './SupervisorCamera';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useKeepAwake } from '../hooks/useKeepAwake';

interface TimerScreenProps {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  cycles: number;
  subjectName?: string;
  isLandscape?: boolean;
  onToggleLandscape?: () => void;
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

export default function TimerScreen({ mode, timeLeft, isActive, cycles, subjectName, isLandscape, onToggleLandscape, onStop, onTogglePause, onPauseTimer, onResumeTimer }: TimerScreenProps) {
  if (mode === 'IDLE') return null;

  const [cameraRotation, setCameraRotation] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain'); // Default to wide room view (100% frame visibility)

  // Automatic Keep-Awake & Periodic Screen Touch (Simulated Touch every 5 Minutes to prevent phone screen timeout)
  const { isWakeLockActive, lastTouchTime, showTouchPulse } = useKeepAwake(true);

  // Initialize Voice Control for Arabic speech commands ("وقف العداد", "استمر", etc.)
  const { isListening, lastCommand } = useVoiceControl({
    onPause: onPauseTimer,
    onResume: onResumeTimer,
    enabled: voiceEnabled
  });

  // Sync camera rotation with landscape mode changes
  useEffect(() => {
    setCameraRotation(isLandscape ? 270 : 0);
  }, [isLandscape]);

  const handleRotateCamera = () => {
    setCameraRotation((prev) => (prev + 90) % 360);
  };

  const config = MODE_CONFIG[mode];
  const isPyramidMode = mode === 'FOCUS' || mode === 'RECALL';
  const currentCycleInPyramid = (cycles % 3) + 1; // 1, 2, or 3
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={`${isLandscape ? 'absolute' : 'fixed'} inset-0 z-50 flex flex-col items-center justify-center p-6 ${config.color} transition-colors duration-1000 overflow-hidden drop-shadow-xl`}
    >
      <SupervisorCamera 
        onPause={onPauseTimer} 
        onResume={onResumeTimer} 
        isLandscape={isLandscape} 
        cameraRotation={cameraRotation}
        fitMode={fitMode}
      />

      {/* Recognized Voice Command & KeepAwake Touch Notification Toasts */}
      <AnimatePresence>
        {lastCommand && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-20 z-40 bg-emerald-600 text-white font-bold px-6 py-3 rounded-full shadow-2xl backdrop-blur-lg flex items-center gap-2 border border-emerald-400/50"
          >
            <Volume2 size={20} className="animate-bounce" />
            <span>تم استلام أمر صوتی: {lastCommand}</span>
          </motion.div>
        )}

        {showTouchPulse && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-28 z-40 bg-indigo-600/90 text-white text-xs font-extrabold px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-indigo-400/50"
          >
            <Zap size={16} className="text-amber-300 animate-spin" />
            <span>لمس ذكي للشاشة (لمنع الانطفاء) ⚡ {lastTouchTime}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className={`absolute ${isLandscape ? 'top-4 right-4 left-4' : 'top-6 right-6 left-6'} flex items-center justify-between gap-3 text-white/80 pointer-events-auto z-20`}>
        <div className="font-semibold text-lg flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          {subjectName && <span>{subjectName}</span>}
          {subjectName && <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}
          <span>{config.label}</span>
          <span className="text-xs bg-indigo-500/80 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-indigo-300/40">
            <Zap size={12} className="text-amber-300 fill-amber-300" />
            <span>منع النوم (كل 5د)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Command Toggle Button */}
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all shadow-lg flex items-center gap-1.5 ${
              voiceEnabled && isListening 
                ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white ring-2 ring-emerald-400/50' 
                : 'bg-black/20 hover:bg-black/40 text-white/70'
            }`}
            title={voiceEnabled ? 'التحكم الصوتي مفعّل (قل "وقف" أو "استمر")' : 'تفعيل التحكم الصوتي'}
          >
            {voiceEnabled ? <Mic size={20} className={isListening ? 'animate-pulse text-emerald-200' : ''} /> : <MicOff size={20} />}
            <span className="text-xs font-medium hidden md:inline">
              {voiceEnabled ? (isListening ? 'الاستماع...' : 'مفعل') : 'غير مفعل'}
            </span>
          </button>

          {/* Camera Wide View Toggle Button */}
          <button 
            onClick={() => setFitMode(fitMode === 'contain' ? 'cover' : 'contain')}
            className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all shadow-lg flex items-center gap-1.5 ${
              fitMode === 'contain' 
                ? 'bg-indigo-600/80 hover:bg-indigo-600 text-white ring-2 ring-indigo-400/50' 
                : 'bg-black/20 hover:bg-black/40 text-white/70'
            }`}
            title={fitMode === 'contain' ? 'الرؤية العريضة مفعّلة (الغرفة كاملة)' : 'تفعيل رؤية الغرفة الكاملة'}
          >
            {fitMode === 'contain' ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            <span className="text-xs font-medium hidden lg:inline">
              {fitMode === 'contain' ? 'زاویة واسعة' : 'ملء الشاشة'}
            </span>
          </button>

          <button 
            onClick={handleRotateCamera}
            className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md border border-white/10 transition-all shadow-lg flex items-center gap-1"
            title={`تدوير الكاميرا (${cameraRotation}°)`}
          >
            <RotateCw size={20} />
          </button>

          <button 
            onClick={onToggleLandscape}
            className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md border border-white/10 transition-all shadow-lg"
            title="تغيير اتجاه الشاشة"
          >
            <Smartphone size={20} className={isLandscape ? "rotate-90" : "rotate-0"} />
          </button>

          <button 
            onClick={onStop}
            className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md border border-white/10 transition-all shadow-lg"
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className={`flex flex-col items-center text-center max-w-lg w-full relative ${isLandscape ? 'mt-4' : ''}`}>
        <motion.div 
          key={timeLeft}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${isLandscape ? 'text-[6rem] sm:text-[8rem]' : 'text-[8rem] sm:text-[12rem]'} font-bold leading-none tracking-tighter tabular-nums drop-shadow-lg`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        <motion.p 
          key={mode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isLandscape ? 'text-lg mt-2' : 'text-xl sm:text-2xl mt-4'} font-medium text-white/90`}
        >
          {config.description}
        </motion.p>

        {isPyramidMode && (
          <div className={`flex gap-3 ${isLandscape ? 'mt-4' : 'mt-12'}`}>
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`h-2.5 ${isLandscape ? 'w-12 sm:w-16' : 'w-16 sm:w-24'} rounded-full transition-all duration-500 ${
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
      <div className={`absolute ${isLandscape ? 'bottom-4 right-8' : 'bottom-12'} flex gap-4`}>
        <button 
          onClick={onTogglePause}
          className={`bg-white text-black ${isLandscape ? 'p-4' : 'p-6'} rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all`}
        >
          {isActive ? <Pause size={isLandscape ? 24 : 32} fill="currentColor" /> : <Play size={isLandscape ? 24 : 32} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      {/* Strict Mode Notice */}
      {!isActive && (
        <div className={`absolute ${isLandscape ? 'bottom-4 left-4' : 'bottom-32'} flex items-center gap-2 text-white/70 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm`}>
          <AlertTriangle size={16} />
          <span className="text-sm font-medium">المؤقت متوقف مؤقتاً</span>
        </div>
      )}
    </motion.div>
  );
}
