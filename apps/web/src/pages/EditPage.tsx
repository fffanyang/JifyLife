import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Camera, X, Save, Trash2, Check } from 'lucide-react';
import { useDiaryStore } from '@/stores/diaryStore';
import { formatDate, getWeekday, getRelativeDate } from '@/services/diaryService';
import { WEATHER_OPTIONS, DIARY_FIELDS } from '@/types/diary';
import type { DiaryEntry } from '@/types/diary';

export default function EditPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  const { currentDiary, save, loadDiary, setDate, remove, currentDate } = useDiaryStore();

  const [weather, setWeather] = useState('晴');
  const [work, setWork] = useState('');
  const [study, setStudy] = useState('');
  const [fitness, setFitness] = useState('');
  const [expense, setExpense] = useState('');
  const [mood, setMood] = useState('');
  const [wakeUp, setWakeUp] = useState('');
  const [sleep, setSleep] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showWeather, setShowWeather] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化日期
  useEffect(() => {
    const targetDate = dateParam || formatDate(new Date());
    setDate(targetDate);
  }, [dateParam, setDate]);

  // 加载已有日记
  useEffect(() => {
    if (currentDiary) {
      setWeather(currentDiary.weather || '晴');
      setWork(currentDiary.work || '');
      setStudy(currentDiary.study || '');
      setFitness(currentDiary.fitness || '');
      setExpense(currentDiary.expense || '');
      setMood(currentDiary.mood || '');
      setWakeUp(currentDiary.wakeUp || '');
      setSleep(currentDiary.sleep || '');
      setImages(currentDiary.images || []);
    } else {
      setWeather('晴');
      setWork('');
      setStudy('');
      setFitness('');
      setExpense('');
      setMood('');
      setWakeUp('');
      setSleep('');
      setImages([]);
    }
  }, [currentDiary]);

  const goDay = (offset: number) => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    navigate(`/edit?date=${formatDate(d)}`, { replace: true });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      if (images.length + newImages.length >= 9) return;
      newImages.push(URL.createObjectURL(file));
    });
    setImages(prev => [...prev, ...newImages].slice(0, 9));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const entry: Omit<DiaryEntry, 'createdAt' | 'updatedAt'> = {
      date: currentDate, weather, work, study, fitness, expense, mood, wakeUp, sleep, images,
    };
    await save(entry);
    setSaved(true);
    // 保存成功后短暂显示确认，然后返回首页
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  const handleDelete = async () => {
    if (confirm('确定删除这一天的日记吗？')) {
      await remove(currentDate);
      navigate('/');
    }
  };

  const fieldSetters: Record<string, React.Dispatch<React.SetStateAction<string>>> = {
    work: setWork, study: setStudy, fitness: setFitness, expense: setExpense, mood: setMood,
  };
  const fieldValues: Record<string, string> = { work, study, fitness, expense, mood };

  const weekday = getWeekday(currentDate);
  const relative = getRelativeDate(currentDate);
  const weatherIcon = WEATHER_OPTIONS.find(w => w.label === weather)?.icon || '☀️';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* 顶部导航 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-13">
          <button onClick={() => navigate(-1)} className="p-2 text-[var(--color-text-secondary)] active:text-[var(--color-text)] -ml-1">
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-1.5">
            <button onClick={() => goDay(-1)} className="p-1.5 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
              <ChevronLeft size={16} />
            </button>
            <div className="text-center min-w-[120px]">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) navigate(`/edit?date=${e.target.value}`, { replace: true });
                }}
                className="text-[14px] font-semibold text-[var(--color-text)] bg-transparent border-none text-center cursor-pointer outline-none"
              />
              <div className="text-[11px] text-[var(--color-text-muted)] -mt-0.5">{relative} {weekday}</div>
            </div>
            <button onClick={() => goDay(1)} className="p-1.5 text-[var(--color-text-muted)] active:text-[var(--color-text)]">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center">
            {currentDiary && (
              <button onClick={handleDelete} className="p-2 text-[var(--color-text-muted)] active:text-[var(--color-danger)]">
                <Trash2 size={18} />
              </button>
            )}
            {!currentDiary && <div className="w-9" />}
          </div>
        </div>
      </header>

      {/* 编辑内容 */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-5 py-5 space-y-4">

          {/* 天气选择 */}
          <div className="relative">
            <button
              onClick={() => setShowWeather(!showWeather)}
              className="flex items-center gap-2 px-4 py-2 card text-[13px] active:scale-95 transition-transform"
            >
              <span className="text-base">{weatherIcon}</span>
              <span className="text-[var(--color-text-secondary)] font-medium">{weather}</span>
              <ChevronRight size={14} className="text-[var(--color-text-muted)] ml-1" />
            </button>
            {showWeather && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl p-3 grid grid-cols-4 gap-1.5 z-20 animate-scale-in"
                   style={{ boxShadow: 'var(--shadow-modal)' }}>
                {WEATHER_OPTIONS.map(w => (
                  <button
                    key={w.label}
                    onClick={() => { setWeather(w.label); setShowWeather(false); }}
                    className={`flex flex-col items-center py-2.5 px-3 rounded-xl text-[12px] transition-all active:scale-90 ${
                      weather === w.label
                        ? 'bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-accent)] font-semibold'
                        : 'text-[var(--color-text-secondary)] hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl mb-1">{w.icon}</span>
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 五个文本字段 */}
          {DIARY_FIELDS.map((field, idx) => (
            <FieldCard
              key={field.key}
              icon={field.icon}
              label={field.label}
              placeholder={field.placeholder}
              value={fieldValues[field.key]}
              onChange={(v) => fieldSetters[field.key](v)}
              delay={idx * 30}
            />
          ))}

          {/* 作息 */}
          <div className="card p-4 animate-slide-up" style={{ animationDelay: '180ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🛏️</span>
              <span className="text-[13px] font-semibold text-[var(--color-text)]">作息</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[11px] text-[var(--color-text-muted)] mb-1.5 font-medium">起床</div>
                <input
                  type="time"
                  value={wakeUp}
                  onChange={(e) => setWakeUp(e.target.value)}
                  className="w-full text-[14px] text-[var(--color-text)] bg-[var(--color-bg)] rounded-xl px-3 py-2.5 border-none outline-none font-medium"
                />
              </div>
              <div className="text-[var(--color-text-muted)] mt-6 text-lg">—</div>
              <div className="flex-1">
                <div className="text-[11px] text-[var(--color-text-muted)] mb-1.5 font-medium">睡觉</div>
                <input
                  type="time"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="w-full text-[14px] text-[var(--color-text)] bg-[var(--color-bg)] rounded-xl px-3 py-2.5 border-none outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* 图片区 */}
          <div className="card p-4 animate-slide-up" style={{ animationDelay: '210ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📷</span>
              <span className="text-[13px] font-semibold text-[var(--color-text)]">图片</span>
              <span className="text-[11px] text-[var(--color-text-muted)] font-normal ml-1">{images.length}/9</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--color-bg)]">
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<div class="w-full h-full flex items-center justify-center text-[11px] text-[var(--color-text-muted)]">图片已删除</div>';
                  }} />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center active:bg-black/60"
                  >
                    <X size={11} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 9 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-accent-light)] flex flex-col items-center justify-center text-[var(--color-text-muted)] active:bg-[var(--color-bg)] transition-colors"
                >
                  <Camera size={20} />
                  <span className="text-[11px] mt-1">添加</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>
      </main>

      {/* 底部保存栏 */}
      <div className="fixed bottom-0 left-0 right-0 glass-header safe-bottom" style={{ borderTop: '1px solid rgba(44,37,32,0.06)', borderBottom: 'none' }}>
        <div className="max-w-lg mx-auto px-5 py-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`w-full py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              saved
                ? 'bg-[var(--color-success)] text-white'
                : 'bg-[var(--color-brand)] text-white'
            }`}
          >
            {saved ? (
              <><Check size={18} /><span>已保存</span></>
            ) : (
              <><Save size={18} /><span>保存日记</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 自适应高度的文本输入字段卡片 */
function FieldCard({
  icon, label, placeholder, value, onChange, delay = 0,
}: {
  icon: string; label: string; placeholder: string;
  value: string; onChange: (v: string) => void; delay?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.max(el.scrollHeight, 36) + 'px';
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  return (
    <div className="card p-4 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-[13px] font-semibold text-[var(--color-text)]">{label}</span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); autoResize(); }}
        placeholder={placeholder}
        rows={1}
        className="w-full text-[14px] text-[var(--color-text)] placeholder-[var(--color-text-muted)] bg-transparent border-none outline-none leading-relaxed resize-none overflow-hidden"
      />
    </div>
  );
}
