import React from 'react';
import { SessionRecord, Subject } from '../types';
import { Clock, UserX, AlertCircle, CheckCircle2, History, BarChart2, Flame, Award } from 'lucide-react';

interface StatsViewProps {
  todayFocusSeconds: number;
  todayDowntimeSeconds: number;
  todayAbsencesCount: number;
  sessionHistory: SessionRecord[];
  subjects: Subject[];
}

const GOAL_10_HOURS = 10 * 60 * 60; // 36000 seconds

export default function StatsView({
  todayFocusSeconds,
  todayDowntimeSeconds,
  todayAbsencesCount,
  sessionHistory,
  subjects,
}: StatsViewProps) {
  const getSubjectName = (id: string | null) => {
    if (id === 'dawn') return 'مراجعة الفجر';
    return subjects.find((s) => s.id === id)?.name || 'دراسة عامة';
  };

  const formatHoursMinutes = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h} س و ${m} د`;
    }
    return `${m} دقيقة ${s > 0 ? `و ${s} ث` : ''}`;
  };

  const formatTimeOnly = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m === 0) return `${s} ثانية`;
    return `${m} دقيقة و ${s} ثانية`;
  };

  const focusPercent = Math.min((todayFocusSeconds / GOAL_10_HOURS) * 100, 100);
  
  // Calculate discipline score
  const totalTrackedSeconds = todayFocusSeconds + todayDowntimeSeconds;
  const disciplineScore = totalTrackedSeconds > 0 
    ? Math.round((todayFocusSeconds / totalTrackedSeconds) * 100) 
    : 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إحصائيات اليوم والانقطاعات</h2>
          <p className="text-gray-500 text-sm mt-0.5">متابعة دقيقة للتركيز وأوقات التوقف والقيام من الكرسي</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center gap-2 text-indigo-700">
          <Award size={22} />
          <span className="font-bold text-lg">{disciplineScore}%</span>
          <span className="text-xs text-indigo-500 font-medium">معدل الانضباط</span>
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Focus */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold text-gray-500">إجمالي التركيز</span>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {formatHoursMinutes(todayFocusSeconds)}
          </div>
          <p className="text-xs text-gray-400 mt-2">من هدف 10 ساعات ({focusPercent.toFixed(1)}%)</p>
        </div>

        {/* Total Absences Count */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-gray-500">عدد مرات التوقف</span>
            <div className="p-2 bg-amber-50 rounded-xl">
              <UserX size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {todayAbsencesCount} <span className="text-sm font-normal text-gray-500">مرات</span>
          </div>
          <p className="text-xs text-amber-600/80 mt-2">القيام من الكرسي / التوقف</p>
        </div>

        {/* Total Downtime Duration */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold text-gray-500">مدة الغياب التراكمية</span>
            <div className="p-2 bg-rose-50 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {formatTimeOnly(todayDowntimeSeconds)}
          </div>
          <p className="text-xs text-rose-600/80 mt-2">وقت الغياب عن الكاميرا</p>
        </div>
      </div>

      {/* Progress Bar towards 10 Hours */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            <Flame size={18} className="text-amber-500" />
            التقدم نحو هدف اليوم (10 ساعات)
          </span>
          <span className="font-bold text-indigo-600">
            {(todayFocusSeconds / 3600).toFixed(1)} / 10 ساعات
          </span>
        </div>
        <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700"
            style={{ width: `${focusPercent}%` }}
          />
        </div>
      </div>

      {/* Sessions History & Absence Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <History size={20} className="text-indigo-600" />
            سجل الجلسات وتفاصيل التوقفات
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            {sessionHistory.length} جلسات مسجلة
          </span>
        </div>

        {sessionHistory.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2 text-center">
            <BarChart2 size={40} className="text-gray-300" />
            <p className="font-medium text-gray-500">لا توجد جلسات مكتملة أو محفوظة اليوم بعد.</p>
            <p className="text-xs text-gray-400">ابدأ جلسة هرمية وسيقوم النظام بتسجيل وقت التركيز وتفاصيل التوقف تلقائياً!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sessionHistory.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="font-bold text-gray-900">
                      {getSubjectName(sess.subjectId)}
                    </span>
                    <span className="text-xs text-gray-400 bg-white px-2.5 py-1 rounded-full border border-gray-200 font-medium">
                      {sess.startTime}
                    </span>
                  </div>
                  {sess.isCompleted ? (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> مكتملة
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 bg-gray-200/60 px-3 py-1 rounded-full font-medium">
                      محفوظة
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-gray-200/60">
                  <div>
                    <span className="text-gray-400 block">وقت التركيز</span>
                    <span className="font-bold text-indigo-700 text-sm">
                      {formatTimeOnly(sess.focusSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">عدد القيام/التوقف</span>
                    <span className="font-bold text-amber-700 text-sm">
                      {sess.absencesCount} مرات
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">إجمالي الغياب</span>
                    <span className="font-bold text-rose-700 text-sm">
                      {formatTimeOnly(sess.downtimeSeconds)}
                    </span>
                  </div>
                </div>

                {/* Absence Log Items if present */}
                {sess.absences && sess.absences.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-xs font-bold text-gray-500">تفاصيل أوقات الانقطاع والقيام:</span>
                    <div className="flex flex-wrap gap-2">
                      {sess.absences.map((abs, idx) => (
                        <div
                          key={abs.id || idx}
                          className="text-[11px] bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium"
                        >
                          <UserX size={12} />
                          <span>
                            من {abs.startTime} {abs.endTime ? `إلى ${abs.endTime}` : ''} ({formatTimeOnly(abs.durationSeconds)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
