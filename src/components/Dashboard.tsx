import React, { useState } from 'react';
import { Subject, SavedSessionState, ColorTheme, TimerStyle } from '../types';
import { Play, RotateCcw, RefreshCw, Clock, Flame, Award, Palette, Moon, Sun, Plus, Trash2, Volume2, CheckCircle2, BookOpen, Layers } from 'lucide-react';
import { playLoudRingAlarm } from '../lib/audio';

interface DashboardProps {
 subjects: Subject[];
 onAddSubject: (name: string) => void;
 onDeleteSubject: (id: string) => void;
 onStartMatch: (subjectId: string, roundNum: number) => void;
 todayFocusSeconds: number;
 todayCompletedRounds: number;
 hasSavedSession: boolean;
 savedSessionInfo: SavedSessionState | null;
 onRestoreSavedSession: () => void;
 onDiscardSavedSession: () => void;
 // Theme & Style props
 colorTheme: ColorTheme;
 setColorTheme: (theme: ColorTheme) => void;
 timerStyle: TimerStyle;
 setTimerStyle: (style: TimerStyle) => void;
 isDarkMode: boolean;
 setIsDarkMode: (dark: boolean) => void;
}

const TARGET_ROUNDS = 4; // 4 rounds x 90 mins = 360 mins (6 hrs)
const TARGET_FOCUS_SECONDS = 4 * 90 * 60; // 21,600 seconds

