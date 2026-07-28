import React from 'react';
import { SessionRecord, Subject } from '../types';
import { Clock, History, BarChart2, Flame, Award, Coffee, BookOpen } from 'lucide-react';

interface StatsViewProps {
  todayFocusSeconds: number;
  todayBreakSeconds: number;
  todayCompletedRounds: number;
  sessionHistory: SessionRecord[];
  subjects: Subject[];
  isDarkMode: boolean;
}

const TARGET_FOCUS_SECONDS = 4 * 90 * 60; // 6 hours

export default function StatsView({
  todayFocusSeconds,
  todayBreakSeconds,
  todayCompletedRounds,
  sessionHistory,
  subjects,
  isDarkMode,
}: StatsViewProps) {
  const getSubjectName = (id: string | null) => {
    return subjects.find((s) => s.id === id)?.name || 'دراسة عامة';
  };

  const formatHoursMinutes = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h} س و ${m} د`;
    if (m > 0) return `${m} دقيقة ${s > 0 ? `و ${s} ث` : ''}`;
    return `${s} ثانية`;
  };

  const focusPercent = Math.min((todayFocusSeconds / TARGET_FOCUS_SECONDS) * 100, 100);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            إحصائيات الدراسة والمحاضرات 📊
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            سجل دقيق لوقت القراءة الفعلي والجولات المكتملة
          </p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 p-3 rounded-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Award size={22} />
          <span className="font-extrabold text-lg">{todayCompletedRounds} / 4</span>
          <span className="text-xs font-medium">جولات مكتملة</span>
        </div>
      </div>

      {/* Main Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Focus Study Time */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">وقت الدراسة اليوم</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatHoursMinutes(todayFocusSeconds)}
          </div>
          <p className="text-xs text-slate-400 mt-2">من هدف 6 ساعات ({focusPercent.toFixed(0)}%)</p>
        </div>

        {/* Completed 90-min Rounds */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">جولات الـ 90 دقيقة</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-xl">
              <Flame size={20} />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {todayCompletedRounds} <span className="text-sm font-normal text-slate-400">جولات</span>
          </div>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-2">تحدي الـ 4 جولات</p>
        </div>

        {/* Total Break Time */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">وقت الراحة التراكمي</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
              <Coffee size={20} />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatHoursMinutes(todayBreakSeconds)}
          </div>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-2">فترات الراحة المستفادة</p>
        </div>
      </div>

      {/* Progress Bar towards 6 Hours */}
      <div className={`p-6 rounded-xl border shadow-sm flex flex-col gap-3 ${
        isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex justify-between items-center text-sm">
          <span className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <BookOpen size={18} className="text-indigo-500" />
            التقدم نحو هدف اليوم (6 ساعات / 4 جولات)
          </span>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
            {(todayFocusSeconds / 3600).toFixed(1)} / 6.0 ساعات
          </span>
        </div>
        <div className={`h-3.5 w-full rounded-md overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <div
            className="h-full bg-indigo-600 rounded-md transition-all duration-700"
            style={{ width: `${focusPercent}%` }}
          />
        </div>
      </div>

      {/* Session History Log */}
      <div className={`p-6 rounded-xl border shadow-sm flex flex-col gap-4 ${
        isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
          <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <History size={20} className="text-indigo-600 dark:text-indigo-400" />
            سجل الجلسات والمحاضرات اليومية
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {sessionHistory.length} جلسات مسجلة
          </span>
        </div>

        {sessionHistory.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 text-center">
            <BarChart2 size={40} className="text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-500 dark:text-slate-400">لا توجد جلسات مسجلة اليوم بعد.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">ابدأ مباراة الـ 90 دقيقة وسيقوم النظام بتسجيل إنجازك تلقائياً!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessionHistory.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 rounded-lg border flex flex-col gap-2.5 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-md bg-indigo-600" />
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {getSubjectName(sess.subjectId)} — الجولة {sess.roundNumber || 1}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-md border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      {sess.startTime}
                    </span>
                  </div>
                  {sess.isCompleted ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-md font-bold">
                      مكتملة (90د)
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-md font-bold">
                      جزئية
                    </span>
                  )}
                </div>

                <div className={`grid grid-cols-2 gap-2 text-xs p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <span className="text-slate-400 block">مدة القراءة/الدراسة</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {formatHoursMinutes(sess.focusSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">عدد التوقفات اليدوية</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                      {sess.pauseCount || 0} مرات
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
