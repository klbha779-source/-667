import React, { useState, useEffect, useCallback } from 'react';
import { Subject, ColorTheme, TimerStyle } from './types';
import Dashboard from './components/Dashboard';
import TimerScreen from './components/TimerScreen';
import StatsView from './components/StatsView';
import { usePyramidTimer } from './hooks/usePyramidTimer';
import { AnimatePresence } from 'motion/react';
import { BarChart3, Home, Smartphone, Moon, Sun, Timer } from 'lucide-react';

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'math', name: 'الرياضيات', color: 'bg-blue-500' },
  { id: 'physics', name: 'الفيزياء', color: 'bg-indigo-500' },
  { id: 'biology', name: 'الأحياء', color: 'bg-emerald-500' },
  { id: 'chemistry', name: 'الكيمياء', color: 'bg-purple-500' },
  { id: 'arabic', name: 'اللغة العربية', color: 'bg-amber-500' },
  { id: 'english', name: 'اللغة الإنجليزية', color: 'bg-rose-500' },
];

const SUBJECTS_STORAGE_KEY = 'match90_subjects_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [isLandscape, setIsLandscape] = useState(false);

  // Subject List State
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(SUBJECTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* fallback */
    }
    return DEFAULT_SUBJECTS;
  });

  // Save subjects
  useEffect(() => {
    try {
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      /* ignore */
    }
  }, [subjects]);

  const handleAddSubject = useCallback((name: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      color: 'bg-indigo-500',
    };
    setSubjects((prev) => [...prev, newSubject]);
  }, []);

  const handleDeleteSubject = useCallback((id: string) => {
    setSubjects((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  // Customization Preferences State
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem('match90_colorTheme') as ColorTheme) || 'indigo';
  });
  const [timerStyle, setTimerStyle] = useState<TimerStyle>(() => {
    return (localStorage.getItem('match90_timerStyle') as TimerStyle) || 'circle';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('match90_darkMode') === 'true';
  });

  // Save customization changes
  useEffect(() => {
    localStorage.setItem('match90_colorTheme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('match90_timerStyle', timerStyle);
  }, [timerStyle]);

  useEffect(() => {
    localStorage.setItem('match90_darkMode', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

  const {
    mode,
    timeLeft,
    isActive,
    currentRound,
    completedRoundsCount,
    todayFocusSeconds,
    todayBreakSeconds,
    todayCompletedRounds,
    sessionHistory,
    hasSavedSession,
    savedSessionInfo,
    restoreSavedSession,
    discardSavedSession,
    activeSubject,
    startMatchRound,
    stopTimer,
    togglePause,
    pauseTimer,
    resumeTimer,
  } = usePyramidTimer();

  const getSubjectName = (id: string | null) => {
    return subjects.find((s) => s.id === id)?.name || 'دراسة عامة';
  };

  const toggleLandscape = async () => {
    const nextState = !isLandscape;
    setIsLandscape(nextState);
    try {
      if (nextState) {
        if (screen.orientation && 'lock' in screen.orientation) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (screen.orientation && 'unlock' in screen.orientation) {
          screen.orientation.unlock();
        }
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={
        isLandscape
          ? `fixed top-1/2 left-1/2 w-[100vh] h-[100vw] -translate-x-1/2 -translate-y-1/2 rotate-90 overflow-hidden font-[Cairo] flex flex-col z-50 ${
              isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
            }`
          : `min-h-screen font-[Cairo] pb-24 flex flex-col transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
            }`
      }
    >
      {/* Executive Navbar */}
      <header className={`border-b sticky top-0 z-40 flex-shrink-0 transition-colors ${
        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white  shadow-indigo-600/20">
              <Timer size={22} />
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight block leading-tight">مباراة الـ 90 دقيقة</span>
              <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">Pyramid Match Focus</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-lg border transition-all ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="تغيير الوضع الليلي/النهاري"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleLandscape}
              className={`p-2.5 rounded-lg border transition-all ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="تغيير اتجاه الشاشة"
            >
              <Smartphone size={18} className={isLandscape ? 'rotate-90' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className={`flex-1 ${isLandscape ? 'overflow-y-auto pb-20 pt-4' : 'pt-4'}`}>
        {activeTab === 'home' && (
          <Dashboard
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onStartMatch={startMatchRound}
            todayFocusSeconds={todayFocusSeconds}
            todayCompletedRounds={todayCompletedRounds}
            hasSavedSession={hasSavedSession}
            savedSessionInfo={savedSessionInfo}
            onRestoreSavedSession={restoreSavedSession}
            onDiscardSavedSession={discardSavedSession}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            timerStyle={timerStyle}
            setTimerStyle={setTimerStyle}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            todayFocusSeconds={todayFocusSeconds}
            todayBreakSeconds={todayBreakSeconds}
            todayCompletedRounds={todayCompletedRounds}
            sessionHistory={sessionHistory}
            subjects={subjects}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* Bottom Floating Navigation */}
      <div className={
        isLandscape
          ? `absolute bottom-0 inset-x-0 border-t p-2 z-30 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`
          : `fixed bottom-0 inset-x-0 border-t p-3 pb-safe z-30 transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`
      }>
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg transition-all ${
              activeTab === 'home'
                ? 'text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50 dark:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home size={22} />
            <span className="text-xs font-extrabold">الرئيسية</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg transition-all ${
              activeTab === 'stats'
                ? 'text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50 dark:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 size={22} />
            <span className="text-xs font-extrabold">الإحصائيات</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Timer Focus Screen Overlay */}
      <AnimatePresence>
        {mode !== 'IDLE' && (
          <TimerScreen
            mode={mode}
            timeLeft={timeLeft}
            isActive={isActive}
            currentRound={currentRound}
            completedRounds={completedRoundsCount}
            subjectName={getSubjectName(activeSubject)}
            isLandscape={isLandscape}
            onToggleLandscape={toggleLandscape}
            onStop={stopTimer}
            onTogglePause={togglePause}
            onPauseTimer={pauseTimer}
            onResumeTimer={resumeTimer}
            colorTheme={colorTheme}
            timerStyle={timerStyle}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
