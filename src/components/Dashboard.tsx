import React, { useState } from 'react';
import { Subject } from '../types';
import { Play, Sunrise, BookOpen, Clock, Settings, Bot } from 'lucide-react';

interface DashboardProps {
  subjects: Subject[];
  onStartPyramid: (subjectId: string) => void;
  onStartDawnReview: () => void;
  todayFocusSeconds: number;
}

const TEN_HOURS_SEC = 10 * 60 * 60;

export default function Dashboard({ subjects, onStartPyramid, onStartDawnReview, todayFocusSeconds }: DashboardProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '');
  
  const progressPercent = Math.min((todayFocusSeconds / TEN_HOURS_SEC) * 100, 100);
  const hoursCompleted = (todayFocusSeconds / 3600).toFixed(1);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 p-6 animate-in fade-in duration-500">
      
      {/* Header & Progress */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">مرحباً بك</h1>
            <p className="text-gray-500 mt-1">التقدم اليومي (الهدف: 10 ساعات)</p>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {hoursCompleted} / 10 <span className="text-sm text-gray-500 font-normal">ساعات</span>
          </div>
        </div>
        
        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dawn Review Action */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-sm">
            <Sunrise size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">مراجعة الفجر</h3>
            <p className="text-gray-600 text-sm">60 دقيقة لمراجعة ما تم دراسته بالأمس</p>
          </div>
        </div>
        <button 
          onClick={onStartDawnReview}
          className="bg-white text-blue-600 font-bold px-6 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
        >
          بدء
        </button>
      </div>

      {/* Main Pyramid Action */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 opacity-5">
          <BookOpen size={200} />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الجلسة الهرمية</h2>
          <p className="text-gray-500 mt-1">90 دقيقة: 3 دورات (25د تركيز + 5د استرجاع)</p>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <label className="text-sm font-semibold text-gray-700">اختر المادة:</label>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl border transition-all font-semibold ${
                  selectedSubject === s.id 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onStartPyramid(selectedSubject)}
          disabled={!selectedSubject}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <Play size={20} fill="currentColor" />
          ابدأ الهرم الآن
        </button>
      </div>
      
      {/* AI Assistant Note (Easter egg for the second part of prompt) */}
      <div className="flex items-center gap-3 text-sm text-gray-400 justify-center mt-4">
        <Bot size={16} />
        <p>مساعدك الآلي جاهز لمرافقتك في رحلة التركيز.</p>
      </div>

    </div>
  );
}
