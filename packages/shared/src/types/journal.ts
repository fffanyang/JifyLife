import type { GenerateMode } from './entry.js';

/**
 * 日记
 */
export interface Journal {
  id: string;
  userId: string;
  /** 日期 YYYY-MM-DD */
  date: string;
  title: string;
  /** 生成的日记正文（Markdown） */
  content: string;
  /** 关联的流水账条目 ID 列表 */
  entryIds: string[];
  /** 生成模式 */
  generateMode: GenerateMode;
  createdAt: string;
  updatedAt: string;
}

/**
 * 生成日记请求
 */
export interface GenerateJournalRequest {
  date: string;
  mode: GenerateMode;
  /** 不传则使用当天所有流水账条目 */
  entryIds?: string[];
  style?: 'casual' | 'formal' | 'literary';
}
