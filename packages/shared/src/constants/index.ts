/** API 路径前缀 */
export const API_PREFIX = '/api';

/** API 路径 */
export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  ENTRIES: {
    BASE: '/entries',
    BY_ID: (id: string) => `/entries/${id}`,
    ANALYZE: '/entries/analyze',
  },
  JOURNALS: {
    BASE: '/journals',
    BY_ID: (id: string) => `/journals/${id}`,
    GENERATE: '/journals/generate',
    BY_DATE: (date: string) => `/journals/date/${date}`,
  },
  CHECKINS: {
    ITEMS: '/checkins/items',
    ITEM_BY_ID: (id: string) => `/checkins/items/${id}`,
    RECORDS: '/checkins/records',
    STATS: '/checkins/stats',
    SUGGESTIONS: '/checkins/suggestions',
  },
  KNOWLEDGE: {
    CARDS: '/knowledge/cards',
    CARD_BY_ID: (id: string) => `/knowledge/cards/${id}`,
    TAGS: '/knowledge/tags',
    SEARCH: '/knowledge/search',
  },
} as const;

/** 分页默认值 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** 条目类型配置 */
export const ENTRY_TYPE_CONFIG = {
  schedule: { label: '日程', icon: '📅', color: '#3B82F6' },
  memo: { label: '备忘', icon: '📝', color: '#F59E0B' },
  flow: { label: '流水账', icon: '💬', color: '#10B981' },
  checkin: { label: '打卡', icon: '✅', color: '#8B5CF6' },
  knowledge: { label: '知识', icon: '💡', color: '#F97316' },
} as const;

/** JWT Token 过期时间 */
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
