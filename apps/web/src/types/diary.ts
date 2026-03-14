/**
 * 马伯庸式人生日记 - 数据类型定义
 */

/** 单日日记数据 */
export interface DiaryEntry {
  /** 日期 yyyy-MM-dd */
  date: string;
  /** 天气 */
  weather: string;
  /** 工作 */
  work: string;
  /** 学习 */
  study: string;
  /** 运动健康 */
  fitness: string;
  /** 生活消费 */
  expense: string;
  /** 心情感悟 */
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

/** 事务统计 */
export interface TaskStats {
  totalWork: number;
  totalStudy: number;
  totalFitness: number;
  totalExpense: number;
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

/** 输入字段定义 */
export const DIARY_FIELDS = [
  { key: 'work' as const, label: '工作', placeholder: '开会、写需求、整理文档…', icon: '💼' },
  { key: 'study' as const, label: '学习', placeholder: '读书、网课、新技能…', icon: '📖' },
  { key: 'fitness' as const, label: '运动健康', placeholder: '跑步、健身、早睡早起…', icon: '💪' },
  { key: 'expense' as const, label: '生活消费', placeholder: '咖啡、午饭、买了什么…', icon: '🛒' },
  { key: 'mood' as const, label: '心情感悟', placeholder: '今天的感受、想说的话…', icon: '💭' },
] as const;
