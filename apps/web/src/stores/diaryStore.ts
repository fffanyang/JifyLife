/**
 * 日记状态管理
 */
import { create } from 'zustand';
import type { DiaryEntry } from '@/types/diary';
import * as diaryService from '@/services/diaryService';

interface DiaryState {
  /** 当前选中的日期 */
  currentDate: string;
  /** 当前日记 */
  currentDiary: DiaryEntry | null;
  /** 最近的日记日期列表 */
  recentDates: string[];
  /** 是否正在加载 */
  loading: boolean;

  /** 切换日期 */
  setDate: (date: string) => Promise<void>;
  /** 加载当前日期的日记 */
  loadDiary: () => Promise<void>;
  /** 保存日记 */
  save: (entry: Omit<DiaryEntry, 'createdAt' | 'updatedAt'>) => Promise<void>;
  /** 删除日记 */
  remove: (date: string) => Promise<void>;
  /** 刷新最近日期列表 */
  refreshRecentDates: () => Promise<void>;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  currentDate: diaryService.formatDate(new Date()),
  currentDiary: null,
  recentDates: [],
  loading: false,

  setDate: async (date) => {
    set({ currentDate: date, loading: true });
    const diary = await diaryService.getDiary(date);
    set({ currentDiary: diary || null, loading: false });
  },

  loadDiary: async () => {
    const { currentDate } = get();
    set({ loading: true });
    const diary = await diaryService.getDiary(currentDate);
    set({ currentDiary: diary || null, loading: false });
  },

  save: async (entry) => {
    await diaryService.saveDiary(entry);
    set({ currentDiary: { ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
    // 刷新最近日期
    get().refreshRecentDates();
  },

  remove: async (date) => {
    await diaryService.deleteDiary(date);
    if (get().currentDate === date) {
      set({ currentDiary: null });
    }
    get().refreshRecentDates();
  },

  refreshRecentDates: async () => {
    const dates = await diaryService.getRecentDiaryDates(60);
    set({ recentDates: dates });
  },
}));
