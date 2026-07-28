import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, SavedSessionState, SessionRecord } from '../types';
import { playLoudRingAlarm, playAudioCue } from '../lib/audio';

export const MATCH_FOCUS_DURATION = 90 * 60; // 90 minutes = 5,400 seconds
export const MATCH_BREAK_DURATION = 10 * 60; // 10 minutes = 600 seconds
export const TARGET_ROUNDS_PER_DAY = 4; // 4 rounds challenge = 6 hours total study

const SAVED_SESSION_KEY = 'match90_saved_session_v3';
const DAILY_STATS_KEY = 'match90_daily_stats_v3';

export function usePyramidTimer() {
  const [mode, setMode] = useState<TimerMode>('IDLE');
  const [timeLeft, setTimeLeft] = useState(MATCH_FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(1); // 1 to 4
  const [completedRoundsCount, setCompletedRoundsCount] = useState(0);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Active Session Counters
  const [sessionFocusSeconds, setSessionFocusSeconds] = useState(0);
  const [sessionBreakSeconds, setSessionBreakSeconds] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);

  // Daily Stats Totals
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);
  const [todayBreakSeconds, setTodayBreakSeconds] = useState(0);
  const [todayCompletedRounds, setTodayCompletedRounds] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

  // Recovery
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [savedSessionInfo, setSavedSessionInfo] = useState<SavedSessionState | null>(null);

  // Load daily stats & saved session on mount
  useEffect(() => {
    try {
      const savedDaily = localStorage.getItem(DAILY_STATS_KEY);
      if (savedDaily) {
        const parsed = JSON.parse(savedDaily);
        const todayStr = new Date().toLocaleDateString('ar-SA');
        if (parsed.date === todayStr) {
          setTodayFocusSeconds(parsed.todayFocusSeconds || 0);
          setTodayBreakSeconds(parsed.todayBreakSeconds || 0);
          setTodayCompletedRounds(parsed.todayCompletedRounds || 0);
          setSessionHistory(parsed.sessionHistory || []);
        }
      }

      const savedSession = localStorage.getItem(SAVED_SESSION_KEY);
      if (savedSession) {
        const parsedState: SavedSessionState = JSON.parse(savedSession);
        if (parsedState && parsedState.mode !== 'IDLE' && parsedState.timeLeft > 0) {
          setHasSavedSession(true);
          setSavedSessionInfo(parsedState);
        }
      }
    } catch (e) {
      console.error('Failed to load storage data:', e);
    }
  }, []);

  // Sync active session state to localStorage
  useEffect(() => {
    if (mode === 'IDLE') {
      localStorage.removeItem(SAVED_SESSION_KEY);
      setHasSavedSession(false);
      return;
    }

    const stateToSave: SavedSessionState = {
      mode,
      timeLeft,
      completedRounds: completedRoundsCount,
      currentRound,
      activeSubject,
      sessionFocusSeconds,
      sessionBreakSeconds,
      pauseCount,
      lastSavedAt: Date.now(),
    };

    try {
      localStorage.setItem(SAVED_SESSION_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [mode, timeLeft, completedRoundsCount, currentRound, activeSubject, sessionFocusSeconds, sessionBreakSeconds, pauseCount]);

  // Save daily stats helper
  const saveDailyStats = useCallback((addFocus: number, addBreak: number, newSessionRecord?: SessionRecord) => {
    setTodayFocusSeconds((prevFocus) => {
      const updatedFocus = prevFocus + addFocus;
      setTodayBreakSeconds((prevBreak) => {
        const updatedBreak = prevBreak + addBreak;
        setSessionHistory((prevHistory) => {
          const updatedHistory = newSessionRecord ? [newSessionRecord, ...prevHistory] : prevHistory;
          const todayStr = new Date().toLocaleDateString('ar-SA');

          // Count completed 90-min rounds from history
          const completedCount = updatedHistory.filter((r) => r.isCompleted && r.mode === 'MATCH_FOCUS').length;
          setTodayCompletedRounds(completedCount);

          try {
            localStorage.setItem(
              DAILY_STATS_KEY,
              JSON.stringify({
                date: todayStr,
                todayFocusSeconds: updatedFocus,
                todayBreakSeconds: updatedBreak,
                todayCompletedRounds: completedCount,
                sessionHistory: updatedHistory,
              })
            );
          } catch (e) {
            console.error('Error saving daily stats:', e);
          }

          return updatedHistory;
        });
        return updatedBreak;
      });
      return updatedFocus;
    });
  }, []);

  // Restore unfinished session
  const restoreSavedSession = useCallback(() => {
    if (!savedSessionInfo) return;

    setMode(savedSessionInfo.mode);
    setTimeLeft(savedSessionInfo.timeLeft);
    setCurrentRound(savedSessionInfo.currentRound || 1);
    setCompletedRoundsCount(savedSessionInfo.completedRounds || 0);
    setActiveSubject(savedSessionInfo.activeSubject);
    setSessionFocusSeconds(savedSessionInfo.sessionFocusSeconds || 0);
    setSessionBreakSeconds(savedSessionInfo.sessionBreakSeconds || 0);
    setPauseCount(savedSessionInfo.pauseCount || 0);
    
    setIsActive(true);
    setHasSavedSession(false);
    playAudioCue('focus', 'تم استرجاع الجلسة السابقة بنجاح');
  }, [savedSessionInfo]);

  // Discard saved session
  const discardSavedSession = useCallback(() => {
    localStorage.removeItem(SAVED_SESSION_KEY);
    setHasSavedSession(false);
    setSavedSessionInfo(null);
  }, []);

  // Start 90-Minute Match Study Round
  const startMatchRound = useCallback((subjectId: string, roundNum = 1) => {
    discardSavedSession();
    setActiveSubject(subjectId);
    setMode('MATCH_FOCUS');
    setTimeLeft(MATCH_FOCUS_DURATION);
    setCurrentRound(roundNum);
    setSessionFocusSeconds(0);
    setSessionBreakSeconds(0);
    setPauseCount(0);
    setIsActive(true);
    playAudioCue('focus', `بدأت الجولة ${roundNum} من تحدي الـ 90 دقيقة. بالتوفيق!`);
  }, [discardSavedSession]);

  // Manual Pause
  const pauseTimer = useCallback(() => {
    if (!isActive) return;
    setIsActive(false);
    setPauseCount((prev) => prev + 1);
  }, [isActive]);

  // Manual Resume
  const resumeTimer = useCallback(() => {
    if (isActive) return;
    setIsActive(true);
  }, [isActive]);

  // Toggle Pause/Resume
  const togglePause = useCallback(() => {
    if (isActive) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [isActive, pauseTimer, resumeTimer]);

  // Stop Session Manually
  const stopTimer = useCallback(() => {
    if (mode !== 'IDLE' && sessionFocusSeconds > 0) {
      const record: SessionRecord = {
        id: Date.now().toString(),
        mode,
        subjectId: activeSubject,
        date: new Date().toLocaleDateString('ar-SA'),
        startTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        roundNumber: currentRound,
        focusSeconds: sessionFocusSeconds,
        breakSeconds: sessionBreakSeconds,
        pauseCount,
        isCompleted: false,
      };
      saveDailyStats(0, 0, record);
    }

    setIsActive(false);
    setMode('IDLE');
    setActiveSubject(null);
    localStorage.removeItem(SAVED_SESSION_KEY);
    setHasSavedSession(false);
  }, [mode, activeSubject, currentRound, sessionFocusSeconds, sessionBreakSeconds, pauseCount, saveDailyStats]);

  // Main Timer Tick Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);

        if (mode === 'MATCH_FOCUS') {
          setSessionFocusSeconds((prev) => prev + 1);
          setTodayFocusSeconds((prev) => prev + 1);
        } else if (mode === 'MATCH_BREAK') {
          setSessionBreakSeconds((prev) => prev + 1);
          setTodayBreakSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Round completed!
      if (mode === 'MATCH_FOCUS') {
        // 90-minute study round completed!
        const record: SessionRecord = {
          id: Date.now().toString(),
          mode: 'MATCH_FOCUS',
          subjectId: activeSubject,
          date: new Date().toLocaleDateString('ar-SA'),
          startTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          roundNumber: currentRound,
          focusSeconds: MATCH_FOCUS_DURATION,
          breakSeconds: 0,
          pauseCount,
          isCompleted: true,
        };
        saveDailyStats(0, 0, record);

        setCompletedRoundsCount((prev) => prev + 1);
        setMode('MATCH_BREAK');
        setTimeLeft(MATCH_BREAK_DURATION);

        // LOUD RING ALARM for 5 SECONDS as specified by user!
        playLoudRingAlarm(`انتهت الجولة ${currentRound}! بدأت الآن فترة الراحة لمدة 10 دقائق.`);
      } else if (mode === 'MATCH_BREAK') {
        // 10-minute break finished!
        const nextRound = currentRound + 1;
        if (nextRound <= TARGET_ROUNDS_PER_DAY) {
          setCurrentRound(nextRound);
          setMode('MATCH_FOCUS');
          setTimeLeft(MATCH_FOCUS_DURATION);
          playAudioCue('focus', `انتهت الراحة! بدأت الجولة ${nextRound} من 4.`);
        } else {
          // Challenge completed!
          setMode('IDLE');
          setIsActive(false);
          playLoudRingAlarm('مبارك! أكملت تحدي الـ 4 جولات (6 ساعات دراسة) بنجاح باهر!');
        }
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, currentRound, activeSubject, pauseCount, saveDailyStats]);

  return {
    mode,
    timeLeft,
    isActive,
    currentRound,
    completedRoundsCount,
    activeSubject,
    sessionFocusSeconds,
    sessionBreakSeconds,
    pauseCount,
    todayFocusSeconds,
    todayBreakSeconds,
    todayCompletedRounds,
    sessionHistory,
    hasSavedSession,
    savedSessionInfo,
    restoreSavedSession,
    discardSavedSession,
    startMatchRound,
    stopTimer,
    togglePause,
    pauseTimer,
    resumeTimer,
  };
}
