import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateReview } from '@/services/diaryService';
import type { ReviewData, ReviewPeriod } from '@/types/diary';

const PERIOD_LABELS: Record<ReviewPeriod, string> = {
  week: '周回顾',
  month: '月回顾',
  year: '年回顾',
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
      {/* 顶部 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <div className="text-[15px] font-bold text-[var(--color-text)] tracking-wider">回顾</div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6">
        {/* 周期切换 */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          {(['week', 'month', 'year'] as ReviewPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setRefDate(new Date()); }}
              className={`pill transition-all active:scale-95 ${
                period === p ? 'pill-active' : 'pill-inactive'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* 时间段导航 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => navigatePeriod(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <span className="text-[12px] text-[var(--color-text-secondary)] font-medium min-w-[180px] text-center tracking-wide">
            {review?.dateRange || ''}
          </span>
          <button onClick={() => navigatePeriod(1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-[var(--color-text-hint)] text-[13px] font-medium animate-[gentlePulse_1.5s_ease-in-out_infinite]">加载中…</div>
          </div>
        ) : review ? (
          <div ref={cardRef} className="share-card animate-scale-in">
            {/* 卡片标题 */}
            <div className="share-card-header">
              <h2 className="text-[22px] font-bold text-[var(--color-text)] tracking-wide leading-tight">
                {review.title}
              </h2>
              <div className="text-[12px] text-[var(--color-text-muted)] mt-2 font-medium">
                {review.diaryCount > 0 ? `共记录 ${review.diaryCount} 天` : '暂无日记记录'}
              </div>
            </div>

            <div className="share-card-body space-y-7">
              {/* 作息统计 */}
              <ReviewSection icon="🌙" title="作息">
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
              </ReviewSection>

              <div className="divider" />

              {/* 事务统计 */}
              <ReviewSection icon="📊" title="记录统计">
                <div className="grid grid-cols-3 gap-3">
                  <CountCard label="工作" value={review.taskStats.totalWork} color="#9C7B56" />
                  <CountCard label="学习" value={review.taskStats.totalStudy} color="#5E9E6E" />
                  <CountCard label="运动" value={review.taskStats.totalFitness} color="#6B8EBE" />
                  <CountCard label="消费" value={review.taskStats.totalExpense} color="#C17A5A" />
                  <CountCard label="心情" value={review.taskStats.totalMood} color="#A0856E" />
                </div>
              </ReviewSection>

              {/* 消费高频 */}
              {review.lifeStats.topItems.length > 0 && (
                <>
                  <div className="divider" />
                  <ReviewSection icon="✨" title="消费高频">
                    <div className="flex flex-wrap gap-2.5">
                      {review.lifeStats.topItems.map((item, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-secondary)] text-[12px] rounded-full font-semibold border border-[rgba(26,22,20,0.05)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </ReviewSection>
                </>
              )}

              <div className="divider" />

              {/* 一句话总结 */}
              <div className="py-2">
                <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.9] text-center italic">
                  「{review.summary}」
                </p>
              </div>
            </div>

            {/* 水印 */}
            <div className="share-card-footer">
              人生日记
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-[var(--color-text-hint)] text-[13px] font-medium">暂无数据</div>
        )}
      </main>
    </div>
  );
}

/** 分区标题 */
function ReviewSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center">
          <span className="text-[13px]">{icon}</span>
        </div>
        <h3 className="text-[13px] font-bold text-[var(--color-text)] tracking-[0.12em]">{title}</h3>
      </div>
      {children}
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
