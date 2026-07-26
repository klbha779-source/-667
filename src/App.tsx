import React, { useState } from 'react';
import { Subject } from './types';
import Dashboard from './components/Dashboard';
import TimerScreen from './components/TimerScreen';
import { usePyramidTimer } from './hooks/usePyramidTimer';
import { AnimatePresence } from 'motion/react';
import { BarChart3, Home, Smartphone } from 'lucide-react';

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'math', name: 'الرياضيات', color: 'bg-blue-500' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [isLandscape, setIsLandscape] = useState(false);
  const [subjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  
  const {
    mode,
    timeLeft,
    isActive,
    cycles,
    todayFocusSeconds,
    activeSubject,
    startDawnReview,
    startPyramid,
    stopTimer,
    togglePause,
    pauseTimer,
    resumeTimer
  } = usePyramidTimer();

  const getSubjectName = (id: string | null) => {
    return subjects.find(s => s.id === id)?.name;
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
      // Orientation API lock fallback
    }
  };

  return (
    <div 
      className={
        isLandscape 
          ? "fixed top-1/2 left-1/2 w-[100vh] h-[100vw] -translate-x-1/2 -translate-y-1/2 rotate-90 overflow-hidden bg-gray-50 font-[Cairo] text-gray-900 flex flex-col z-50" 
          : "min-h-screen bg-gray-50 overflow-x-hidden font-[Cairo] text-gray-900 pb-24 flex flex-col"
      }
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform rotate-3">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-b-[14px] border-b-white border-r-[8px] border-r-transparent" />
            </div>
            <span className="font-bold text-xl tracking-tight">الهرم 90</span>
          </div>
          
          <button 
            onClick={toggleLandscape}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors flex items-center gap-2"
            title="تغيير اتجاه الشاشة"
          >
            <Smartphone size={20} className={isLandscape ? "rotate-90 transition-transform" : "transition-transform"} />
            <span className="text-sm font-medium hidden sm:inline">{isLandscape ? 'الوضع العمودي' : 'الوضع الأفقي'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${isLandscape ? 'overflow-y-auto pb-20 pt-4' : 'pt-6'}`}>
        {activeTab === 'home' && (
          <Dashboard 
            subjects={subjects}
            onStartPyramid={startPyramid}
            onStartDawnReview={startDawnReview}
            todayFocusSeconds={todayFocusSeconds}
          />
        )}

        {activeTab === 'stats' && (
          <div className="max-w-2xl mx-auto p-6 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">الإحصائيات والتحليل</h2>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-4 items-center justify-center py-16">
              <BarChart3 size={48} className="text-gray-300" />
              <p className="text-gray-500">سيتم إضافة الرسوم البيانية الأسبوعية قريباً</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className={isLandscape ? "absolute bottom-0 inset-x-0 bg-white border-t border-gray-200 p-2.5 z-30" : "fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 pb-safe z-30"}>
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${activeTab === 'home' ? 'text-indigo-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home size={22} />
            <span className="text-xs">الرئيسية</span>
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${activeTab === 'stats' ? 'text-indigo-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <BarChart3 size={22} />
            <span className="text-xs">الإحصائيات</span>
          </button>
        </div>
      </div>

      {/* Timer Overlay overlay */}
      <AnimatePresence>
        {mode !== 'IDLE' && (
          <TimerScreen 
            mode={mode}
            timeLeft={timeLeft}
            isActive={isActive}
            cycles={cycles}
            subjectName={getSubjectName(activeSubject)}
            isLandscape={isLandscape}
            onToggleLandscape={toggleLandscape}
            onStop={stopTimer}
            onTogglePause={togglePause}
            onPauseTimer={pauseTimer}
            onResumeTimer={resumeTimer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
