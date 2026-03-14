import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, BarChart3, Settings, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDiaryStore } from '@/stores/diaryStore';
import { getDiary, formatDate, getWeekday } from '@/services/diaryService';
import type { DiaryEntry } from '@/types/diary';
import { WEATHER_OPTIONS } from '@/types/diary';

const WEEKDAY_SHORT = ['一', '二', '三', '四', '五', '六', '日'];

export default function HomePage() {
  const navigate = useNavigate();
  const { recentDates, refreshRecentDates } = useDiaryStore();
  const [diaryMap, setDiaryMap] = useState<Record<string, DiaryEntry>>({});
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  useEffect(() => {
    refreshRecentDates();
  }, [refreshRecentDates]);

  useEffect(() => {
    if (recentDates.length === 0) {
      setDiaryMap({});
      setLoading(false);
      return;
    }
    Promise.all(recentDates.map(d => getDiary(d))).then(results => {
      const map: Record<string, DiaryEntry> = {};
      results.forEach(r => { if (r) map[r.date] = r; });
      setDiaryMap(map);
      setLoading(false);
    });
  }, [recentDates]);

  const today = formatDate(new Date());
  const selectedDiary = diaryMap[selectedDate];

  const calendarDays = useMemo(() => {
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDayOfWeek = firstDay.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7;

    const days: { date: string; day: number; inMonth: boolean; isToday: boolean }[] = [];

    for (let i = 1; i < startDayOfWeek; i++) {
      const d = new Date(year, month, 1 - (startDayOfWeek - i));
      days.push({ date: formatDate(d), day: d.getDate(), inMonth: false, isToday: false });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = formatDate(new Date(year, month, d));
      days.push({ date, day: d, inMonth: true, isToday: date === today });
    }

    while (days.length % 7 !== 0) {
      const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() - startDayOfWeek + 2);
      days.push({ date: formatDate(nextDate), day: nextDate.getDate(), inMonth: false, isToday: false });
    }

    return days;
  }, [calMonth, today]);

  const changeMonth = (offset: number) => {
    setCalMonth(prev => {
      const d = new Date(prev.year, prev.month + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthLabel = `${calMonth.year}年${calMonth.month + 1}月`;

  const monthDiaryCount = useMemo(() => {
    const prefix = `${calMonth.year}-${(calMonth.month + 1).toString().padStart(2, '0')}`;
    return recentDates.filter(d => d.startsWith(prefix)).length;
  }, [calMonth, recentDates]);

  const recentDiaries = useMemo(() => {
    return recentDates.slice(0, 5).map(d => diaryMap[d]).filter(Boolean);
  }, [recentDates, diaryMap]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* 顶部标题栏 — 左回顾 右设置 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-5 pt-safe-top">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate('/review')}
              className="header-icon-btn"
              aria-label="回顾"
            >
              <BarChart3 size={20} strokeWidth={1.6} />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-[16px] font-bold text-[var(--color-text)] tracking-[0.12em]">
                人生日记
              </h1>
              <span className="text-[10px] text-[var(--color-text-hint)] font-medium tracking-[0.2em] -mt-0.5">
                JIFYLIFE
              </span>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="header-icon-btn"
              aria-label="设置"
            >
              <Settings size={20} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-5 py-6 space-y-5">

          {/* 日历卡片 */}
          <div className="card p-6 animate-slide-up">
            {/* 月份导航 */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => changeMonth(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <div className="text-center">
                <div className="text-[16px] font-bold text-[var(--color-text)] tracking-wider">{monthLabel}</div>
                {monthDiaryCount > 0 && (
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-1 font-medium">
                    已记录 {monthDiaryCount} 天
                  </div>
                )}
              </div>
              <button onClick={() => changeMonth(1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="calendar-grid mb-2">
              {WEEKDAY_SHORT.map(w => (
                <div key={w} className="text-center text-[11px] text-[var(--color-text-hint)] font-semibold py-1.5 tracking-wider">
                  {w}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="calendar-grid">
              {calendarDays.map((d, i) => {
                const hasDiary = !!diaryMap[d.date];
                const isSelected = d.date === selectedDate;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d.date)}
                    className={`calendar-day ${
                      !d.inMonth ? 'text-[var(--color-text-hint)] opacity-30' : 'text-[var(--color-text-secondary)]'
                    } ${d.isToday ? 'calendar-day-today' : ''} ${
                      hasDiary && d.inMonth ? 'calendar-day-has-diary' : ''
                    } ${isSelected ? 'calendar-day-selected' : ''}`}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 选中日期的日记预览（点击日历有日记的日期时展示） */}
          {selectedDiary && (
            <div className="animate-scale-in">
              <DiaryCard
                diary={selectedDiary}
                isToday={selectedDiary.date === today}
                onClick={() => navigate(`/diary?date=${selectedDiary.date}`)}
              />
            </div>
          )}

          {/* 最近日记列表 */}
          {!loading && recentDiaries.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '120ms' }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-[13px] font-bold text-[var(--color-text-secondary)] tracking-[0.1em]">
                  最近记录
                </h2>
                <span className="text-[11px] text-[var(--color-text-hint)] font-medium">
                  共 {recentDates.length} 篇
                </span>
              </div>
              <div className="space-y-3">
                {recentDiaries.map(diary => (
                  <DiaryCard
                    key={diary.date}
                    diary={diary}
                    isToday={diary.date === today}
                    onClick={() => navigate(`/diary?date=${diary.date}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 右下角浮动操作按钮 */}
      {(() => {
        const hasDiary = !!selectedDiary;
        if (hasDiary) {
          return (
            <button
              key={`fab-view-${selectedDate}`}
              onClick={() => navigate(`/diary?date=${selectedDate}`)}
              className="home-fab home-fab-view"
              aria-label="查看日记"
            >
              <Eye size={22} strokeWidth={1.8} />
            </button>
          );
        } else {
          return (
            <button
              key={`fab-edit-${selectedDate}`}
              onClick={() => navigate(`/edit?date=${selectedDate}`)}
              className="home-fab"
              aria-label="记录日记"
            >
              <Plus size={26} strokeWidth={2.2} />
            </button>
          );
        }
      })()}
    </div>
  );
}

/** 日记预览卡片 */
function DiaryCard({ diary, isToday, onClick }: { diary: DiaryEntry; isToday: boolean; onClick: () => void }) {
  const weatherIcon = WEATHER_OPTIONS.find(w => w.label === diary.weather)?.icon || '';
  const weekday = getWeekday(diary.date);

  const parts: string[] = [];
  if (diary.events?.trim()) parts.push(diary.events.trim().split(/[,，、\n]/)[0]);
  if (diary.ideas?.trim()) parts.push(diary.ideas.trim().split(/[,，、\n]/)[0]);
  if (diary.food?.trim()) parts.push(diary.food.trim().split(/[,，、\n]/)[0]);
  const summary = parts.join(' · ') || '日记已保存';

  let filledCount = 0;
  if (diary.events?.trim()) filledCount++;
  if (diary.food?.trim()) filledCount++;
  if (diary.ideas?.trim()) filledCount++;
  if (diary.reading?.trim()) filledCount++;
  if (diary.work?.trim()) filledCount++;
  if (diary.mood?.trim()) filledCount++;
  if (diary.wakeUp || diary.sleep) filledCount++;

  return (
    <button
      onClick={onClick}
      className="card w-full p-5 text-left active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[14px] font-bold text-[var(--color-text)]">
              {isToday ? '今天' : diary.date.slice(5).replace('-', '/')}
            </span>
            <span className="text-[12px] text-[var(--color-text-muted)] font-medium">{weekday}</span>
            {weatherIcon && <span className="text-[13px]">{weatherIcon}</span>}
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2 mb-2">
            {summary}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-hint)] font-medium">
            <span className="bg-[var(--color-bg)] px-2 py-0.5 rounded-md">{filledCount}/7</span>
            {diary.wakeUp && diary.sleep && (
              <span>{diary.wakeUp} 起 · {diary.sleep} 睡</span>
            )}
            {diary.images.length > 0 && (
              <span>{diary.images.length} 图</span>
            )}
          </div>
        </div>
        {/* 日期装饰 */}
        <div className="flex-shrink-0 w-12 h-12 rounded-[14px] bg-[var(--color-bg)] flex flex-col items-center justify-center">
          <span className="text-[18px] font-bold text-[var(--color-accent)] leading-none">
            {parseInt(diary.date.slice(8))}
          </span>
          <span className="text-[9px] text-[var(--color-text-hint)] font-semibold mt-0.5">
            {parseInt(diary.date.slice(5, 7))}月
          </span>
        </div>
      </div>
    </button>
  );
}
