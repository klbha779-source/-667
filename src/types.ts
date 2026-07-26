export type TimerMode = 'IDLE' | 'FOCUS' | 'RECALL' | 'SHORT_BREAK' | 'LONG_REVIEW' | 'DAWN_REVIEW';

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface DailyProgress {
  date: string;
  totalFocusSeconds: number; // For the 10 hours goal
  pyramidsCompleted: number;
}
