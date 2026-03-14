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
        <div className="flex items-center justify-between px-4 h-13">
          <button onClick={() => navigate('/')} className="p-2 text-[var(--color-text-secondary)] active:text-[var(--color-text)] -ml-1">
            <ChevronLeft size={22} />
          </button>
          <div className="text-[14px] font-semibold text-[var(--color-text)]">设置</div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-5 space-y-4">
        {/* 数据存储 */}
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-[var(--color-accent)] bg-opacity-10 rounded-xl flex items-center justify-center">
              <span className="text-[14px]">💾</span>
            </div>
            <div>
              <span className="text-[14px] font-semibold text-[var(--color-text)]">数据存储</span>
              {diaryCount !== null && (
                <div className="text-[11px] text-[var(--color-text-muted)]">已记录 {diaryCount} 篇日记</div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-[var(--color-text-muted)] mb-1.5 font-medium">存储位置</div>
          <div className="text-[13px] text-[var(--color-text)] bg-[var(--color-bg)] rounded-xl p-3.5 font-mono break-all mb-3 leading-relaxed"
               style={{ border: '1px solid rgba(44,37,32,0.05)' }}>
            {storagePath}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[13px] text-[var(--color-accent)] active:opacity-70 font-medium"
          >
            {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
            <span>{copied ? '已复制' : '复制路径'}</span>
          </button>
        </div>

        {/* 导出日记 */}
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-[var(--color-success)] bg-opacity-10 rounded-xl flex items-center justify-center">
              <Download size={15} className="text-[var(--color-success)]" />
            </div>
            <span className="text-[14px] font-semibold text-[var(--color-text)]">导出日记</span>
          </div>
          <p className="text-[12px] text-[var(--color-text-muted)] mb-4 leading-relaxed">
            导出所有日记为 Markdown 文件和图片索引 (index.json)，可用于备份和迁移。
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`w-full py-3 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.98] ${
              exportDone
                ? 'bg-[var(--color-success)] bg-opacity-10 text-[var(--color-success)]'
                : exporting
                ? 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
                : 'bg-[var(--color-brand)] text-white'
            }`}
            style={{ border: exportDone ? '1px solid rgba(107,158,120,0.2)' : 'none' }}
          >
            {exportDone ? '导出完成' : exporting ? '导出中…' : '导出完整日记'}
          </button>
        </div>

        {/* 危险区域 */}
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '100ms', border: '1px solid rgba(199,92,92,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-[var(--color-danger)] bg-opacity-10 rounded-xl flex items-center justify-center">
              <Trash2 size={15} className="text-[var(--color-danger)]" />
            </div>
            <span className="text-[14px] font-semibold text-[var(--color-danger)]">危险操作</span>
          </div>
          <button
            onClick={handleClearAll}
            className="w-full py-3 rounded-xl text-[13px] font-semibold bg-[var(--color-danger)] bg-opacity-5 text-[var(--color-danger)] active:bg-opacity-15 transition-all active:scale-[0.98]"
            style={{ border: '1px solid rgba(199,92,92,0.15)' }}
          >
            清除所有数据
          </button>
        </div>

        {/* 关于 */}
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-[var(--color-bg)] rounded-xl flex items-center justify-center">
              <span className="text-[14px]">ℹ️</span>
            </div>
            <span className="text-[14px] font-semibold text-[var(--color-text)]">关于</span>
          </div>
          <div className="space-y-2 text-[12px] text-[var(--color-text-muted)] leading-relaxed">
            <div className="flex items-center justify-between">
              <span>版本</span>
              <span className="text-[var(--color-text-secondary)] font-medium">v{APP_VERSION}</span>
            </div>
            <div className="divider" />
            <div>纯前端 PWA · 数据存在本地浏览器 · 不上传任何服务器</div>
            <div>设计灵感：马伯庸日常碎碎念 × 极简J人管理系统</div>
          </div>
        </div>
      </main>
    </div>
  );
}
