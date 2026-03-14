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
        <div className="text-[var(--color-text-muted)] text-[13px]">加载中…</div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
        <header className="glass-header sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 h-13">
            <button onClick={() => navigate('/')} className="p-2 text-[var(--color-text-secondary)]">
              <ChevronLeft size={22} />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => goDay(-1)} className="p-1.5 text-[var(--color-text-muted)]">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[14px] font-medium text-[var(--color-text-secondary)]">{dateParam}</span>
              <button onClick={() => goDay(1)} className="p-1.5 text-[var(--color-text-muted)]">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="w-9" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="mb-5 opacity-20">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <path d="M10 10h28l8 8v28a4 4 0 01-4 4H14a4 4 0 01-4-4V14a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M20 24h16M20 32h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-[var(--color-text-muted)] text-[14px] mb-4">这一天还没有日记</div>
          <button
            onClick={() => navigate(`/edit?date=${dateParam}`)}
            className="px-6 py-2.5 bg-[var(--color-brand)] text-white text-[13px] rounded-xl font-semibold active:scale-95 transition-transform"
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

  // 从日期中提取月份和日期
  const dayNum = parseInt(diary.date.slice(8));
  const monthNum = parseInt(diary.date.slice(5, 7));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* 顶部导航 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-13">
          <button onClick={() => navigate('/')} className="p-2 text-[var(--color-text-secondary)] active:text-[var(--color-text)] -ml-1">
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-1.5">
            <button onClick={() => goDay(-1)} className="p-1.5 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[14px] font-medium text-[var(--color-text)]">{diary.date}</span>
            <button onClick={() => goDay(1)} className="p-1.5 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => navigate(`/edit?date=${diary.date}`)}
            className="p-2 text-[var(--color-text-secondary)] active:text-[var(--color-text)]"
          >
            <Edit3 size={18} />
          </button>
        </div>
      </header>

      {/* 日记内容 — 截图分享风格 */}
      <main className="max-w-lg mx-auto px-5 py-5">
        <div className="share-card animate-slide-up">
          {/* 日记标题区域 */}
          <div className="share-card-header">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-wide leading-tight">
                  {monthNum}月{dayNum}日
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-[13px] text-[var(--color-text-secondary)]">
                  <span>{weekday}</span>
                  <span className="text-[var(--color-text-muted)]">·</span>
                  <span>{weatherIcon} {diary.weather}</span>
                </div>
              </div>
              {/* 装饰性年份 */}
              <div className="text-right opacity-20">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium tracking-widest">
                  {diary.date.slice(0, 4)}
                </div>
              </div>
            </div>
          </div>

          {/* 内容模块 */}
          <div className="share-card-body space-y-5">
            {sections.map((sec, idx) => {
              if (!sec.content?.trim()) return null;
              return (
                <section key={sec.key} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[13px]">{sec.icon}</span>
                    <h2 className="text-[12px] font-semibold text-[var(--color-accent)] tracking-wider uppercase">
                      {sec.label}
                    </h2>
                  </div>
                  <div className="text-[15px] text-[var(--color-text)] leading-[1.8] whitespace-pre-wrap pl-0.5">
                    {sec.content}
                  </div>
                </section>
              );
            })}

            {/* 作息 */}
            {(diary.wakeUp || diary.sleep) && (
              <section className="animate-fade-in">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[13px]">🛏️</span>
                  <h2 className="text-[12px] font-semibold text-[var(--color-accent)] tracking-wider uppercase">作息</h2>
                </div>
                <div className="flex items-center gap-6 text-[15px] text-[var(--color-text)]">
                  {diary.wakeUp && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[12px] text-[var(--color-text-muted)]">起</span>
                      <span className="font-semibold text-[17px]">{diary.wakeUp}</span>
                    </div>
                  )}
                  {diary.wakeUp && diary.sleep && (
                    <div className="w-6 h-px bg-[var(--color-accent-light)]" />
                  )}
                  {diary.sleep && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[12px] text-[var(--color-text-muted)]">睡</span>
                      <span className="font-semibold text-[17px]">{diary.sleep}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 图片 */}
            {diary.images.length > 0 && (
              <section className="animate-fade-in">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[13px]">📷</span>
                  <h2 className="text-[12px] font-semibold text-[var(--color-accent)] tracking-wider uppercase">图片</h2>
                </div>
                <div className={`grid gap-2 ${
                  diary.images.length === 1 ? 'grid-cols-1' :
                  diary.images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                  {diary.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--color-bg)]">
                      <img
                        src={img}
                        alt={`图片 ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg)]">图片已删除</div>';
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
