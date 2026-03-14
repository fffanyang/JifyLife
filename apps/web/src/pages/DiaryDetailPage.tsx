import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Edit3, ChevronRight, Plus } from 'lucide-react';
import { getDiary, getWeekday, formatDate, getRelativeDate } from '@/services/diaryService';
import type { DiaryEntry } from '@/types/diary';
import { WEATHER_OPTIONS } from '@/types/diary';

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date') || formatDate(new Date());

  const [diary, setDiary] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDiary(dateParam).then(d => {
      setDiary(d || null);
      setLoading(false);
    });
  }, [dateParam]);

  const goDay = (offset: number) => {
    const d = new Date(dateParam + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    navigate(`/diary?date=${formatDate(d)}`, { replace: true });
  };

  const relative = getRelativeDate(dateParam);
  const weekday = getWeekday(dateParam);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-hint)] text-[13px] font-medium animate-[gentlePulse_1.5s_ease-in-out_infinite]">加载中…</div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
        <header className="glass-header sticky top-0 z-30">
          <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-14">
            <button onClick={() => navigate('/')} className="header-icon-btn">
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => goDay(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)]">
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <div className="text-center min-w-[100px]">
                <div className="text-[14px] font-bold text-[var(--color-text)] tracking-wide">{relative}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] font-medium -mt-0.5">{dateParam.slice(5)} {weekday}</div>
              </div>
              <button onClick={() => goDay(1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)]">
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="w-[38px]" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-[var(--color-text-muted)] text-[14px] font-medium mb-6">这一天还没有日记</div>
          <button
            onClick={() => navigate(`/edit?date=${dateParam}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-button)] bg-[var(--color-brand)] text-white text-[13px] font-bold tracking-wide active:scale-[0.97] transition-transform"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>写一篇</span>
          </button>
        </div>
      </div>
    );
  }

  const weatherIcon = WEATHER_OPTIONS.find(w => w.label === diary.weather)?.icon || '';

  const sections = [
    { key: 'events', label: '今日事', content: diary.events },
    { key: 'food', label: '吃喝', content: diary.food },
    { key: 'ideas', label: '灵感', content: diary.ideas },
    { key: 'reading', label: '读了什么', content: diary.reading },
    { key: 'work', label: '工作', content: diary.work },
    { key: 'mood', label: '心情', content: diary.mood },
  ];

  const filledSections = sections.filter(s => s.content?.trim());

  // 日期显示：03/14 周六
  const dateDisplay = diary.date.slice(5).replace('-', '/');
  // 年份
  const year = diary.date.slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* 极简顶部导航 — 只有返回和编辑 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-12">
          <button onClick={() => navigate('/')} className="header-icon-btn">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => goDay(-1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
            <span className="text-[12px] text-[var(--color-text-muted)] font-medium tracking-wider min-w-[60px] text-center">
              {dateDisplay}
            </span>
            <button onClick={() => goDay(1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
          <button
            onClick={() => navigate(`/edit?date=${diary.date}`)}
            className="header-icon-btn"
          >
            <Edit3 size={17} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* 日记正文 — 一张纸的感觉 */}
      <main className="max-w-lg mx-auto px-7 pt-8 pb-16 animate-fade-in">
        {/* 日期大标题区 */}
        <div className="mb-10">
          <div className="text-[28px] font-bold text-[var(--color-text)] leading-tight tracking-tight">
            {relative}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[13px] text-[var(--color-text-hint)] font-medium tracking-wider">
              {year}.{dateDisplay} {weekday}
            </span>
            {weatherIcon && (
              <>
                <span className="text-[var(--color-text-hint)]">·</span>
                <span className="text-[13px] text-[var(--color-text-hint)] font-medium">{weatherIcon} {diary.weather}</span>
              </>
            )}
            {(diary.wakeUp || diary.sleep) && (
              <>
                <span className="text-[var(--color-text-hint)]">·</span>
                <span className="text-[13px] text-[var(--color-text-hint)] font-medium">
                  {diary.wakeUp && `${diary.wakeUp} 起`}{diary.wakeUp && diary.sleep && ' '}{diary.sleep && `${diary.sleep} 睡`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 内容区 — 散文式排版，无卡片 */}
        <div className="space-y-8">
          {filledSections.map((sec) => (
            <div key={sec.key}>
              <div className="text-[11px] text-[var(--color-accent)] font-semibold tracking-[0.15em] uppercase mb-2.5">
                {sec.label}
              </div>
              <div className="text-[15px] text-[var(--color-text-secondary)] leading-[2] whitespace-pre-wrap">
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        {/* 图片 — 无边框，直接展示 */}
        {diary.images.length > 0 && (
          <div className="mt-10">
            <div className={`grid gap-3 ${
              diary.images.length === 1 ? 'grid-cols-1 max-w-[280px]' :
              diary.images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {diary.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-card)]">
                  <img
                    src={img}
                    alt={`图片 ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center text-[11px] text-[var(--color-text-hint)] bg-[var(--color-bg)]">图片已删除</div>';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部留白分割线 */}
        <div className="mt-16 flex justify-center">
          <div className="w-8 h-[2px] rounded-full bg-[var(--color-text-hint)] opacity-30" />
        </div>
      </main>
    </div>
  );
}
