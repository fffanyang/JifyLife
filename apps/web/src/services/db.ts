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

// v3: 新增 food（吃了什么）和 drink（喝了什么）字段
db.version(3).stores({
  diaries: 'date',
}).upgrade(tx => {
  return tx.table('diaries').toCollection().modify((entry: any) => {
    if (entry.food === undefined) entry.food = '';
    if (entry.drink === undefined) entry.drink = '';
  });
});

// v4: 马伯庸式字段体系重构
// 新增: events(今日事), people(见了谁), ideas(灵感), reading(读了什么)
// 合并: drink → food, study → reading
// 移除: drink, expense, fitness, study
db.version(4).stores({
  diaries: 'date',
}).upgrade(tx => {
  return tx.table('diaries').toCollection().modify((entry: any) => {
    // 新增字段
    if (entry.events === undefined) entry.events = '';
    if (entry.people === undefined) entry.people = '';
    if (entry.ideas === undefined) entry.ideas = '';

    // drink 合并到 food
    if (entry.drink?.trim()) {
      entry.food = [entry.food || '', entry.drink].filter(s => s.trim()).join('\n');
    }
    delete entry.drink;

    // study 合并到 reading
    if (entry.study !== undefined) {
      entry.reading = entry.study;
      delete entry.study;
    } else if (entry.reading === undefined) {
      entry.reading = '';
    }

    // 将 expense 和 fitness 的内容合并到 events（不丢失数据）
    const extraEvents: string[] = [];
    if (entry.expense?.trim()) extraEvents.push(entry.expense.trim());
    if (entry.fitness?.trim()) extraEvents.push(entry.fitness.trim());
    if (extraEvents.length > 0) {
      entry.events = [entry.events || '', ...extraEvents].filter(s => s.trim()).join('\n');
    }
    delete entry.expense;
    delete entry.fitness;
  });
});

// v5: 精简到 6 字段 — people(见了谁) 合并到 events(今日事)
db.version(5).stores({
  diaries: 'date',
}).upgrade(tx => {
  return tx.table('diaries').toCollection().modify((entry: any) => {
    if (entry.people?.trim()) {
      entry.events = [entry.events || '', entry.people].filter(s => s.trim()).join('\n');
    }
    delete entry.people;
  });
});

export { db };
