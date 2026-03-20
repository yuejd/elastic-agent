/**
 * Elastic Agentic Agent - Protocol
 * 
 * 通信协议：任务下发、结果汇报、自动招聘决策
 */

import { 
  AgentNode, 
  Task, 
  Report,
  RoleCharter,
  createTask,
  generateId,
} from './core';

// ==================== Message Types ====================

/**
 * 消息类型
 */
export type MessageType = 
  | 'task_assign'      // 下发任务
  | 'task_update'      // 更新任务
  | 'report_progress'  // 汇报进度
  | 'report_result'    // 汇报结果
  | 'request_help'     // 请求帮助
  | 'spawn_request';   // 请求招聘

/**
 * 消息
 */
export interface Message {
  id: string;
  type: MessageType;
  from: string;        // Agent ID
  to: string;          // Agent ID
  payload: any;
  timestamp: number;
}

// ==================== Task Assignment ====================

/**
 * 构建任务下发消息
 */
export function buildTaskAssignment(
  fromAgent: AgentNode,
  toAgent: AgentNode,
  taskDescription: string
): { message: Message; task: Task } {
  const task = createTask({
    title: taskDescription.split('\n')[0],  // 第一行作为标题
    description: taskDescription,
    assignee: toAgent.id,
  });

  const message: Message = {
    id: generateId('msg'),
    type: 'task_assign',
    from: fromAgent.id,
    to: toAgent.id,
    payload: {
      taskId: task.id,
      taskDescription,
      context: {
        parentRole: fromAgent.charter.title,
        parentMission: fromAgent.charter.mission,
      },
    },
    timestamp: Date.now(),
  };

  return { message, task };
}

// ==================== Report Protocol ====================

/**
 * 构建进度汇报
 */
export function buildProgressReport(
  fromAgent: AgentNode,
  toAgentId: string,
  progress: string,
  percentage: number
): Message {
  return {
    id: generateId('msg'),
    type: 'report_progress',
    from: fromAgent.id,
    to: toAgentId,
    payload: {
      progress,
      percentage,
      taskId: fromAgent.currentTask?.id,
    },
    timestamp: Date.now(),
  };
}

/**
 * 构建结果汇报
 */
export function buildResultReport(
  fromAgent: AgentNode,
  toAgentId: string,
  result: string,
  success: boolean
): Message {
  return {
    id: generateId('msg'),
    type: 'report_result',
    from: fromAgent.id,
    to: toAgentId,
    payload: {
      result,
      success,
      taskId: fromAgent.currentTask?.id,
      deliverables: fromAgent.charter.deliverables,
    },
    timestamp: Date.now(),
  };
}

// ==================== Auto-Spawn Decision ====================

/**
 * 招聘决策
 */
export interface SpawnDecision {
  shouldSpawn: boolean;
  reason: string;
  rolesNeeded?: string[];
}

/**
 * 分析是否需要招聘（基于任务和当前能力）
 */
export function analyzeSpawnNeed(
  agent: AgentNode,
  task: Task
): SpawnDecision {
  // 如果没有招聘权限，直接返回
  if (!agent.charter.authority.canSpawn) {
    return {
      shouldSpawn: false,
      reason: '没有招聘权限',
    };
  }

  // 如果已有足够的下级，可能不需要再招
  if (agent.children.length >= 5) {
    return {
      shouldSpawn: false,
      reason: '已达招聘上限',
    };
  }

  // 简单规则：任务描述中包含关键词时建议招聘
  const keywords = analyzeTaskKeywords(task.description);
  
  if (keywords.length > 0) {
    return {
      shouldSpawn: true,
      reason: `任务需要以下专业能力：${keywords.join(', ')}`,
      rolesNeeded: mapKeywordsToRoles(keywords),
    };
  }

  // 任务复杂度高时建议招聘
  const complexity = estimateTaskComplexity(task);
  if (complexity > 0.7) {
    return {
      shouldSpawn: true,
      reason: '任务复杂度高，建议分解',
      rolesNeeded: suggestRolesForComplexTask(task),
    };
  }

  return {
    shouldSpawn: false,
    reason: '当前能力足够完成任务',
  };
}

