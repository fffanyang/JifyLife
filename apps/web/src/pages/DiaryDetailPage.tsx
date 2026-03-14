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
    { key: 'events', label: '今日事', content: diary.events, icon: '📝' },
    { key: 'food', label: '吃喝', content: diary.food, icon: '🍽️' },
    { key: 'ideas', label: '灵感', content: diary.ideas, icon: '💡' },
    { key: 'reading', label: '读了什么', content: diary.reading, icon: '📖' },
    { key: 'work', label: '工作', content: diary.work, icon: '💼' },
    { key: 'mood', label: '心情', content: diary.mood, icon: '🌙' },
  ];

  const filledSections = sections.filter(s => s.content?.trim());

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* 顶部导航 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-14">
          <button onClick={() => navigate('/')} className="header-icon-btn">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => goDay(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <div className="text-center min-w-[100px]">
              <div className="text-[14px] font-bold text-[var(--color-text)] tracking-wide">{relative}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-medium -mt-0.5">{diary.date.slice(5)} {weekday}</div>
            </div>
            <button onClick={() => goDay(1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
          <button
            onClick={() => navigate(`/edit?date=${diary.date}`)}
            className="header-icon-btn"
          >
            <Edit3 size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* 日记内容 */}
      <main className="max-w-lg mx-auto px-5 py-6 space-y-4">
        {/* 日期和天气概览 */}
        <div className="flex items-center gap-2.5 px-1 animate-fade-in">
          <span className="text-[13px] text-[var(--color-text-muted)] font-medium">{weatherIcon} {diary.weather}</span>
          {(diary.wakeUp || diary.sleep) && (
            <>
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-hint)]" />
              <span className="text-[13px] text-[var(--color-text-muted)] font-medium">
                {diary.wakeUp && `${diary.wakeUp} 起`}{diary.wakeUp && diary.sleep && ' · '}{diary.sleep && `${diary.sleep} 睡`}
              </span>
            </>
          )}
        </div>

        {/* 内容模块 — 每个模块一张卡片 */}
        {filledSections.map((sec, idx) => (
          <div key={sec.key} className="card p-5 animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
                <span className="text-[13px]">{sec.icon}</span>
              </div>
              <h2 className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">{sec.label}</h2>
            </div>
            <div className="text-[14px] text-[var(--color-text-secondary)] leading-[1.9] whitespace-pre-wrap">
              {sec.content}
            </div>
          </div>
        ))}

        {/* 图片 */}
        {diary.images.length > 0 && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: `${filledSections.length * 60 + 60}ms` }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
                <span className="text-[13px]">📷</span>
              </div>
              <h2 className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">图片</h2>
            </div>
            <div className={`grid gap-2.5 ${
              diary.images.length === 1 ? 'grid-cols-1 max-w-[240px]' :
              diary.images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {diary.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-[14px] overflow-hidden bg-[var(--color-bg)]">
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
      </main>
    </div>
  );
}
