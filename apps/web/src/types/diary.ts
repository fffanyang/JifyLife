/**
 * 马伯庸式人生日记 - 数据类型定义
 */

/**
 * 单日日记数据
 *
 * 字段体系遵循马伯庸日记体例：
 * 「所遇何事、所见何人、所读何书，皆是日常直录。
 *   细大必书，积玉碎金，以记事为要，文辞次之，多记录，少议论。」
 */
export interface DiaryEntry {
  /** 日期 yyyy-MM-dd */
  date: string;
  /** 天气 */
  weather: string;
  /** 今日事 — 所遇何事、所见何人：发生了什么、去了哪、见了谁 */
  events: string;
  /** 吃喝 — 日常直录：吃了什么、喝了什么 */
  food: string;
  /** 灵感 — 积玉碎金：冷知识、有趣发现、突发奇想 */
  ideas: string;
  /** 读了什么 — 所读何书：书、文章、播客、视频 */
  reading: string;
  /** 工作 — 以记事为要 */
  work: string;
  /** 心情 — 少议论：偶尔记，不强制 */
  mood: string;
  /** 起床时间 HH:mm */
  wakeUp: string;
  /** 睡觉时间 HH:mm */
  sleep: string;
  /** 图片 URI 列表（指向手机相册的路径） */
  images: string[];
  /** 创建时间 ISO */
  createdAt: string;
  /** 更新时间 ISO */
  updatedAt: string;
}

/** 图片索引项 */
export interface ImageIndex {
  uri: string;
  usedIn: string[];
}

/** 完整索引文件 */
export interface DiaryIndex {
  version: number;
  images: ImageIndex[];
}

/** 回顾周期 */
export type ReviewPeriod = 'week' | 'month' | 'year';

/** 作息统计 */
export interface SleepStats {
  avgWakeUp: string;
  avgSleep: string;
  latestSleep: { date: string; time: string };
  avgDuration: string;
  totalDays: number;
}

/** 记录统计 */
export interface TaskStats {
  totalEvents: number;
  totalFood: number;
  totalIdeas: number;
  totalReading: number;
  totalWork: number;
  totalMood: number;
}

/** 生活统计 */
export interface LifeStats {
  topItems: string[];
  totalDays: number;
}

/** 回顾数据 */
export interface ReviewData {
  period: ReviewPeriod;
  title: string;
  dateRange: string;
  sleepStats: SleepStats;
  taskStats: TaskStats;
  lifeStats: LifeStats;
  summary: string;
  diaryCount: number;
}

/** 天气选项 */
export const WEATHER_OPTIONS = [
  { label: '晴', icon: '☀️' },
  { label: '多云', icon: '⛅' },
  { label: '阴', icon: '☁️' },
  { label: '小雨', icon: '🌧️' },
  { label: '大雨', icon: '⛈️' },
  { label: '雪', icon: '🌨️' },
  { label: '雾', icon: '🌫️' },
  { label: '风', icon: '💨' },
] as const;

/**
 * 输入字段定义 — 马伯庸式流水账：以记事为要，多记录少议论
 *
 * 「一事一条，所读何书，所见何人，所遇何事，皆是日常直录。」
 */
export const DIARY_FIELDS = [
  { key: 'events' as const, label: '今日事', placeholder: '发生了什么、去了哪、见了谁…', icon: '📝' },
  { key: 'food' as const, label: '吃喝', placeholder: '早午晚饭、咖啡奶茶…', icon: '🍽️' },
  { key: 'ideas' as const, label: '灵感', placeholder: '冷知识、有趣发现、突发奇想…', icon: '💡' },
  { key: 'reading' as const, label: '读了什么', placeholder: '书、文章、播客、视频…', icon: '📖' },
  { key: 'work' as const, label: '工作', placeholder: '开会、写需求、处理事务…', icon: '💼' },
  { key: 'mood' as const, label: '心情', placeholder: '感受、想法、一句话…', icon: '🌙' },
] as const;
