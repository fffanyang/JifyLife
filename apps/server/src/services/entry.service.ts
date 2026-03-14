import { PrismaClient } from '@prisma/client';
import type { ContentAnalysis } from '@jifylife/shared';
import { analyzeContent } from './ai/ai.service.js';

const prisma = new PrismaClient();

export async function createEntry(userId: string, content: string, manualType?: string) {
  // 1. 先创建一条 pending 状态的条目
  const entry = await prisma.entry.create({
    data: {
      userId,
      content,
      type: manualType || 'flow',
      status: manualType ? 'done' : 'pending',
      timestamp: new Date(),
    },
  });

  // 2. 如果没有手动指定类型，异步进行 AI 分析
  if (!manualType) {
    // 先标记为 processing
    await prisma.entry.update({
      where: { id: entry.id },
      data: { status: 'processing' },
    });

    try {
      const analysis = await analyzeContent(content);
      const updated = await prisma.entry.update({
        where: { id: entry.id },
        data: {
          type: analysis.type,
          confidence: analysis.confidence,
          parsedData: JSON.stringify(analysis.parsedData),
          tags: JSON.stringify(analysis.tags),
          status: 'done',
        },
      });
      return formatEntry(updated);
    } catch {
      // AI 分析失败，降级为流水账
      const updated = await prisma.entry.update({
        where: { id: entry.id },
        data: { status: 'done', type: 'flow' },
      });
      return formatEntry(updated);
    }
  }

  return formatEntry(entry);
}

export async function getEntries(userId: string, page = 1, pageSize = 20, type?: string) {
  const where: any = { userId };
  if (type) where.type = type;

  const [items, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.entry.count({ where }),
  ]);

  return {
    items: items.map(formatEntry),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getEntryById(userId: string, id: string) {
  const entry = await prisma.entry.findFirst({ where: { id, userId } });
  if (!entry) throw new Error('条目不存在');
  return formatEntry(entry);
}

export async function updateEntry(userId: string, id: string, data: { content?: string; type?: string; tags?: string[] }) {
  const entry = await prisma.entry.findFirst({ where: { id, userId } });
  if (!entry) throw new Error('条目不存在');

  const updated = await prisma.entry.update({
    where: { id },
    data: {
      ...(data.content && { content: data.content }),
      ...(data.type && { type: data.type }),
      ...(data.tags && { tags: JSON.stringify(data.tags) }),
    },
  });
  return formatEntry(updated);
}

export async function deleteEntry(userId: string, id: string) {
  const entry = await prisma.entry.findFirst({ where: { id, userId } });
  if (!entry) throw new Error('条目不存在');
  await prisma.entry.delete({ where: { id } });
}

function formatEntry(entry: any) {
  return {
    ...entry,
    parsedData: typeof entry.parsedData === 'string' ? JSON.parse(entry.parsedData) : entry.parsedData,
    tags: typeof entry.tags === 'string' ? JSON.parse(entry.tags) : entry.tags,
    timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : entry.timestamp,
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
    updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : entry.updatedAt,
  };
}
