import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // 加载所有日记缓存
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
  const todayDiary = diaryMap[today];
  const selectedDiary = diaryMap[selectedDate];

  // 日历数据
  const calendarDays = useMemo(() => {
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // 周一开始
    let startDayOfWeek = firstDay.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7;

    const days: { date: string; day: number; inMonth: boolean; isToday: boolean }[] = [];

    // 前置空白
    for (let i = 1; i < startDayOfWeek; i++) {
      const d = new Date(year, month, 1 - (startDayOfWeek - i));
      days.push({
        date: formatDate(d),
        day: d.getDate(),
        inMonth: false,
        isToday: false,
      });
    }

    // 当月
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = formatDate(new Date(year, month, d));
      days.push({
        date,
        day: d,
        inMonth: true,
        isToday: date === today,
      });
    }

    // 补齐到 7 的倍数
    while (days.length % 7 !== 0) {
      const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() - startDayOfWeek + 2);
      days.push({
        date: formatDate(nextDate),
        day: nextDate.getDate(),
        inMonth: false,
        isToday: false,
      });
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

  // 当月记录天数
  const monthDiaryCount = useMemo(() => {
    const prefix = `${calMonth.year}-${(calMonth.month + 1).toString().padStart(2, '0')}`;
    return recentDates.filter(d => d.startsWith(prefix)).length;
  }, [calMonth, recentDates]);

  // 最近5条日记
  const recentDiaries = useMemo(() => {
    return recentDates.slice(0, 5).map(d => diaryMap[d]).filter(Boolean);
  }, [recentDates, diaryMap]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* 顶部标题栏 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-5 pt-safe-top">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-[var(--color-text)] tracking-wider">
              人生日记
            </h1>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => navigate('/review')}
                className="p-2.5 text-[var(--color-text-muted)] active:text-[var(--color-text)] rounded-xl transition-colors"
                title="回顾"
              >
                <BarChart3 size={19} />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2.5 text-[var(--color-text-muted)] active:text-[var(--color-text)] rounded-xl transition-colors"
                title="设置"
              >
                <Settings size={19} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-5 py-5 space-y-5">

          {/* 日历卡片 */}
          <div className="card p-5 animate-slide-up">
            {/* 月份导航 */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <div className="text-[15px] font-semibold text-[var(--color-text)]">{monthLabel}</div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  已记录 {monthDiaryCount} 天
                </div>
              </div>
              <button onClick={() => changeMonth(1)} className="p-1 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="calendar-grid mb-1">
              {WEEKDAY_SHORT.map(w => (
                <div key={w} className="text-center text-[11px] text-[var(--color-text-muted)] font-medium py-1">
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
                      !d.inMonth ? 'text-[var(--color-text-muted)] opacity-30' : 'text-[var(--color-text-secondary)]'
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

          {/* 选中日期的概览 */}
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[15px] font-semibold text-[var(--color-text)]">
                  {selectedDate === today ? '今天' : selectedDate.slice(5).replace('-', '月') + '日'}
                </div>
                <div className="text-[12px] text-[var(--color-text-muted)]">
                  {getWeekday(selectedDate)}
                  {selectedDiary && (
                    <span> · {WEATHER_OPTIONS.find(w => w.label === selectedDiary.weather)?.icon} {selectedDiary.weather}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => selectedDiary
                  ? navigate(`/diary?date=${selectedDate}`)
                  : navigate(`/edit?date=${selectedDate}`)
                }
                className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all active:scale-95 ${
                  selectedDiary
                    ? 'bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-accent)]'
                    : 'bg-[var(--color-brand)] text-white'
                }`}
              >
                {selectedDiary ? '查看' : '记录'}
              </button>
            </div>

            {selectedDiary ? (
              <div className="space-y-2">
                {/* 模块指示器 */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'work', label: '工作', filled: !!selectedDiary.work.trim() },
                    { key: 'study', label: '学习', filled: !!selectedDiary.study.trim() },
                    { key: 'fitness', label: '运动', filled: !!selectedDiary.fitness.trim() },
                    { key: 'expense', label: '消费', filled: !!selectedDiary.expense.trim() },
                    { key: 'mood', label: '心情', filled: !!selectedDiary.mood.trim() },
                    { key: 'sleep', label: '作息', filled: !!(selectedDiary.wakeUp || selectedDiary.sleep) },
                  ].map(m => (
                    <span
                      key={m.key}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        m.filled
                          ? 'bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-accent)]'
                          : 'bg-gray-100 text-[var(--color-text-muted)]'
                      }`}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
                {/* 摘要 */}
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                  {[selectedDiary.work, selectedDiary.study, selectedDiary.expense]
                    .filter(s => s?.trim())
                    .map(s => s.split(/[,，、\n]/)[0].trim())
                    .join(' · ') || '日记已保存'}
                </p>
                {/* 作息摘要 */}
                {(selectedDiary.wakeUp || selectedDiary.sleep) && (
                  <div className="text-[12px] text-[var(--color-text-muted)]">
                    {selectedDiary.wakeUp && `${selectedDiary.wakeUp} 起`}
                    {selectedDiary.wakeUp && selectedDiary.sleep && ' · '}
                    {selectedDiary.sleep && `${selectedDiary.sleep} 睡`}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--color-text-muted)] italic">
                这一天还没有记录，点击右上角开始
              </p>
            )}
          </div>

          {/* 最近日记 */}
          {!loading && recentDiaries.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] tracking-wider">
                  最近记录
                </h2>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  共 {recentDates.length} 篇
                </span>
              </div>
              <div className="space-y-2.5">
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

          {/* 空状态 */}
          {!loading && recentDiaries.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-4xl mb-3 opacity-20">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto opacity-30">
                  <path d="M8 8h24l8 8v24a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-[var(--color-text-muted)] text-[13px] mb-1">尚无日记</div>
              <div className="text-[var(--color-text-muted)] text-[12px] opacity-60">
                点击日历中的日期开始记录
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 悬浮写日记按钮 */}
      <div className="fixed bottom-6 right-5 z-20">
        <button
          onClick={() => navigate(`/edit?date=${today}`)}
          className="w-14 h-14 bg-[var(--color-brand)] text-white rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ boxShadow: '0 6px 20px rgba(44,37,32,0.25)' }}
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/** 日记预览卡片 */
function DiaryCard({ diary, isToday, onClick }: { diary: DiaryEntry; isToday: boolean; onClick: () => void }) {
  const weatherIcon = WEATHER_OPTIONS.find(w => w.label === diary.weather)?.icon || '';
  const weekday = getWeekday(diary.date);

  // 摘要
  const parts: string[] = [];
  if (diary.work.trim()) parts.push(diary.work.trim().split(/[,，、\n]/)[0]);
  if (diary.study.trim()) parts.push(diary.study.trim().split(/[,，、\n]/)[0]);
  if (diary.expense.trim()) parts.push(diary.expense.trim().split(/[,，、\n]/)[0]);
  const summary = parts.join(' · ') || '日记已保存';

  // 填写模块数
  let filledCount = 0;
  if (diary.work.trim()) filledCount++;
  if (diary.study.trim()) filledCount++;
  if (diary.fitness.trim()) filledCount++;
  if (diary.expense.trim()) filledCount++;
  if (diary.mood.trim()) filledCount++;
  if (diary.wakeUp || diary.sleep) filledCount++;

  return (
    <button
      onClick={onClick}
      className="card w-full p-4 text-left active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[14px] font-semibold text-[var(--color-text)]">
              {isToday ? '今天' : diary.date.slice(5).replace('-', '/')}
            </span>
            <span className="text-[12px] text-[var(--color-text-muted)]">{weekday}</span>
            {weatherIcon && <span className="text-[12px]">{weatherIcon}</span>}
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2 mb-1.5">
            {summary}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
            <span>{filledCount}/6 模块</span>
            {diary.wakeUp && diary.sleep && (
              <span>{diary.wakeUp} 起 · {diary.sleep} 睡</span>
            )}
            {diary.images.length > 0 && (
              <span>{diary.images.length} 图</span>
            )}
          </div>
        </div>
        {/* 右侧日期数字装饰 */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center">
          <span className="text-[16px] font-bold text-[var(--color-accent)]">
            {parseInt(diary.date.slice(8))}
          </span>
        </div>
      </div>
    </button>
  );
}
