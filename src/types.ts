export type TimerMode = 'IDLE' | 'FOCUS' | 'RECALL' | 'SHORT_BREAK' | 'LONG_REVIEW' | 'DAWN_REVIEW';

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface AbsenceRecord {
  id: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
}

export interface SessionRecord {
  id: string;
  mode: TimerMode;
  subjectId: string | null;
  subjectName?: string;
  date: string;
  startTime: string;
  focusSeconds: number;
  downtimeSeconds: number;
  absencesCount: number;
  absences: AbsenceRecord[];
  isCompleted: boolean;
}

export interface SavedSessionState {
  mode: TimerMode;
  timeLeft: number;
  cycles: number;
  activeSubject: string | null;
  sessionFocusSeconds: number;
  sessionDowntimeSeconds: number;
  absencesCount: number;
  absences: AbsenceRecord[];
  currentAbsenceStart: number | null;
  lastSavedAt: number;
}
