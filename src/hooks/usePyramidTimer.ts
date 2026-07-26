import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, SavedSessionState, AbsenceRecord, SessionRecord } from '../types';
import { playAudioCue } from '../lib/audio';

const DURATIONS = {
  FOCUS: 25 * 60,
  RECALL: 5 * 60,
  SHORT_BREAK: 15 * 60,
  LONG_REVIEW: 60 * 60,
  DAWN_REVIEW: 60 * 60,
};

const SAVED_SESSION_KEY = 'pyramid_saved_session_v2';
const DAILY_STATS_KEY = 'pyramid_daily_stats_v2';

export function usePyramidTimer() {
  const [mode, setMode] = useState<TimerMode>('IDLE');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Session Statistics
  const [sessionFocusSeconds, setSessionFocusSeconds] = useState(0);
  const [sessionDowntimeSeconds, setSessionDowntimeSeconds] = useState(0);
  const [absencesCount, setAbsencesCount] = useState(0);
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);

  // Daily Totals & History
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);
  const [todayDowntimeSeconds, setTodayDowntimeSeconds] = useState(0);
  const [todayAbsencesCount, setTodayAbsencesCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

  // Session Recovery
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [savedSessionInfo, setSavedSessionInfo] = useState<SavedSessionState | null>(null);

  const absenceStartRef = useRef<number | null>(null);

  // Load initial daily stats and check for unfinished session
  useEffect(() => {
    try {
      // Load stats
      const savedDaily = localStorage.getItem(DAILY_STATS_KEY);
      if (savedDaily) {
        const parsed = JSON.parse(savedDaily);
        // Only load if same date
        const todayStr = new Date().toLocaleDateString('ar-SA');
        if (parsed.date === todayStr) {
          setTodayFocusSeconds(parsed.todayFocusSeconds || 0);
          setTodayDowntimeSeconds(parsed.todayDowntimeSeconds || 0);
          setTodayAbsencesCount(parsed.todayAbsencesCount || 0);
          setSessionHistory(parsed.sessionHistory || []);
        }
      }

      // Load saved session for recovery
      const savedSession = localStorage.getItem(SAVED_SESSION_KEY);
      if (savedSession) {
        const parsedState: SavedSessionState = JSON.parse(savedSession);
        if (parsedState && parsedState.mode !== 'IDLE' && parsedState.timeLeft > 0) {
          setHasSavedSession(true);
          setSavedSessionInfo(parsedState);
        }
      }
    } catch (e) {
      console.error('Failed to load local storage data:', e);
    }
  }, []);

  // Save active session to localStorage whenever state changes
  useEffect(() => {
    if (mode === 'IDLE') {
      localStorage.removeItem(SAVED_SESSION_KEY);
      setHasSavedSession(false);
      return;
    }

    const stateToSave: SavedSessionState = {
      mode,
      timeLeft,
      cycles,
      activeSubject,
      sessionFocusSeconds,
      sessionDowntimeSeconds,
      absencesCount,
      absences,
      currentAbsenceStart: absenceStartRef.current,
      lastSavedAt: Date.now(),
    };

    try {
      localStorage.setItem(SAVED_SESSION_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save session state:', e);
    }
  }, [mode, timeLeft, cycles, activeSubject, sessionFocusSeconds, sessionDowntimeSeconds, absencesCount, absences]);

  // Save daily stats to localStorage
  const saveDailyStats = useCallback((addFocus: number, addDowntime: number, addAbsence: number, newSessionRecord?: SessionRecord) => {
    setTodayFocusSeconds((prev) => {
      const updatedFocus = prev + addFocus;
      setTodayDowntimeSeconds((prevDowntime) => {
        const updatedDowntime = prevDowntime + addDowntime;
        setTodayAbsencesCount((prevAbsences) => {
          const updatedAbsences = prevAbsences + addAbsence;
          
          setSessionHistory((prevHistory) => {
            const updatedHistory = newSessionRecord ? [newSessionRecord, ...prevHistory] : prevHistory;
            const todayStr = new Date().toLocaleDateString('ar-SA');

            try {
              localStorage.setItem(
                DAILY_STATS_KEY,
                JSON.stringify({
                  date: todayStr,
                  todayFocusSeconds: updatedFocus,
                  todayDowntimeSeconds: updatedDowntime,
                  todayAbsencesCount: updatedAbsences,
                  sessionHistory: updatedHistory,
                })
              );
            } catch (e) {
              console.error('Error saving daily stats:', e);
            }

            return updatedHistory;
          });

          return updatedAbsences;
        });
        return updatedDowntime;
      });
      return updatedFocus;
    });
  }, []);

  // Restore unfinished session ("الرجوع إلى الجلسة")
  const restoreSavedSession = useCallback(() => {
    if (!savedSessionInfo) return;

    setMode(savedSessionInfo.mode);
    setTimeLeft(savedSessionInfo.timeLeft);
    setCycles(savedSessionInfo.cycles);
    setActiveSubject(savedSessionInfo.activeSubject);
    setSessionFocusSeconds(savedSessionInfo.sessionFocusSeconds);
    setSessionDowntimeSeconds(savedSessionInfo.sessionDowntimeSeconds);
    setAbsencesCount(savedSessionInfo.absencesCount);
    setAbsences(savedSessionInfo.absences);
    
    absenceStartRef.current = savedSessionInfo.currentAbsenceStart;
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

  // Start Dawn Review
  const startDawnReview = useCallback(() => {
    discardSavedSession();
    setMode('DAWN_REVIEW');
    setTimeLeft(DURATIONS.DAWN_REVIEW);
    setCycles(0);
    setActiveSubject('dawn');
    setSessionFocusSeconds(0);
    setSessionDowntimeSeconds(0);
    setAbsencesCount(0);
    setAbsences([]);
    absenceStartRef.current = null;
    setIsActive(true);
    playAudioCue('review');
  }, [discardSavedSession]);

  // Start Pyramid session
  const startPyramid = useCallback((subjectId: string) => {
    discardSavedSession();
    setActiveSubject(subjectId);
    setMode('FOCUS');
    setTimeLeft(DURATIONS.FOCUS);
    setCycles(0);
    setSessionFocusSeconds(0);
    setSessionDowntimeSeconds(0);
    setAbsencesCount(0);
    setAbsences([]);
    absenceStartRef.current = null;
    setIsActive(true);
    playAudioCue('focus');
  }, [discardSavedSession]);

  // Stop current session manually
  const stopTimer = useCallback(() => {
    if (mode !== 'IDLE') {
      // Record session history entry
      const record: SessionRecord = {
        id: Date.now().toString(),
        mode,
        subjectId: activeSubject,
        date: new Date().toLocaleDateString('ar-SA'),
        startTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        focusSeconds: sessionFocusSeconds,
        downtimeSeconds: sessionDowntimeSeconds,
        absencesCount,
        absences,
        isCompleted: false,
      };
      saveDailyStats(0, 0, 0, record);
    }

    setIsActive(false);
    setMode('IDLE');
    setActiveSubject(null);
    absenceStartRef.current = null;
    localStorage.removeItem(SAVED_SESSION_KEY);
    setHasSavedSession(false);
  }, [mode, activeSubject, sessionFocusSeconds, sessionDowntimeSeconds, absencesCount, absences, saveDailyStats]);

  // Pause timer (Absence or Manual)
  const pauseTimer = useCallback(() => {
    if (!isActive) return;

    setIsActive(false);
    
    // Register new absence start
    const now = Date.now();
    absenceStartRef.current = now;
    setAbsencesCount((prev) => prev + 1);
    setTodayAbsencesCount((prev) => prev + 1);

    const newAbsenceRecord: AbsenceRecord = {
      id: now.toString(),
      startTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      durationSeconds: 0,
    };
    setAbsences((prev) => [...prev, newAbsenceRecord]);
  }, [isActive]);

  // Resume timer (Return to chair or Manual)
  const resumeTimer = useCallback(() => {
    if (isActive) return;

    setIsActive(true);

    // Finalize current absence record duration
    if (absenceStartRef.current) {
      const elapsedAbsenceSec = Math.round((Date.now() - absenceStartRef.current) / 1000);
      absenceStartRef.current = null;

      setAbsences((prev) => {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        last.endTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        last.durationSeconds = elapsedAbsenceSec;
        return [...prev.slice(0, -1), last];
      });
    }
  }, [isActive]);

  // Toggle Pause
  const togglePause = useCallback(() => {
    if (isActive) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [isActive, pauseTimer, resumeTimer]);

  // Timer Tick Effect (Focus seconds & TimeLeft)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);

        if (mode === 'FOCUS' || mode === 'DAWN_REVIEW') {
          setSessionFocusSeconds((prev) => prev + 1);
          setTodayFocusSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else if (!isActive && mode !== 'IDLE') {
      // Accumulate downtime seconds while timer is paused in session
      interval = setInterval(() => {
        setSessionDowntimeSeconds((prev) => prev + 1);
        setTodayDowntimeSeconds((prev) => prev + 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Phase Transitions
      if (mode === 'FOCUS') {
        setMode('RECALL');
        setTimeLeft(DURATIONS.RECALL);
        playAudioCue('recall', 'انتهى وقت التركيز، حان وقت الاسترجاع');
      } else if (mode === 'RECALL') {
        const newCycles = cycles + 1;
        setCycles(newCycles);
        
        if (newCycles % 6 === 0) {
          setMode('LONG_REVIEW');
          setTimeLeft(DURATIONS.LONG_REVIEW);
          playAudioCue('review', 'انتهى وقت الاسترجاع، حان وقت المراجعة الشاملة');
        } else if (newCycles % 3 === 0) {
          setMode('SHORT_BREAK');
          setTimeLeft(DURATIONS.SHORT_BREAK);
          playAudioCue('break', 'انتهى وقت الاسترجاع، خذ استراحة قصيرة');
        } else {
          setMode('FOCUS');
          setTimeLeft(DURATIONS.FOCUS);
          playAudioCue('focus', 'انتهى وقت الاسترجاع، عد إلى التركيز');
        }
      } else if (mode === 'SHORT_BREAK' || mode === 'LONG_REVIEW') {
        setMode('FOCUS');
        setTimeLeft(DURATIONS.FOCUS);
        playAudioCue('focus', 'انتهت الاستراحة، حان وقت التركيز');
      } else if (mode === 'DAWN_REVIEW') {
        const record: SessionRecord = {
          id: Date.now().toString(),
          mode: 'DAWN_REVIEW',
          subjectId: 'dawn',
          date: new Date().toLocaleDateString('ar-SA'),
          startTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          focusSeconds: sessionFocusSeconds,
          downtimeSeconds: sessionDowntimeSeconds,
          absencesCount,
          absences,
          isCompleted: true,
        };
        saveDailyStats(0, 0, 0, record);

        setMode('IDLE');
        setIsActive(false);
        playAudioCue('break', 'انتهت مراجعة الفجر، أحسنت عملاً');
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, cycles, sessionFocusSeconds, sessionDowntimeSeconds, absencesCount, absences, saveDailyStats]);

  return {
    mode,
    timeLeft,
    isActive,
    cycles,
    activeSubject,
    sessionFocusSeconds,
    sessionDowntimeSeconds,
    absencesCount,
    absences,
    todayFocusSeconds,
    todayDowntimeSeconds,
    todayAbsencesCount,
    sessionHistory,
    hasSavedSession,
    savedSessionInfo,
    restoreSavedSession,
    discardSavedSession,
    startDawnReview,
    startPyramid,
    stopTimer,
    togglePause,
    pauseTimer,
    resumeTimer,
  };
}
