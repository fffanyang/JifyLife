/**
 * 打卡项
 */
export interface CheckinItem {
  id: string;
  userId: string;
  name: string;
  icon: string;
  category: 'habit' | 'place' | 'activity';
  /** 是否启用 */
  active: boolean;
  createdAt: string;
}

/**
 * 打卡记录
 */
export interface CheckinRecord {
  id: string;
  userId: string;
  itemId: string;
  /** 打卡日期 YYYY-MM-DD */
  date: string;
  note?: string;
  createdAt: string;
}

/**
 * 打卡统计
 */
export interface CheckinStats {
  itemId: string;
  itemName: string;
  icon: string;
  /** 连续打卡天数 */
  streak: number;
  /** 今日是否已打卡 */
  todayDone: boolean;
  /** 今日打卡次数 */
  todayCount: number;
  /** 本周完成率 */
  weeklyRate: number;
  /** 总打卡天数 */
  totalDays: number;
}

/**
 * AI 提炼出的打卡建议
 */
export interface CheckinSuggestion {
  name: string;
  category: 'habit' | 'place' | 'activity';
  reason: string;
  frequency: string;
}
