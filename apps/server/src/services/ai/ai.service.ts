import type { ContentAnalysis } from '@jifylife/shared';

/**
 * 分析用户输入内容，识别意图和结构化数据
 * 当前使用基于规则的模板引擎，后续可接入 LLM
 */
export async function analyzeContent(content: string): Promise<ContentAnalysis> {
  const lower = content.toLowerCase();

  // 规则引擎：根据关键词和模式识别内容类型
  // 日程识别
  const timePatterns = /(\d{1,2}[点:：]\d{0,2}|上午|下午|明天|后天|下周|今天.*[要会])/;
  const scheduleKeywords = /开会|会议|面试|约|预约|上课|考试|交|提交|deadline|截止/;
  if (timePatterns.test(content) && scheduleKeywords.test(content)) {
    return {
      type: 'schedule',
      confidence: 0.85,
      parsedData: {
        title: content.replace(/提醒我|记一下|别忘了/g, '').trim(),
        datetime: extractTime(content),
      },
      tags: ['日程'],
    };
  }

  // 备忘识别
  const memoKeywords = /记一下|备忘|别忘了|提醒我|记得|注意|TODO|待办/;
  if (memoKeywords.test(content)) {
    return {
      type: 'memo',
      confidence: 0.80,
      parsedData: {
        title: content.replace(/记一下|备忘|别忘了|提醒我|记得/g, '').trim(),
        reminder: extractTime(content),
      },
      tags: ['备忘'],
    };
  }

  // 打卡识别
  const checkinKeywords = /打卡|跑了|跑步|锻炼|运动|喝水|阅读|读了|学了|练了|做了.*组/;
  if (checkinKeywords.test(content)) {
    const item = extractCheckinItem(content);
    return {
      type: 'checkin',
      confidence: 0.75,
      parsedData: {
        checkinItem: item,
        title: `${item} 打卡`,
      },
      tags: ['打卡', item],
    };
  }

  // 知识识别
  const knowledgeKeywords = /学到|知识|原来|TIL|发现了|了解到|科普|知道了/;
  if (knowledgeKeywords.test(content)) {
    return {
      type: 'knowledge',
      confidence: 0.70,
      parsedData: {
        title: content.substring(0, 50),
      },
      tags: ['知识'],
    };
  }

  // 默认为流水账
  return {
    type: 'flow',
    confidence: 0.60,
    parsedData: {},
    tags: extractFlowTags(content),
  };
}

/**
 * 根据流水账条目生成日记（模板模式）
 */
export async function generateJournalTemplate(entries: Array<{ content: string; timestamp: string }>, date: string): Promise<string> {
  if (entries.length === 0) return `# ${date} 的日记\n\n今天没有记录。`;

  const lines = entries
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return `- **${time}** ${e.content}`;
    });

  return `# ${date} 的日记\n\n今天共记录了 ${entries.length} 件事：\n\n${lines.join('\n\n')}\n\n---\n*由 JifyLife 模板引擎生成*`;
}

// --- 辅助函数 ---

function extractTime(content: string): string | undefined {
  const match = content.match(/(\d{1,2})[点:：](\d{0,2})/);
  if (match) {
    const hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const now = new Date();
    now.setHours(hour, minute, 0, 0);
    return now.toISOString();
  }
  if (/明天/.test(content)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString();
  }
  return undefined;
}

function extractCheckinItem(content: string): string {
  const patterns: [RegExp, string][] = [
    [/跑了|跑步/, '跑步'],
    [/喝水/, '喝水'],
    [/阅读|读了|读书/, '阅读'],
    [/锻炼|运动|健身/, '运动'],
    [/学了|学习/, '学习'],
    [/冥想/, '冥想'],
    [/早起/, '早起'],
  ];
  for (const [pattern, item] of patterns) {
    if (pattern.test(content)) return item;
  }
  return '打卡';
}

function extractFlowTags(content: string): string[] {
  const tags: string[] = [];
  const tagPatterns: [RegExp, string][] = [
    [/吃了|吃饭|午饭|晚饭|早餐|午餐|晚餐|面|饭|火锅|烧烤/, '餐饮'],
    [/咖啡|奶茶|茶/, '饮品'],
    [/电影|剧|综艺|看了/, '娱乐'],
    [/工作|项目|开发|写了|做了/, '工作'],
    [/散步|走了|逛了|出去/, '外出'],
  ];
  for (const [pattern, tag] of tagPatterns) {
    if (pattern.test(content)) tags.push(tag);
  }
  return tags.length > 0 ? tags : ['日常'];
}
