/**
 * Elastic Agentic Agent - Core Data Structures
 * 
 * 核心数据结构：组织树、角色宪章、任务
 */

// ==================== Role Charter ====================

/**
 * 角色宪章 - 定义一个 Agent 的身份和权限
 */
export interface RoleCharter {
  id: string;
  title: string;              // 职位名称
  mission: string;            // 核心使命（一句话）
  responsibilities: string[]; // 职责清单
  capabilities: string[];     // 所需能力
  authority: {
    canSpawn: boolean;        // 是否能招聘下级
    maxDepth?: number;        // 最大招聘深度
    budget?: number;          // 资源预算（可选）
  };
  deliverables: string[];     // 交付物清单
  parent?: string;            // 父 Agent ID
  createdAt: number;
}

// ==================== Agent Node ====================

/**
 * Agent 状态
 */
export type AgentStatus = 
  | 'idle'       // 空闲，等待任务
  | 'running'    // 执行中
  | 'waiting'    // 等待下级汇报
  | 'completed'  // 任务完成
  | 'failed';    // 执行失败

/**
 * Agent 节点 - 组织树中的一个节点
 */
export interface AgentNode {
  id: string;                  // Agent ID
  sessionKey?: string;         // OpenClaw session key
  charter: RoleCharter;        // 角色宪章
  status: AgentStatus;         // 当前状态
  currentTask?: Task;          // 当前任务
  children: AgentNode[];       // 下级 Agent
  reports: Report[];           // 收到的汇报
  createdAt: number;
  updatedAt: number;
}

// ==================== Task ====================

/**
 * 任务状态
 */
export type TaskStatus = 
  | 'pending'    // 待处理
  | 'assigned'   // 已分配
  | 'running'    // 执行中
  | 'completed'  // 已完成
  | 'failed';    // 失败

/**
 * 任务优先级
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * 任务
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;            // Agent ID
  status: TaskStatus;
  priority: TaskPriority;
  result?: string;             // 执行结果
  error?: string;              // 错误信息
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

// ==================== Report ====================

/**
 * 汇报 - 子 Agent 向父 Agent 汇报
 */
export interface Report {
  id: string;
  from: string;                // 汇报者 Agent ID
  to: string;                  // 接收者 Agent ID
  type: 'progress' | 'completed' | 'failed' | 'request';
  content: string;
  data?: any;                  // 额外数据
  timestamp: number;
}

// ==================== Org Tree ====================

/**
 * 组织树 - 整个 Agent 组织
 */
export interface OrgTree {
  id: string;                  // 组织 ID
  goal: string;                // 组织目标
  root: AgentNode;             // 根节点（通常是 CEO）
  allAgents: Map<string, AgentNode>;  // 快速查找表
  createdAt: number;
  updatedAt: number;
}

// ==================== Org State (for persistence) ====================

/**
 * 组织状态 - 用于持久化
 */
export interface OrgState {
  id: string;
  goal: string;
  root: AgentNodeJSON;         // JSON 可序列化的树
  createdAt: number;
  updatedAt: number;
}

/**
 * AgentNode 的 JSON 序列化形式
 */
export interface AgentNodeJSON {
  id: string;
  sessionKey?: string;
  charter: RoleCharter;
  status: AgentStatus;
  currentTaskId?: string;
  children: AgentNodeJSON[];
  reports: Report[];
  createdAt: number;
  updatedAt: number;
}

// ==================== Helper Functions ====================

/**
 * 生成唯一 ID
 */
export function generateId(prefix: string = 'agent'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建角色宪章
 */
export function createCharter(params: {
  title: string;
  mission: string;
  responsibilities: string[];
  capabilities?: string[];
  canSpawn?: boolean;
  maxDepth?: number;
  deliverables?: string[];
  parent?: string;
}): RoleCharter {
  return {
    id: generateId('charter'),
    title: params.title,
    mission: params.mission,
    responsibilities: params.responsibilities,
    capabilities: params.capabilities || [],
    authority: {
      canSpawn: params.canSpawn ?? false,
      maxDepth: params.maxDepth,
    },
    deliverables: params.deliverables || [],
    parent: params.parent,
    createdAt: Date.now(),
  };
}

/**
 * 创建 Agent 节点
 */
export function createAgentNode(charter: RoleCharter): AgentNode {
  return {
    id: charter.id,
    charter,
    status: 'idle',
    children: [],
    reports: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 创建任务
 */
export function createTask(params: {
  title: string;
  description: string;
  assignee: string;
  priority?: TaskPriority;
}): Task {
  const now = Date.now();
  return {
    id: generateId('task'),
    title: params.title,
    description: params.description,
    assignee: params.assignee,
    status: 'pending',
    priority: params.priority || 'medium',
    createdAt: now,
    updatedAt: now,
  };
}
