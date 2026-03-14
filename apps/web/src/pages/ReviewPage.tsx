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
        <div className="flex items-center justify-between px-4 h-13">
          <button onClick={() => navigate('/')} className="p-2 text-[var(--color-text-secondary)] active:text-[var(--color-text)] -ml-1">
            <ChevronLeft size={22} />
          </button>
          <div className="text-[14px] font-semibold text-[var(--color-text)]">回顾</div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-5">
        {/* 周期切换 */}
        <div className="flex items-center justify-center gap-2 mb-4">
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
        <div className="flex items-center justify-center gap-4 mb-5">
          <button onClick={() => navigatePeriod(-1)} className="p-1.5 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[12px] text-[var(--color-text-secondary)] min-w-[180px] text-center">
            {review?.dateRange || ''}
          </span>
          <button onClick={() => navigatePeriod(1)} className="p-1.5 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
            <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-[var(--color-text-muted)] text-[13px]">加载中…</div>
          </div>
        ) : review ? (
          <div ref={cardRef} className="share-card animate-scale-in">
            {/* 卡片标题 */}
            <div className="share-card-header">
              <h2 className="text-xl font-bold text-[var(--color-text)] tracking-wide">
                {review.title}
              </h2>
              <div className="text-[12px] text-[var(--color-text-muted)] mt-1.5">
                {review.diaryCount > 0 ? `共 ${review.diaryCount} 篇日记` : '暂无日记记录'}
              </div>
            </div>

            <div className="share-card-body space-y-6">
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
                  <CountCard label="工作" value={review.taskStats.totalWork} color="var(--color-accent)" />
                  <CountCard label="学习" value={review.taskStats.totalStudy} color="var(--color-success)" />
                  <CountCard label="运动" value={review.taskStats.totalFitness} color="#7C8BBE" />
                  <CountCard label="消费" value={review.taskStats.totalExpense} color="#C17A5A" />
                  <CountCard label="心情" value={review.taskStats.totalMood} color="#A0856E" />
                </div>
              </ReviewSection>

              {/* 生活高频 */}
              {review.lifeStats.topItems.length > 0 && (
                <>
                  <div className="divider" />
                  <ReviewSection icon="✨" title="消费高频">
                    <div className="flex flex-wrap gap-2">
                      {review.lifeStats.topItems.map((item, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-1.5 bg-[var(--color-bg)] text-[var(--color-text-secondary)] text-[12px] rounded-full font-medium"
                          style={{ border: '1px solid rgba(44,37,32,0.06)' }}
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
              <div className="py-1">
                <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.8] text-center" style={{ fontStyle: 'italic' }}>
                  「{review.summary}」
                </p>
              </div>
            </div>

            {/* 品牌水印 */}
            <div className="share-card-footer">
              人生日记
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-[var(--color-text-muted)] text-[13px]">暂无数据</div>
        )}
      </main>
    </div>
  );
}

/** 分区标题 */
function ReviewSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[14px]">{icon}</span>
        <h3 className="text-[13px] font-semibold text-[var(--color-text)] tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/** 统计卡片 — 作息模块用 */
function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="bg-[var(--color-bg)] rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[var(--color-text-muted)] font-medium">{label}</span>
        <span className="text-[12px]">{icon}</span>
      </div>
      <div className="text-[18px] font-bold text-[var(--color-text)] leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-[var(--color-text-muted)] mt-1">{sub}</div>}
    </div>
  );
}

/** 计数卡片 — 事务模块用 */
function CountCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--color-bg)] rounded-xl p-3.5 text-center">
      <div className="text-[24px] font-bold leading-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] text-[var(--color-text-muted)] mt-1 font-medium">{label}</div>
    </div>
  );
}
