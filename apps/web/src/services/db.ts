/**
 * 本地数据库 - 基于 Dexie.js (IndexedDB)
 * 日记数据全部存在手机浏览器本地
 */
import Dexie, { type EntityTable } from 'dexie';
import type { DiaryEntry } from '@/types/diary';

const db = new Dexie('MaBoyongDiary') as Dexie & {
  diaries: EntityTable<DiaryEntry, 'date'>;
};

db.version(1).stores({
  diaries: 'date',
});

// v2: 字段重命名 tasks→work, reading→study, input→fitness, output→expense, life→mood
db.version(2).stores({
  diaries: 'date',
}).upgrade(tx => {
  return tx.table('diaries').toCollection().modify((entry: any) => {
    // 将旧字段迁移到新字段
    if (entry.tasks !== undefined && entry.work === undefined) {
      entry.work = entry.tasks;
      delete entry.tasks;
    }
    if (entry.reading !== undefined && entry.study === undefined) {
      entry.study = entry.reading;
      delete entry.reading;
    }
    if (entry.input !== undefined && entry.fitness === undefined) {
      entry.fitness = entry.input;
      delete entry.input;
    }
    if (entry.output !== undefined && entry.expense === undefined) {
      entry.expense = entry.output;
      delete entry.output;
    }
    if (entry.life !== undefined && entry.mood === undefined) {
      entry.mood = entry.life;
      delete entry.life;
    }
  });
});

export { db };
