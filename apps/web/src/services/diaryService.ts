/**
 * 日记数据服务 - CRUD + 统计 + 导出
 */
import { db } from './db';
import type { DiaryEntry, ReviewData, ReviewPeriod, SleepStats, TaskStats, LifeStats } from '@/types/diary';

// ========== CRUD ==========

/** 保存日记（创建或更新） */
export async function saveDiary(entry: Omit<DiaryEntry, 'createdAt' | 'updatedAt'>): Promise<void> {
  const existing = await db.diaries.get(entry.date);
  const now = new Date().toISOString();
  if (existing) {
    await db.diaries.put({
      ...entry,
      createdAt: existing.createdAt,
      updatedAt: now,
    });
  } else {
    await db.diaries.put({
      ...entry,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/** 获取指定日期的日记 */
export async function getDiary(date: string): Promise<DiaryEntry | undefined> {
  return db.diaries.get(date);
}

/** 删除指定日期的日记 */
export async function deleteDiary(date: string): Promise<void> {
  await db.diaries.delete(date);
}

/** 获取日期范围内的日记 */
export async function getDiariesInRange(startDate: string, endDate: string): Promise<DiaryEntry[]> {
  return db.diaries
    .where('date')
    .between(startDate, endDate, true, true)
    .sortBy('date');
}

/** 获取所有日记（按日期降序） */
export async function getAllDiaries(): Promise<DiaryEntry[]> {
  const all = await db.diaries.toArray();
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

/** 获取最近 N 天有日记的日期 */
export async function getRecentDiaryDates(limit: number = 30): Promise<string[]> {
  const all = await db.diaries.orderBy('date').reverse().limit(limit).toArray();
  return all.map(d => d.date);
}

// ========== 马伯庸风格日记生成 ==========

/** 生成马伯庸式排版的 Markdown */
export function generateMarkdown(entry: DiaryEntry): string {
  const weekday = getWeekday(entry.date);
  const lines: string[] = [];

  lines.push(`# ${entry.date} ${weekday} ${entry.weather}`);
  lines.push('');

  if (entry.work.trim()) {
    lines.push('## 工作');
    lines.push(entry.work.trim());
    lines.push('');
  }
  if (entry.study.trim()) {
    lines.push('## 学习');
    lines.push(entry.study.trim());
    lines.push('');
  }
  if (entry.fitness.trim()) {
    lines.push('## 运动健康');
    lines.push(entry.fitness.trim());
    lines.push('');
  }
  if (entry.expense.trim()) {
    lines.push('## 生活消费');
    lines.push(entry.expense.trim());
    lines.push('');
  }
  if (entry.mood.trim()) {
    lines.push('## 心情感悟');
    lines.push(entry.mood.trim());
    lines.push('');
  }
  if (entry.wakeUp || entry.sleep) {
    lines.push('## 作息');
    const parts: string[] = [];
    if (entry.wakeUp) parts.push(`${entry.wakeUp} 起`);
    if (entry.sleep) parts.push(`${entry.sleep} 睡`);
    lines.push(parts.join(' | '));
    lines.push('');
  }
  if (entry.images.length > 0) {
    lines.push('## 图片');
    entry.images.forEach(img => lines.push(img));
    lines.push('');
  }

  return lines.join('\n');
}

// ========== 统计逻辑 ==========

/** 解析时间字符串 HH:mm 为分钟数 */
function parseTimeToMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

/** 分钟数转 HH:mm */
function minutesToTime(minutes: number): string {
  const h = Math.floor(((minutes % 1440) + 1440) % 1440 / 60);
  const m = Math.round(((minutes % 1440) + 1440) % 1440 % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** 计算睡眠时长（小时） */
function calcSleepDuration(sleep: string, wakeUp: string): number | null {
  const sleepMin = parseTimeToMinutes(sleep);
  const wakeMin = parseTimeToMinutes(wakeUp);
  if (sleepMin === null || wakeMin === null) return null;
  // 睡觉时间通常在晚上，起床在早上；如果 sleep > wakeUp 说明跨天
  let duration = wakeMin - sleepMin;
  if (duration <= 0) duration += 1440; // 跨天
  // 如果算出来超过 16 小时不太合理，反过来算
  if (duration > 960) duration = 1440 - duration;
  return duration / 60;
}

/** 计算作息统计 */
function calcSleepStats(entries: DiaryEntry[]): SleepStats {
  const validEntries = entries.filter(e => e.wakeUp && e.sleep);

  if (validEntries.length === 0) {
    return {
      avgWakeUp: '--:--',
      avgSleep: '--:--',
      latestSleep: { date: '', time: '--:--' },
      avgDuration: '--',
      totalDays: 0,
    };
  }

  let totalWakeMin = 0;
  let totalSleepMin = 0;
  let totalDuration = 0;
  let latestSleepMin = -1;
  let latestSleepDate = '';
  let latestSleepTime = '';
  let durationCount = 0;

  validEntries.forEach(e => {
    const wMin = parseTimeToMinutes(e.wakeUp)!;
    const sMin = parseTimeToMinutes(e.sleep)!;
    totalWakeMin += wMin;
    // 将入睡时间标准化：22:00之前算当天(+24h)，之后正常
    const normalizedSleep = sMin < 720 ? sMin + 1440 : sMin;
    totalSleepMin += normalizedSleep;

    if (normalizedSleep > latestSleepMin) {
      latestSleepMin = normalizedSleep;
      latestSleepDate = e.date;
      latestSleepTime = e.sleep;
    }

    const dur = calcSleepDuration(e.sleep, e.wakeUp);
    if (dur !== null) {
      totalDuration += dur;
      durationCount++;
    }
  });

  const avgWakeMin = Math.round(totalWakeMin / validEntries.length);
  const avgSleepMin = Math.round(totalSleepMin / validEntries.length);
  const avgDur = durationCount > 0 ? (totalDuration / durationCount) : 0;

  return {
    avgWakeUp: minutesToTime(avgWakeMin),
    avgSleep: minutesToTime(avgSleepMin % 1440),
    latestSleep: { date: latestSleepDate, time: latestSleepTime },
    avgDuration: avgDur > 0 ? `${avgDur.toFixed(1)}h` : '--',
    totalDays: validEntries.length,
  };
}

/** 计算事务统计 */
function calcTaskStats(entries: DiaryEntry[]): TaskStats {
  let totalWork = 0;
  let totalStudy = 0;
  let totalFitness = 0;
  let totalExpense = 0;
  let totalMood = 0;

  entries.forEach(e => {
    if (e.work.trim()) totalWork += e.work.split(/[,，、;；\n]/).filter(s => s.trim()).length;
    if (e.study.trim()) totalStudy += e.study.split(/[,，、;；\n]/).filter(s => s.trim()).length;
    if (e.fitness.trim()) totalFitness += e.fitness.split(/[,，、;；\n]/).filter(s => s.trim()).length;
    if (e.expense.trim()) totalExpense += e.expense.split(/[,，、;；\n]/).filter(s => s.trim()).length;
    if (e.mood.trim()) totalMood += e.mood.split(/[,，、;；\n]/).filter(s => s.trim()).length;
  });

  return { totalWork, totalStudy, totalFitness, totalExpense, totalMood };
}

/** 计算生活统计 */
function calcLifeStats(entries: DiaryEntry[]): LifeStats {
  const freq: Record<string, number> = {};
  let totalDays = 0;

  entries.forEach(e => {
    if (!e.expense.trim()) return;
    totalDays++;
    e.expense.split(/[,，、;；\n]/).forEach(item => {
      const t = item.trim();
      if (t) freq[t] = (freq[t] || 0) + 1;
    });
  });

  const topItems = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  return { topItems, totalDays };
}

/** 生成一句话总结 */
function generateSummary(entries: DiaryEntry[], taskStats: TaskStats, sleepStats: SleepStats): string {
  const parts: string[] = [];

  if (entries.length === 0) return '这段时间暂无日记记录。';

  if (taskStats.totalWork > 0) {
    parts.push(`处理了 ${taskStats.totalWork} 项工作`);
  }
  if (taskStats.totalStudy > 0) {
    parts.push(`学习了 ${taskStats.totalStudy} 项内容`);
  }
  if (taskStats.totalFitness > 0) {
    parts.push(`运动健康 ${taskStats.totalFitness} 次`);
  }
  if (sleepStats.totalDays > 0 && sleepStats.avgDuration !== '--') {
    parts.push(`平均睡 ${sleepStats.avgDuration}`);
  }

  if (parts.length === 0) {
    return `记录了 ${entries.length} 天的生活，虽平淡却真实。`;
  }

  return parts.join('，') + '。生活充实，继续加油。';
}

// ========== 回顾数据生成 ==========

/** 获取日期所在周的起止日期 */
function getWeekRange(date: Date): [string, string] {
  const d = new Date(date);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return [formatDate(monday), formatDate(sunday)];
}

/** 获取日期所在月的起止日期 */
function getMonthRange(date: Date): [string, string] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [formatDate(start), formatDate(end)];
}

/** 获取日期所在年的起止日期 */
function getYearRange(date: Date): [string, string] {
  return [`${date.getFullYear()}-01-01`, `${date.getFullYear()}-12-31`];
}

/** 计算周数 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/** 生成回顾数据 */
export async function generateReview(period: ReviewPeriod, referenceDate?: Date): Promise<ReviewData> {
  const refDate = referenceDate || new Date();
  let startDate: string, endDate: string, title: string, dateRange: string;

  switch (period) {
    case 'week': {
      const [s, e] = getWeekRange(refDate);
      startDate = s;
      endDate = e;
      title = `第 ${getWeekNumber(refDate)} 周 · 个人小结`;
      dateRange = `${s} ~ ${e}`;
      break;
    }
    case 'month': {
      const [s, e] = getMonthRange(refDate);
      startDate = s;
      endDate = e;
      title = `${refDate.getFullYear()}年${refDate.getMonth() + 1}月 · 月度回顾`;
      dateRange = `${s} ~ ${e}`;
      break;
    }
    case 'year': {
      const [s, e] = getYearRange(refDate);
      startDate = s;
      endDate = e;
      title = `${refDate.getFullYear()}年 · 年度回顾`;
      dateRange = `${s} ~ ${e}`;
      break;
    }
  }

  const entries = await getDiariesInRange(startDate, endDate);
  const sleepStats = calcSleepStats(entries);
  const taskStats = calcTaskStats(entries);
  const lifeStats = calcLifeStats(entries);
  const summary = generateSummary(entries, taskStats, sleepStats);

  return {
    period,
    title,
    dateRange,
    sleepStats,
    taskStats,
    lifeStats,
    summary,
    diaryCount: entries.length,
  };
}

// ========== 导出功能 ==========

/** 生成完整日记导出内容（Markdown + index.json） */
export async function exportAllDiaries(): Promise<{ files: { name: string; content: string }[] }> {
  const all = await getAllDiaries();
  const files: { name: string; content: string }[] = [];
  const imageIndex: { uri: string; used_in: string[] }[] = [];

  all.forEach(entry => {
    // 生成 Markdown 文件
    files.push({
      name: `${entry.date}.md`,
      content: generateMarkdown(entry),
    });

    // 收集图片索引
    entry.images.forEach(uri => {
      const existing = imageIndex.find(img => img.uri === uri);
      if (existing) {
        if (!existing.used_in.includes(entry.date)) {
          existing.used_in.push(entry.date);
        }
      } else {
        imageIndex.push({ uri, used_in: [entry.date] });
      }
    });
  });

  // 生成 index.json
  files.push({
    name: 'index.json',
    content: JSON.stringify({ images: imageIndex }, null, 2),
  });

  return { files };
}

// ========== 工具函数 ==========

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getWeekday(dateStr: string): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const d = new Date(dateStr + 'T00:00:00');
  return weekdays[d.getDay()];
}

export function getRelativeDate(dateStr: string): string {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  const tomorrow = formatDate(new Date(Date.now() + 86400000));

  if (dateStr === today) return '今天';
  if (dateStr === yesterday) return '昨天';
  if (dateStr === tomorrow) return '明天';
  return dateStr;
}
