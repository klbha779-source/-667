import { useState, useEffect, useCallback } from 'react';
import { TimerMode } from '../types';
import { playAudioCue } from '../lib/audio';

// Real durations
const DURATIONS = {
  FOCUS: 25 * 60,
  RECALL: 5 * 60,
  SHORT_BREAK: 15 * 60,
  LONG_REVIEW: 60 * 60,
  DAWN_REVIEW: 60 * 60,
};

export function usePyramidTimer() {
  const [mode, setMode] = useState<TimerMode>('IDLE');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0); // 1 cycle = Focus + Recall
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  
  // Stats
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);

  const startDawnReview = useCallback(() => {
    setMode('DAWN_REVIEW');
    setTimeLeft(DURATIONS.DAWN_REVIEW);
    setIsActive(true);
    playAudioCue('review');
  }, []);

  const startPyramid = useCallback((subjectId: string) => {
    setActiveSubject(subjectId);
    setMode('FOCUS');
    setTimeLeft(DURATIONS.FOCUS);
    setCycles(0);
    setIsActive(true);
    playAudioCue('focus');
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setMode('IDLE');
    setActiveSubject(null);
  }, []);

  const togglePause = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === 'FOCUS') {
          setTodayFocusSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Transition logic
      if (mode === 'FOCUS') {
        setMode('RECALL');
        setTimeLeft(DURATIONS.RECALL);
        playAudioCue('recall', 'انتهى وقت التركيز، حان وقت الاسترجاع');
      } else if (mode === 'RECALL') {
        const newCycles = cycles + 1;
        setCycles(newCycles);
        
        if (newCycles % 6 === 0) {
          // 2 Pyramids complete -> Long Review
          setMode('LONG_REVIEW');
          setTimeLeft(DURATIONS.LONG_REVIEW);
          playAudioCue('review', 'انتهى وقت الاسترجاع، حان وقت المراجعة الشاملة');
        } else if (newCycles % 3 === 0) {
          // 1 Pyramid complete -> Short Break
          setMode('SHORT_BREAK');
          setTimeLeft(DURATIONS.SHORT_BREAK);
          playAudioCue('break', 'انتهى وقت الاسترجاع، خذ استراحة قصيرة');
        } else {
          // Back to focus
          setMode('FOCUS');
          setTimeLeft(DURATIONS.FOCUS);
          playAudioCue('focus', 'انتهى وقت الاسترجاع، عد إلى التركيز');
        }
      } else if (mode === 'SHORT_BREAK' || mode === 'LONG_REVIEW') {
        // Back to focus after break
        setMode('FOCUS');
        setTimeLeft(DURATIONS.FOCUS);
        playAudioCue('focus', 'انتهت الاستراحة، حان وقت التركيز');
      } else if (mode === 'DAWN_REVIEW') {
        setMode('IDLE');
        setIsActive(false);
        playAudioCue('break', 'انتهت مراجعة الفجر، أحسنت عملاً');
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, cycles]);

  return {
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
  };
}
