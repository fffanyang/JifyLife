import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Edit3, ChevronRight } from 'lucide-react';
import { getDiary, getWeekday, formatDate } from '@/services/diaryService';
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
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => goDay(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)]">
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <span className="text-[14px] font-semibold text-[var(--color-text-secondary)] min-w-[100px] text-center">{dateParam}</span>
              <button onClick={() => goDay(1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)]">
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="w-10" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-16 h-16 mb-5 rounded-2xl bg-[var(--color-brand-soft)] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[var(--color-text-muted)]">
              <path d="M4 5h14l5 5v14a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 12h10M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-[var(--color-text-secondary)] text-[15px] font-semibold mb-2">这一天还没有日记</div>
          <div className="text-[var(--color-text-hint)] text-[12px] mb-6">记录一下今天发生了什么吧</div>
          <button
            onClick={() => navigate(`/edit?date=${dateParam}`)}
            className="btn-primary px-8"
          >
            写一篇
          </button>
        </div>
      </div>
    );
  }

  const weekday = getWeekday(diary.date);
  const weatherIcon = WEATHER_OPTIONS.find(w => w.label === diary.weather)?.icon || '';

  const sections = [
    { key: 'work', label: '工作', content: diary.work, icon: '💼' },
    { key: 'study', label: '学习', content: diary.study, icon: '📖' },
    { key: 'fitness', label: '运动健康', content: diary.fitness, icon: '💪' },
    { key: 'expense', label: '生活消费', content: diary.expense, icon: '🛒' },
    { key: 'mood', label: '心情感悟', content: diary.mood, icon: '💭' },
  ];

  const dayNum = parseInt(diary.date.slice(8));
  const monthNum = parseInt(diary.date.slice(5, 7));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* 顶部导航 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => goDay(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <span className="text-[14px] font-bold text-[var(--color-text)] min-w-[100px] text-center tracking-wide">{diary.date}</span>
            <button onClick={() => goDay(1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
          <button
            onClick={() => navigate(`/edit?date=${diary.date}`)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] active:text-[var(--color-accent)] active:bg-[var(--color-accent-soft)] transition-all"
          >
            <Edit3 size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* 日记内容 */}
      <main className="max-w-lg mx-auto px-5 py-6">
        <div className="share-card animate-slide-up">
          {/* 标题区域 */}
          <div className="share-card-header">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-[var(--color-text)] tracking-wide leading-tight">
                  {monthNum}月{dayNum}日
                </h1>
                <div className="flex items-center gap-2.5 mt-2 text-[13px] text-[var(--color-text-secondary)] font-medium">
                  <span>{weekday}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-text-hint)]" />
                  <span>{weatherIcon} {diary.weather}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[var(--color-text-hint)] font-semibold tracking-[0.25em]">
                  {diary.date.slice(0, 4)}
                </div>
              </div>
            </div>
          </div>

          {/* 内容模块 */}
          <div className="share-card-body space-y-6">
            {sections.map((sec, idx) => {
              if (!sec.content?.trim()) return null;
              return (
                <section key={sec.key} className="animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center">
                      <span className="text-[12px]">{sec.icon}</span>
                    </div>
                    <h2 className="text-[12px] font-bold text-[var(--color-accent)] tracking-[0.15em] uppercase">
                      {sec.label}
                    </h2>
                  </div>
                  <div className="text-[15px] text-[var(--color-text)] leading-[1.9] whitespace-pre-wrap pl-8">
                    {sec.content}
                  </div>
                </section>
              );
            })}

            {/* 作息 */}
            {(diary.wakeUp || diary.sleep) && (
              <section className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center">
                    <span className="text-[12px]">🛏️</span>
                  </div>
                  <h2 className="text-[12px] font-bold text-[var(--color-accent)] tracking-[0.15em] uppercase">作息</h2>
                </div>
                <div className="flex items-center gap-8 pl-8">
                  {diary.wakeUp && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] text-[var(--color-text-muted)] font-semibold">起</span>
                      <span className="text-[20px] font-bold text-[var(--color-text)] tracking-wide">{diary.wakeUp}</span>
                    </div>
                  )}
                  {diary.wakeUp && diary.sleep && (
                    <div className="w-8 h-px bg-[var(--color-accent-light)]" />
                  )}
                  {diary.sleep && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] text-[var(--color-text-muted)] font-semibold">睡</span>
                      <span className="text-[20px] font-bold text-[var(--color-text)] tracking-wide">{diary.sleep}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 图片 */}
            {diary.images.length > 0 && (
              <section className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center">
                    <span className="text-[12px]">📷</span>
                  </div>
                  <h2 className="text-[12px] font-bold text-[var(--color-accent)] tracking-[0.15em] uppercase">图片</h2>
                </div>
                <div className={`grid gap-2.5 pl-8 ${
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
              </section>
            )}
          </div>

          {/* 水印 */}
          <div className="share-card-footer">
            人生日记 · {diary.date}
          </div>
        </div>
      </main>
    </div>
  );
}
