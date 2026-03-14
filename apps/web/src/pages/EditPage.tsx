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

  useEffect(() => {
    const targetDate = dateParam || formatDate(new Date());
    setDate(targetDate);
  }, [dateParam, setDate]);

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
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => goDay(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <div className="text-center min-w-[130px]">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) navigate(`/edit?date=${e.target.value}`, { replace: true });
                }}
                className="text-[15px] font-bold text-[var(--color-text)] bg-transparent border-none text-center cursor-pointer outline-none tracking-wide"
              />
              <div className="text-[11px] text-[var(--color-text-muted)] font-medium -mt-0.5">{relative} {weekday}</div>
            </div>
            <button onClick={() => goDay(1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-text)] transition-colors">
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="flex items-center">
            {currentDiary && (
              <button onClick={handleDelete} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-hint)] active:text-[var(--color-danger)] transition-colors">
                <Trash2 size={18} strokeWidth={1.8} />
              </button>
            )}
            {!currentDiary && <div className="w-10" />}
          </div>
        </div>
      </header>

      {/* 编辑内容 */}
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-5 py-6 space-y-4">

          {/* 天气选择 */}
          <div className="relative animate-slide-up">
            <button
              onClick={() => setShowWeather(!showWeather)}
              className="flex items-center gap-2.5 px-5 py-3 card-static text-[13px] active:scale-[0.97] transition-transform"
            >
              <span className="text-lg">{weatherIcon}</span>
              <span className="text-[var(--color-text-secondary)] font-semibold">{weather}</span>
              <ChevronRight size={14} className="text-[var(--color-text-hint)] ml-auto" />
            </button>
            {showWeather && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowWeather(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl p-3.5 grid grid-cols-4 gap-2 z-20 animate-scale-in"
                     style={{ boxShadow: 'var(--shadow-modal)' }}>
                  {WEATHER_OPTIONS.map(w => (
                    <button
                      key={w.label}
                      onClick={() => { setWeather(w.label); setShowWeather(false); }}
                      className={`flex flex-col items-center py-3 px-3 rounded-[14px] text-[12px] transition-all active:scale-90 ${
                        weather === w.label
                          ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold border border-[rgba(156,123,86,0.15)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] active:bg-[var(--color-bg)]'
                      }`}
                    >
                      <span className="text-xl mb-1.5">{w.icon}</span>
                      <span className="font-medium">{w.label}</span>
                    </button>
                  ))}
                </div>
              </>
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
              delay={idx * 40 + 40}
            />
          ))}

          {/* 作息 */}
          <div className="card-static p-5 animate-slide-up" style={{ animationDelay: '240ms' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-[#EDE8E3] flex items-center justify-center">
                <span className="text-[14px]">🛏️</span>
              </div>
              <span className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">作息</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[11px] text-[var(--color-text-muted)] mb-2 font-semibold tracking-wider">起床</div>
                <div className="input-field">
                  <input
                    type="time"
                    value={wakeUp}
                    onChange={(e) => setWakeUp(e.target.value)}
                    className="w-full text-[14px] text-[var(--color-text)] bg-transparent rounded-[var(--radius-input)] px-4 py-3 border-none outline-none font-semibold"
                  />
                </div>
              </div>
              <div className="text-[var(--color-text-hint)] mt-7 text-lg font-light">—</div>
              <div className="flex-1">
                <div className="text-[11px] text-[var(--color-text-muted)] mb-2 font-semibold tracking-wider">睡觉</div>
                <div className="input-field">
                  <input
                    type="time"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    className="w-full text-[14px] text-[var(--color-text)] bg-transparent rounded-[var(--radius-input)] px-4 py-3 border-none outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 图片区 */}
          <div className="card-static p-5 animate-slide-up" style={{ animationDelay: '280ms' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-[#EDE8E3] flex items-center justify-center">
                <span className="text-[14px]">📷</span>
              </div>
              <span className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">图片</span>
              <span className="text-[11px] text-[var(--color-text-hint)] font-medium ml-auto">{images.length}/9</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-[14px] overflow-hidden bg-[var(--color-bg)]">
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<div class="w-full h-full flex items-center justify-center text-[11px] text-[var(--color-text-hint)]">图片已删除</div>';
                  }} />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center active:bg-black/50 transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 9 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-[14px] border-2 border-dashed border-[var(--color-accent-light)] flex flex-col items-center justify-center text-[var(--color-text-muted)] active:bg-[var(--color-bg)] transition-colors"
                >
                  <Camera size={20} strokeWidth={1.5} />
                  <span className="text-[11px] mt-1.5 font-medium">添加</span>
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
      <div className="fixed bottom-0 left-0 right-0 glass-header safe-bottom" style={{ borderTop: '1px solid rgba(26,22,20,0.05)', borderBottom: 'none' }}>
        <div className="max-w-lg mx-auto px-5 py-3.5">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`w-full py-4 rounded-[var(--radius-button)] font-bold text-[14px] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] tracking-wide ${
              saved
                ? 'btn-success'
                : 'btn-primary'
            }`}
          >
            {saved ? (
              <><Check size={18} strokeWidth={2.5} /><span>已保存</span></>
            ) : (
              <><Save size={18} strokeWidth={2} /><span>保存日记</span></>
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
      el.style.height = Math.max(el.scrollHeight, 40) + 'px';
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  return (
    <div className="card-static p-5 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-[10px] bg-[#EDE8E3] flex items-center justify-center">
          <span className="text-[14px]">{icon}</span>
        </div>
        <span className="text-[13px] font-bold text-[var(--color-text)] tracking-wide">{label}</span>
      </div>
      <div className="input-field px-4 py-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); autoResize(); }}
          placeholder={placeholder}
          rows={1}
          className="w-full text-[14px] text-[var(--color-text)] placeholder-[var(--color-text-hint)] bg-transparent border-none outline-none leading-relaxed resize-none overflow-hidden"
        />
      </div>
    </div>
  );
}
