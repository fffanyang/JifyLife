import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateReview } from '@/services/diaryService';
import type { ReviewData, ReviewPeriod } from '@/types/diary';

const PERIOD_LABELS: Record<ReviewPeriod, string> = {
  week: '周',
  month: '月',
  year: '年',
};

export default function ReviewPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ReviewPeriod>('week');
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refDate, setRefDate] = useState(new Date());
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    generateReview(period, refDate).then(data => {
      setReview(data);
      setLoading(false);
    });
  }, [period, refDate]);

  const navigatePeriod = (offset: number) => {
    const d = new Date(refDate);
    switch (period) {
      case 'week': d.setDate(d.getDate() + offset * 7); break;
      case 'month': d.setMonth(d.getMonth() + offset); break;
      case 'year': d.setFullYear(d.getFullYear() + offset); break;
    }
    setRefDate(d);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* 顶部导航 — 返回 + 周期切换 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-14">
          <button onClick={() => navigate('/')} className="header-icon-btn">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-1">
            {(['week', 'month', 'year'] as ReviewPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setRefDate(new Date()); }}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 tracking-wide ${
                  period === p
                    ? 'bg-[var(--color-brand)] text-white'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <div className="w-[38px]" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-4">
        {/* 时间段导航 */}
        <div className="flex items-center justify-between px-1 animate-fade-in">
          <button onClick={() => navigatePeriod(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <div className="text-center">
            <div className="text-[15px] font-bold text-[var(--color-text)] tracking-wide">
              {review?.title || ''}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
              {review ? (review.diaryCount > 0 ? `${review.dateRange} · ${review.diaryCount} 天` : review.dateRange) : ''}
            </div>
          </div>
          <button onClick={() => navigatePeriod(1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-[var(--color-text-hint)] text-[13px] font-medium animate-[gentlePulse_1.5s_ease-in-out_infinite]">加载中…</div>
          </div>
        ) : review && review.diaryCount > 0 ? (
          <div ref={cardRef} className="space-y-4 animate-slide-up">
            {/* 作息统计 */}
            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <span className="text-[13px]">🌙</span>
                </div>
                <h3 className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">作息</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="平均起床" value={review.sleepStats.avgWakeUp} icon="☀️" />
                <StatCard label="平均入睡" value={review.sleepStats.avgSleep} icon="🌙" />
                <StatCard label="平均睡眠" value={review.sleepStats.avgDuration} icon="💤" />
                <StatCard
                  label="最晚熬夜"
                  value={review.sleepStats.latestSleep.time}
                  sub={review.sleepStats.latestSleep.date ? review.sleepStats.latestSleep.date.slice(5) : ''}
                  icon="🦉"
                />
              </div>
            </div>

            {/* 记录统计 */}
            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <span className="text-[13px]">📊</span>
                </div>
                <h3 className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">记录统计</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <CountCard label="今日事" value={review.taskStats.totalEvents} color="#9C7B56" />
                <CountCard label="吃喝" value={review.taskStats.totalFood} color="#D4915E" />
                <CountCard label="灵感" value={review.taskStats.totalIdeas} color="#C4A35A" />
                <CountCard label="阅读" value={review.taskStats.totalReading} color="#5E9E6E" />
                <CountCard label="工作" value={review.taskStats.totalWork} color="#A0856E" />
                <CountCard label="心情" value={review.taskStats.totalMood} color="#6B8EBE" />
              </div>
            </div>

            {/* 吃喝高频 */}
            {review.lifeStats.topItems.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
                    <span className="text-[13px]">✨</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">吃喝高频</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.lifeStats.topItems.map((item, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 bg-[var(--color-bg)] text-[var(--color-text-secondary)] text-[12px] rounded-full font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 总结 */}
            <div className="px-2 py-4 text-center">
              <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed italic">
                「{review.summary}」
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-[var(--color-text-hint)] text-[13px] font-medium">暂无数据</div>
        )}
      </main>
    </div>
  );
}

/** 统计卡片 — 作息 */
function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="bg-[var(--color-bg)] rounded-[16px] p-4 border border-[rgba(26,22,20,0.03)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[var(--color-text-muted)] font-semibold tracking-wide">{label}</span>
        <span className="text-[13px]">{icon}</span>
      </div>
      <div className="text-[20px] font-bold text-[var(--color-text)] leading-tight tracking-wide">{value}</div>
      {sub && <div className="text-[10px] text-[var(--color-text-hint)] mt-1.5 font-medium">{sub}</div>}
    </div>
  );
}

/** 计数卡片 — 事务 */
function CountCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--color-bg)] rounded-[16px] p-4 text-center border border-[rgba(26,22,20,0.03)]">
      <div className="text-[26px] font-bold leading-tight tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] text-[var(--color-text-muted)] mt-1.5 font-semibold tracking-wider">{label}</div>
    </div>
  );
}
