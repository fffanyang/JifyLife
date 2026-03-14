/**
 * 知识卡片
 */
export interface KnowledgeCard {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  /** 关联卡片 ID 列表 */
  relatedCardIds: string[];
  /** 来源条目 ID */
  sourceEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 标签
 */
export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  count: number;
}
