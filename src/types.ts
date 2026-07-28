export type TimerMode = 'IDLE' | 'MATCH_FOCUS' | 'MATCH_BREAK';

export type ColorTheme = 'classic' | 'midnight' | 'forest' | 'ocean' | 'crimson' | 'sand';
export type TimerStyle = 'circle' | 'digital' | 'bar' | 'stadium';

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface SessionRecord {
  id: string;
  mode: TimerMode;
  subjectId: string | null;
  subjectName?: string;
  date: string;
  startTime: string;
  roundNumber: number; // 1, 2, 3, or 4
  focusSeconds: number; // Time spent studying in this match
  breakSeconds: number; // Time spent resting
  pauseCount: number; // How many times user paused
  isCompleted: boolean;
}

export interface SavedSessionState {
  mode: TimerMode;
  timeLeft: number;
  completedRounds: number; // 0 to 4
  currentRound: number; // 1 to 4
  activeSubject: string | null;
  sessionFocusSeconds: number;
  sessionBreakSeconds: number;
  pauseCount: number;
  lastSavedAt: number;
}