/**
 * 分析任务关键词
 */
function analyzeTaskKeywords(description: string): string[] {
  const keywords: string[] = [];
  const lower = description.toLowerCase();

  const keywordMap: Record<string, string> = {
    '前端': 'frontend',
    '界面': 'frontend',
    'ui': 'frontend',
    '后端': 'backend',
    'api': 'backend',
    '数据库': 'backend',
    '部署': 'devops',
    '运维': 'devops',
    '营销': 'marketing',
    '推广': 'marketing',
    '内容': 'content',
    '文案': 'content',
    '设计': 'design',
    '体验': 'design',
  };

  for (const [keyword, capability] of Object.entries(keywordMap)) {
    if (lower.includes(keyword) && !keywords.includes(capability)) {
      keywords.push(capability);
    }
  }

  return keywords;
}

/**
 * 关键词映射到角色
 */
function mapKeywordsToRoles(keywords: string[]): string[] {
  const roleMap: Record<string, string[]> = {
    'frontend': ['frontend-dev'],
    'backend': ['backend-dev'],
    'devops': ['devops'],
    'marketing': ['content-writer'],
    'content': ['content-writer'],
    'design': ['ux-designer'],
  };

  const roles: string[] = [];
  for (const keyword of keywords) {
    const mapped = roleMap[keyword];
    if (mapped) {
      roles.push(...mapped);
    }
  }

  return [...new Set(roles)];  // 去重
}

/**
 * 估算任务复杂度（0-1）
 */
function estimateTaskComplexity(task: Task): number {
  let score = 0;

  // 长度
  if (task.description.length > 500) score += 0.2;
  if (task.description.length > 1000) score += 0.2;

  // 关键词数量
  const keywords = analyzeTaskKeywords(task.description);
  score += keywords.length * 0.1;

  // 优先级
  if (task.priority === 'urgent') score += 0.2;
  if (task.priority === 'high') score += 0.1;

  return Math.min(score, 1);
}

/**
 * 为复杂任务建议角色
 */
function suggestRolesForComplexTask(task: Task): string[] {
  // 默认建议技术团队
  return ['frontend-dev', 'backend-dev'];
}

// ==================== Prompt Builders ====================

/**
 * 构建 Agent 系统提示词
 */
export function buildAgentSystemPrompt(
  agent: AgentNode,
  orgGoal: string
): string {
  return `你是【${agent.charter.title}】。

## 组织背景
组织目标：${orgGoal}

## 你的角色
- **职位**：${agent.charter.title}
- **使命**：${agent.charter.mission}
- **职责**：
${agent.charter.responsibilities.map(r => `  - ${r}`).join('\n')}

## 你的能力
${agent.charter.capabilities.map(c => `  - ${c}`).join('\n')}

## 你的权限
- ${agent.charter.authority.canSpawn ? '✅ 可以招聘下级 Agent' : '❌ 不能招聘下级'}
${agent.charter.authority.maxDepth ? `- 最大招聘深度：${agent.charter.authority.maxDepth}` : ''}

## 你的交付物
${agent.charter.deliverables.map(d => `  - ${d}`).join('\n')}

## 工作原则
1. 只关注自己的职责范围
2. 如需跨部门协作，通过父 Agent 协调
3. 定期向父 Agent 汇报进度
4. 完成后提交完整的交付物

## Elastic Agent 协议
${agent.charter.authority.canSpawn ? `
当你认为任务需要下级支持时，输出：
\`\`\`json
{
  "action": "spawn",
  "roles": ["角色ID"],
  "reason": "招聘原因"
}
\`\`\`
` : ''}
当你完成任务时，输出：
\`\`\`json
{
  "action": "complete",
  "result": "你的工作成果",
  "deliverables": ["交付物列表"]
}
\`\`\`

现在，请基于你的角色和职责开始工作。`;
}

/**
 * 构建任务提示词
 */
export function buildTaskPrompt(task: Task, context?: string): string {
  return `## 你的任务

**标题**：${task.title}

**描述**：
${task.description}

**优先级**：${task.priority}

${context ? `**背景**：\n${context}` : ''}

请完成这个任务，并在完成后提交交付物。`;
}