export default function Dashboard({
 subjects,
 onAddSubject,
 onDeleteSubject,
 onStartMatch,
 todayFocusSeconds,
 todayCompletedRounds,
 hasSavedSession,
 savedSessionInfo,
 onRestoreSavedSession,
 onDiscardSavedSession,
 colorTheme,
 setColorTheme,
 timerStyle,
 setTimerStyle,
 isDarkMode,
 setIsDarkMode,
}: DashboardProps) {
 const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '');
 const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
 const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
 const [newSubjectName, setNewSubjectName] = useState<string>('');
 const [isPlayingAlarmTest, setIsPlayingAlarmTest] = useState<boolean>(false);

 const formatHoursMinutes = (totalSec: number) => {
 const h = Math.floor(totalSec / 3600);
 const m = Math.floor((totalSec % 3600) / 60);
 if (h > 0) return `${h} س و ${m} د`;
 return `${m} دقيقة`;
 };

 const getSubjectName = (id: string | null) => {
 return subjects.find((s) => s.id === id)?.name || 'دراسة عامة';
 };

 const handleAddSubjectSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newSubjectName.trim()) return;
 onAddSubject(newSubjectName.trim());
 setNewSubjectName('');
 };

 const handleTestAlarm = () => {
 setIsPlayingAlarmTest(true);
 playLoudRingAlarm('تجربة صوت المنبه والتنبيه الصوتي بنجاح!');
 setTimeout(() => setIsPlayingAlarmTest(false), 5500);
 };

 const progressPercent = Math.min((todayFocusSeconds / TARGET_FOCUS_SECONDS) * 100, 100);
 const nextRoundToPlay = Math.min(todayCompletedRounds + 1, TARGET_ROUNDS);

 return (
 <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-4 sm:p-6 animate-in fade-in duration-300">
 
 {/* Top Main Hero Title & Quick Settings */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
 <div>
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-2">
  <span className="w-2 h-2 rounded-md bg-indigo-500 " />
  تحدي الـ 4 جولات (6 ساعات دراسة يومياً)
  </div>
  <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
  مباراة الـ 90 دقيقة ⏱️
  </h1>
  <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
  نظام الهرم والتركيز العالي (90 دقيقة study + 10 دقائق break)
  </p>
 </div>

 <div className="flex items-center gap-2 self-start sm:self-auto">
  {/* Test Sound Alarm */}
  <button
  onClick={handleTestAlarm}
  disabled={isPlayingAlarmTest}
  className={`px-3 py-2.5 rounded-lg border flex items-center gap-2 text-xs font-bold transition-all ${
  isPlayingAlarmTest
  ? 'bg-amber-500 text-white border-amber-400 '
  : isDarkMode
  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
  }`}
  title="تجربة منبه نهاية الجولة"
  >
  <Volume2 size={16} />
  <span className="hidden sm:inline">اختبار الصوت</span>
  </button>

  {/* Theme & Style Customization */}
  <button
  onClick={() => setShowThemeModal(true)}
  className={`px-3.5 py-2.5 rounded-lg border flex items-center gap-2 font-bold text-xs sm:text-sm transition-all ${
  isDarkMode
  ? 'bg-indigo-900 border-indigo-700 text-indigo-300 hover:bg-indigo-900'
  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
  }`}
  >
  <Palette size={18} />
  <span className="hidden sm:inline">الألوان والمظهر</span>
  </button>

  {/* Dark Mode Toggle */}
  <button
  onClick={() => setIsDarkMode(!isDarkMode)}
  className={`p-2.5 rounded-lg border transition-all ${
  isDarkMode
  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
  }`}
  title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
  >
  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
  </button>
 </div>
 </div>

 {/* Session Recovery Banner */}
 {hasSavedSession && savedSessionInfo && (
 <div className="bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 p-5 sm:p-6 rounded-xl  flex flex-col gap-3 relative overflow-hidden ">
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
  <div className="p-3 bg-white rounded-lg">
  <RotateCcw size={22} className="" />
  </div>
  <div>
  <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-100">جلسة محفوظة في الذاكرة</span>
  <h3 className="text-base sm:text-lg font-black">توجد جولة سابقة لم تكتمل بعد</h3>
  </div>
  </div>
  </div>

  <p className="text-amber-50 text-xs sm:text-sm leading-relaxed font-medium">
  الجولة {savedSessionInfo.currentRound} ({getSubjectName(savedSessionInfo.activeSubject)}) — المتبقي: {Math.floor(savedSessionInfo.timeLeft / 60)} دقيقة.
  </p>

  <div className="flex gap-2.5 mt-1">
  <button
  onClick={onRestoreSavedSession}
  className="flex-1 bg-white text-amber-950 font-black py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-50 transition-all text-xs sm:text-sm "
  >
  <RotateCcw size={16} />
  متابعة الجولة السابقة
  </button>
  <button
  onClick={onDiscardSavedSession}
  className="bg-black hover:bg-black text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs border border-white "
  >
  <RefreshCw size={14} />
  إلغاء وجلسة جديدة
  </button>
  </div>
 </div>
 )}

 {/* Today 4-Round Challenge Track */}
 <div className={`p-6 rounded-xl border shadow-sm flex flex-col gap-5 ${
 isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
 }`}>
 <div className="flex justify-between items-center">
  <div className="flex items-center gap-2.5">
  <div className="p-2 bg-amber-500 rounded-lg text-amber-500">
  <Flame size={22} fill="currentColor" />
  </div>
  <div>
  <h2 className={`font-black text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
  مسار الجولات الأربع اليومي
  </h2>
  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
  كل جولة تتكون من 90 دقيقة تركيز
  </span>
  </div>
  </div>
  <span className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
  {todayCompletedRounds} من {TARGET_ROUNDS} مكتملة
  </span>
 </div>

 {/* 4 Round Track Visualization */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {[1, 2, 3, 4].map((roundNum) => {
  const isDone = roundNum <= todayCompletedRounds;
  const isNext = roundNum === nextRoundToPlay && !isDone;

  return (
  <div
  key={roundNum}
  className={`p-4 rounded-lg border flex flex-col gap-2 items-center text-center transition-all ${
   isDone
   ? 'bg-emerald-500 border-emerald-500 text-emerald-600 dark:text-emerald-400'
   : isNext
   ? 'bg-indigo-500 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500 '
   : isDarkMode
   ? 'bg-slate-950 border-slate-800 text-slate-500'
   : 'bg-slate-50 border-slate-200 text-slate-400'
  }`}
  >
  <div className="flex items-center gap-1.5">
   {isDone ? (
   <CheckCircle2 size={18} className="text-emerald-500" />
   ) : (
   <Award size={18} />
   )}
   <span className="font-extrabold text-xs sm:text-sm">الجولة {roundNum}</span>
  </div>
  <span className="text-[11px] font-bold opacity-80">
   {isDone ? 'مكتملة (90د)' : isNext ? 'الجولة القادمة' : '90د دراسة'}
  </span>
  </div>
  );
  })}
 </div>

 {/* Progress Bar */}
 <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 ">
  <div className="flex justify-between items-center text-xs font-bold">
  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>معدل إنجاز الهدف (6 ساعات)</span>
  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
  {formatHoursMinutes(todayFocusSeconds)} / 6.0 ساعات ({progressPercent.toFixed(0)}%)
  </span>
  </div>
  <div className={`h-3.5 w-full rounded-md overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
  <div
  className="h-full bg-indigo-600 rounded-md transition-all duration-700"
  style={{ width: `${progressPercent}%` }}
  />
  </div>
 </div>
 </div>

 {/* Main Action Card: Start Match Round */}
 <div className={`p-6 rounded-xl border shadow-sm flex flex-col gap-5 ${
 isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
 }`}>
 <div className="flex items-center justify-between">
  <div>
  <h3 className={`text-lg sm:text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
  بدء جولة جديدة (90 دقيقة)
  </h3>
  <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
  اختر المادة أو المحاضرة للبدء في الجولة {nextRoundToPlay}
  </p>
  </div>
  <button
  onClick={() => setShowSubjectModal(true)}
  className="p-2.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
  >
  <Plus size={16} />
  <span>إدارة المواد</span>
  </button>
 </div>

 {/* Subjects Horizontal Scroll Chips */}
 <div className="flex flex-col gap-2">
  <label className={`text-xs font-extrabold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
  المادة / المحاضرة المختارة:
  </label>
  <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
  {subjects.map((s) => (
  <button
  key={s.id}
  onClick={() => setSelectedSubject(s.id)}
  className={`px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
   selectedSubject === s.id
   ? 'border-indigo-600 bg-indigo-600 text-white  shadow-indigo-600 '
   : isDarkMode
   ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
   : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
  }`}
  >
  <BookOpen size={16} />
  <span>{s.name}</span>
  </button>
  ))}
  </div>
 </div>

 {/* Big Start Round Button */}
 <button
  onClick={() => onStartMatch(selectedSubject, nextRoundToPlay)}
  disabled={!selectedSubject}
  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-lg flex items-center justify-center gap-3 transition-all  shadow-indigo-600 active:scale-98 text-base sm:text-lg disabled:opacity-50"
 >
  <Play size={22} fill="currentColor" />
  <span>ابدأ الجولة {nextRoundToPlay} من 4 (90 دقيقة دراسة)</span>
 </button>
 </div>

 {/* Quick Summary Widgets */}
 <div className={`p-6 rounded-xl border shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 ${
 isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
 }`}>
 <div className="flex items-center gap-3.5 p-2">
  <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
  <Clock size={22} />
  </div>
  <div>
  <span className={`text-xs font-extrabold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>وقت الدراسة اليوم</span>
  <div className={`text-lg font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
  {formatHoursMinutes(todayFocusSeconds)}
  </div>
  </div>
 </div>

 <div className="flex items-center gap-3.5 p-2">
  <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
  <Flame size={22} />
  </div>
  <div>
  <span className={`text-xs font-extrabold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الجولات المكتملة</span>
  <div className={`text-lg font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
  {todayCompletedRounds} / 4 جولات
  </div>
  </div>
 </div>

 <div className="flex items-center gap-3.5 p-2">
  <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
  <Award size={22} />
  </div>
  <div>
  <span className={`text-xs font-extrabold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>المتبقي من الهدف</span>
  <div className={`text-lg font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
  {formatHoursMinutes(Math.max(0, TARGET_FOCUS_SECONDS - todayFocusSeconds))}
  </div>
  </div>
 </div>
 </div>

 {/* Theme & Style Customization Modal */}
 {showThemeModal && (
 <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
  <div className={`w-full max-w-md rounded-xl p-6  border flex flex-col gap-6 animate-in zoom-in-95 duration-200 ${
  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
  }`}>
  <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
  <div className="flex items-center gap-2">
  <Palette className="text-indigo-600 dark:text-indigo-400" size={22} />
  <h3 className="font-black text-lg">تخصيص المظهر والألوان</h3>
  </div>
  <button
  onClick={() => setShowThemeModal(false)}
  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold bg-slate-100 dark:bg-slate-800 p-2 rounded-md"
  >
  ✕
  </button>
  </div>

  {/* Color Themes */}
  <div className="flex flex-col gap-2.5">
  <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400">سمة الألوان (Theme Color):</label>
  <div className="grid grid-cols-3 gap-2">
  {[
   { id: 'classic', name: 'كلاسيكي داكن (Classic)', color: 'bg-zinc-800' },
                  { id: 'midnight', name: 'أزرق ليلي (Midnight)', color: 'bg-indigo-900' },
                  { id: 'ocean', name: 'محيطي (Ocean)', color: 'bg-blue-600' },
                  { id: 'forest', name: 'أخضر غابة (Forest)', color: 'bg-emerald-700' },
                  { id: 'crimson', name: 'قرمزي (Crimson)', color: 'bg-rose-700' },
                  { id: 'sand', name: 'صحراوي (Sand)', color: 'bg-amber-600' },
  ].map((t) => (
   <button
   key={t.id}
   onClick={() => setColorTheme(t.id as ColorTheme)}
   className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-extrabold transition-all ${
   colorTheme === t.id
   ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950 '
   : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
   }`}
   >
   <span className={`w-3.5 h-3.5 rounded-md ${t.color}`} />
   <span className="truncate">{t.name}</span>
   </button>
  ))}
  </div>
  </div>

  {/* Timer Styles */}
  <div className="flex flex-col gap-2.5">
  <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400">شكل العداد (Timer Layout):</label>
  <div className="grid grid-cols-2 gap-2">
  {[
   { id: 'circle', name: 'حلقة دائرية ⭕', desc: 'دائرة النسبة المئوية' },
   { id: 'digital', name: 'ساعة عملاقة 📟', desc: 'أرقام كلاسيكية كبيرة' },
   { id: 'bar', name: 'شريط تقدم 📊', desc: 'شريط أفقي مبسط' },
   { id: 'stadium', name: 'لوحة الملعب 🏟️', desc: 'لوحة رقمية متطورة' },
  ].map((st) => (
   <button
   key={st.id}
   onClick={() => setTimerStyle(st.id as TimerStyle)}
   className={`p-3 rounded-lg border flex flex-col gap-1 text-right transition-all ${
   timerStyle === st.id
   ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950 '
   : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
   }`}
   >
   <span className="font-extrabold text-xs">{st.name}</span>
   <span className="text-[10px] text-slate-400">{st.desc}</span>
   </button>
  ))}
  </div>
  </div>

  <button
  onClick={() => setShowThemeModal(false)}
  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-lg text-sm transition-all shadow-lg"
  >
  حفظ وتطبيق
  </button>
  </div>
 </div>
 )}

 {/* Manage Subjects Modal */}
 {showSubjectModal && (
 <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
  <div className={`w-full max-w-md rounded-xl p-6  border flex flex-col gap-5 animate-in zoom-in-95 duration-200 ${
  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
  }`}>
  <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
  <div className="flex items-center gap-2">
  <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
  <h3 className="font-black text-lg">إدارة المواد والمحاضرات</h3>
  </div>
  <button
  onClick={() => setShowSubjectModal(false)}
  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold bg-slate-100 dark:bg-slate-800 p-2 rounded-md"
  >
  ✕
  </button>
  </div>

  {/* Add New Subject Form */}
  <form onSubmit={handleAddSubjectSubmit} className="flex gap-2">
  <input
  type="text"
  placeholder="اسم المادة أو المحاضرة..."
  value={newSubjectName}
  onChange={(e) => setNewSubjectName(e.target.value)}
  className={`flex-1 px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 ${
   isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`}
  />
  <button
  type="submit"
  disabled={!newSubjectName.trim()}
  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg transition-all disabled:opacity-50"
  >
  إضافة
  </button>
  </form>

  {/* Existing Subjects List */}
  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
  {subjects.map((sub) => (
  <div
   key={sub.id}
   className={`p-3 rounded-lg border flex items-center justify-between ${
   isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
   }`}
  >
   <span className="font-bold text-xs sm:text-sm">{sub.name}</span>
   {subjects.length > 1 && (
   <button
   onClick={() => onDeleteSubject(sub.id)}
   className="p-1.5 text-rose-500 hover:bg-rose-500 rounded-xl transition-colors"
   title="حذف المادة"
   >
   <Trash2 size={16} />
   </button>
   )}
  </div>
  ))}
  </div>

  <button
  onClick={() => setShowSubjectModal(false)}
  className="w-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-3 rounded-lg text-xs transition-all"
  >
  إغلاق
  </button>
  </div>
 </div>
 )}

 </div>
 );
}
