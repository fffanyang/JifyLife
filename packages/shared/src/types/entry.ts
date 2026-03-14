/**
 * 条目类型——AI 分析后的归类结果
 */
export type EntryType = 'schedule' | 'memo' | 'flow' | 'checkin' | 'knowledge';

/**
 * 条目处理状态
 */
export type EntryStatus = 'pending' | 'processing' | 'done' | 'failed';

/**
 * AI 生成模式
 */
export type GenerateMode = 'ai' | 'template';

/**
 * 统一条目——时间线卡片流的基础数据结构
 * 所有输入都先成为一个 Entry，AI 分析后填充 type 和 parsedData
 */
export interface Entry {
  id: string;
  userId: string;
  /** 用户的原始输入内容 */
  content: string;
  /** AI 分析后的条目类型 */
  type: EntryType;
  /** 处理状态 */
  status: EntryStatus;
  /** AI 分析的置信度 0-1 */
  confidence: number;
  /** AI 解析出的结构化数据 */
  parsedData: ParsedData;
  /** 自动标签 */
  tags: string[];
  /** 输入时间 */
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * AI 解析结果
 */
export interface ParsedData {
  /** 提取的标题/摘要 */
  title?: string;
  /** 解析出的日期时间（日程用） */
  datetime?: string;
  /** 结束时间（日程用） */
  endDatetime?: string;
  /** 提醒时间 */
  reminder?: string;
  /** 打卡项名称 */
  checkinItem?: string;
  /** 日程重复规则 */
  recurrence?: string;
  /** 优先级 */
  priority?: 'low' | 'medium' | 'high';
}

/**
 * 创建条目请求
 */
export interface CreateEntryRequest {
  content: string;
  /** 可选手动指定类型，不指定则由 AI 分析 */
  type?: EntryType;
}

/**
 * AI 内容分析结果
 */
export interface ContentAnalysis {
  type: EntryType;
  confidence: number;
  parsedData: ParsedData;
  tags: string[];
}
