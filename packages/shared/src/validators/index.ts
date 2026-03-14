import { z } from 'zod';

/** 登录请求校验 */
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
});

/** 注册请求校验 */
export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
  nickname: z.string().min(1, '昵称不能为空').max(30, '昵称最多 30 个字符'),
});

/** 创建条目请求校验 */
export const createEntrySchema = z.object({
  content: z.string().min(1, '内容不能为空').max(5000, '内容最多 5000 个字符'),
  type: z.enum(['schedule', 'memo', 'flow', 'checkin', 'knowledge']).optional(),
});

/** 生成日记请求校验 */
export const generateJournalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  mode: z.enum(['ai', 'template']),
  entryIds: z.array(z.string()).optional(),
  style: z.enum(['casual', 'formal', 'literary']).optional(),
});

/** 分页参数校验 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/** 日期范围校验 */
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** 创建打卡项校验 */
export const createCheckinItemSchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().default('✅'),
  category: z.enum(['habit', 'place', 'activity']),
});

/** 打卡记录校验 */
export const createCheckinRecordSchema = z.object({
  itemId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().max(500).optional(),
});

/** 知识卡片校验 */
export const createKnowledgeCardSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).default([]),
  relatedCardIds: z.array(z.string()).default([]),
});
