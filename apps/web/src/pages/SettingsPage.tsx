import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Download, Check, Trash2 } from 'lucide-react';
import { exportAllDiaries, getAllDiaries } from '@/services/diaryService';
import { db } from '@/services/db';

const APP_VERSION = '2.0.0';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [diaryCount, setDiaryCount] = useState<number | null>(null);

  useEffect(() => {
    getAllDiaries().then(all => setDiaryCount(all.length));
  }, []);

  const storagePath = '浏览器 IndexedDB > MaBoyongDiary > diaries';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storagePath);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = storagePath;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { files } = await exportAllDiaries();
      if (files.length <= 1) {
        alert('暂无日记可导出');
        setExporting(false);
        return;
      }
      for (const file of files) {
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2000);
    } catch (err) {
      alert('导出失败：' + (err as Error).message);
    }
    setExporting(false);
  };

  const handleClearAll = async () => {
    if (confirm('确定要删除所有日记数据吗？此操作不可撤销。')) {
      if (confirm('再次确认：将永久删除所有日记，确定吗？')) {
        await db.diaries.clear();
        setDiaryCount(0);
        alert('已清除所有数据');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* 顶部 */}
      <header className="glass-header sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] active:text-[var(--color-text)] active:bg-[var(--color-bg)] transition-all">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <div className="text-[15px] font-bold text-[var(--color-text)] tracking-wider">设置</div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-4">
        {/* 数据存储 */}
        <div className="card-static p-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--color-accent-soft)] flex items-center justify-center">
              <span className="text-[15px]">💾</span>
            </div>
            <div>
              <span className="text-[14px] font-bold text-[var(--color-text)]">数据存储</span>
              {diaryCount !== null && (
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">已记录 {diaryCount} 篇日记</div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-[var(--color-text-muted)] mb-2 font-semibold tracking-wider">存储位置</div>
          <div className="input-field px-4 py-3 mb-3">
            <div className="text-[13px] text-[var(--color-text)] font-mono break-all leading-relaxed">
              {storagePath}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-[13px] text-[var(--color-accent)] active:opacity-70 font-semibold"
          >
            {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
            <span>{copied ? '已复制' : '复制路径'}</span>
          </button>
        </div>

        {/* 导出日记 */}
        <div className="card-static p-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--color-success-soft)] flex items-center justify-center">
              <Download size={16} className="text-[var(--color-success)]" strokeWidth={2} />
            </div>
            <span className="text-[14px] font-bold text-[var(--color-text)]">导出日记</span>
          </div>
          <p className="text-[12px] text-[var(--color-text-muted)] mb-4 leading-relaxed font-medium">
            导出所有日记为 Markdown 文件和图片索引，可用于备份和迁移。
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`w-full py-3.5 rounded-[var(--radius-button)] text-[13px] font-bold transition-all active:scale-[0.98] tracking-wide ${
              exportDone
                ? 'bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[rgba(94,158,110,0.15)]'
                : exporting
                ? 'bg-[var(--color-bg)] text-[var(--color-text-hint)]'
                : 'bg-[var(--color-brand)] text-white shadow-[0_2px_8px_rgba(26,22,20,0.12)]'
            }`}
          >
            {exportDone ? '导出完成' : exporting ? '导出中…' : '导出完整日记'}
          </button>
        </div>

        {/* 危险区域 */}
        <div className="card-static p-5 animate-slide-up" style={{ animationDelay: '120ms', border: '1px solid rgba(196,84,84,0.06)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--color-danger-soft)] flex items-center justify-center">
              <Trash2 size={16} className="text-[var(--color-danger)]" strokeWidth={2} />
            </div>
            <span className="text-[14px] font-bold text-[var(--color-danger)]">危险操作</span>
          </div>
          <button
            onClick={handleClearAll}
            className="w-full py-3.5 rounded-[var(--radius-button)] text-[13px] font-bold bg-[var(--color-danger-soft)] text-[var(--color-danger)] active:opacity-80 transition-all active:scale-[0.98] tracking-wide border border-[rgba(196,84,84,0.1)]"
          >
            清除所有数据
          </button>
        </div>

        {/* 关于 */}
        <div className="card-static p-5 animate-slide-up" style={{ animationDelay: '180ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--color-bg)] flex items-center justify-center border border-[rgba(26,22,20,0.05)]">
              <span className="text-[15px]">ℹ️</span>
            </div>
            <span className="text-[14px] font-bold text-[var(--color-text)]">关于</span>
          </div>
          <div className="space-y-3 text-[12px] text-[var(--color-text-muted)] leading-relaxed font-medium">
            <div className="flex items-center justify-between">
              <span>版本</span>
              <span className="text-[var(--color-text-secondary)] font-bold">v{APP_VERSION}</span>
            </div>
            <div className="divider" />
            <div className="text-[var(--color-text-hint)]">
              纯前端 PWA · 数据存在本地浏览器 · 不上传任何服务器
            </div>
            <div className="text-[var(--color-text-hint)]">
              JifyLife — P人也能变J人
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
