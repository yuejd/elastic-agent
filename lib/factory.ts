/**
 * Elastic Agentic Agent - Agent Factory
 * 
 * 封装 OpenClaw sessions_spawn，提供组织化的 Agent 创建能力
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  RoleCharter, 
  AgentNode, 
  AgentStatus,
  Task,
  OrgTree,
  OrgState,
  AgentNodeJSON,
  generateId,
  createCharter,
  createAgentNode 
} from './core';

// ==================== Constants ====================

const STATE_DIR = path.join(__dirname, '../state');
const ORG_FILE = path.join(STATE_DIR, 'org.json');

// ==================== Agent Factory ====================

/**
 * Agent Factory - 创建和管理 Agent
 */
export class AgentFactory {
  private org: OrgTree | null = null;
  private tasks: Map<string, Task> = new Map();

  constructor() {
    this.ensureStateDir();
  }

  // ==================== Organization Management ====================

  /**
   * 初始化组织
   */
  init(goal: string): OrgTree {
    const now = Date.now();
    
    // 创建 CEO 角色
    const ceoCharter = createCharter({
      title: 'CEO',
      mission: `达成组织目标：${goal}`,
      responsibilities: [
        '制定战略决策',
        '组建核心团队',
        '协调各部门工作',
        '向用户汇报最终结果',
      ],
      capabilities: ['战略规划', '团队管理', '决策制定'],
      canSpawn: true,
      maxDepth: 3,
      deliverables: ['最终成果汇报'],
    });

    const root = createAgentNode(ceoCharter);
    
    this.org = {
      id: generateId('org'),
      goal,
      root,
      allAgents: new Map([[root.id, root]]),
      createdAt: now,
      updatedAt: now,
    };

    this.saveState();
    return this.org;
  }

  /**
   * 加载已有组织
   */
  load(): OrgTree | null {
    if (!fs.existsSync(ORG_FILE)) {
      return null;
    }

    const state: OrgState = JSON.parse(fs.readFileSync(ORG_FILE, 'utf-8'));
    this.org = this.deserializeOrg(state);
    return this.org;
  }

  /**
   * 获取当前组织
   */
  getOrg(): OrgTree | null {
    return this.org;
  }

  // ==================== Agent Management ====================

  /**
   * 招聘新 Agent（Spawn）
   */
  spawn(parentId: string, roleParams: {
    title: string;
    mission: string;
    responsibilities: string[];
    capabilities?: string[];
    canSpawn?: boolean;
    maxDepth?: number;
    deliverables?: string[];
  }): AgentNode | null {
    if (!this.org) {
      throw new Error('组织未初始化，请先调用 init()');
    }

    const parent = this.org.allAgents.get(parentId);
    if (!parent) {
      throw new Error(`父 Agent 不存在: ${parentId}`);
    }

    if (!parent.charter.authority.canSpawn) {
      throw new Error(`Agent ${parentId} 没有招聘权限`);
    }

    // 创建角色
    const charter = createCharter({
      ...roleParams,
      parent: parentId,
    });

    const agent = createAgentNode(charter);
    
    // 添加到组织
    parent.children.push(agent);
    this.org.allAgents.set(agent.id, agent);
    this.org.updatedAt = Date.now();

    this.saveState();
    return agent;
  }

  /**
   * 获取 Agent
   */
  getAgent(agentId: string): AgentNode | undefined {
    return this.org?.allAgents.get(agentId);
  }

  /**
   * 更新 Agent 状态
   */
  updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.getAgent(agentId);
    if (agent) {
      agent.status = status;
      agent.updatedAt = Date.now();
      if (this.org) {
        this.org.updatedAt = Date.now();
      }
      this.saveState();
    }
  }

  /**
   * 分配任务给 Agent
   */
  assignTask(agentId: string, task: Task): void {
    const agent = this.getAgent(agentId);
    if (agent) {
      agent.currentTask = task;
      agent.status = 'running';
      agent.updatedAt = Date.now();
      this.tasks.set(task.id, task);
      this.saveState();
    }
  }

  /**
   * 添加汇报
   */
  addReport(report: { from: string; to: string; type: any; content: string; data?: any }): void {
    const agent = this.getAgent(report.to);
    if (agent) {
      agent.reports.push({
        id: generateId('report'),
        ...report,
        timestamp: Date.now(),
      });
      agent.updatedAt = Date.now();
      this.saveState();
    }
  }

  // ==================== Task Management ====================

  /**
   * 创建任务
   */
  createTask(params: {
    title: string;
    description: string;
    assignee: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Task {
    const now = Date.now();
    const task: Task = {
      id: generateId('task'),
      title: params.title,
      description: params.description,
      assignee: params.assignee,
      status: 'pending',
      priority: params.priority || 'medium',
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 更新任务状态
   */
  updateTask(taskId: string, updates: Partial<Task>): void {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates, { updatedAt: Date.now() });
      this.saveState();
    }
  }

  // ==================== Persistence ====================

  /**
   * 保存状态到文件
   */
  private saveState(): void {
    if (!this.org) return;

    this.ensureStateDir();
    const state = this.serializeOrg(this.org);
    fs.writeFileSync(ORG_FILE, JSON.stringify(state, null, 2), 'utf-8');
  }

  /**
   * 确保状态目录存在
   */
  private ensureStateDir(): void {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
  }

  /**
   * 序列化组织
   */
  private serializeOrg(org: OrgTree): OrgState {
    return {
      id: org.id,
      goal: org.goal,
      root: this.serializeNode(org.root),
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }

  /**
   * 序列化节点
   */
  private serializeNode(node: AgentNode): AgentNodeJSON {
    return {
      id: node.id,
      sessionKey: node.sessionKey,
      charter: node.charter,
      status: node.status,
      currentTaskId: node.currentTask?.id,
      children: node.children.map(c => this.serializeNode(c)),
      reports: node.reports,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    };
  }

  /**
   * 反序列化组织
   */
  private deserializeOrg(state: OrgState): OrgTree {
    const allAgents = new Map<string, AgentNode>();
    const root = this.deserializeNode(state.root, allAgents);

    return {
      id: state.id,
      goal: state.goal,
      root,
      allAgents,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }

  /**
   * 反序列化节点
   */
  private deserializeNode(json: AgentNodeJSON, allAgents: Map<string, AgentNode>): AgentNode {
    const node: AgentNode = {
      id: json.id,
      sessionKey: json.sessionKey,
      charter: json.charter,
      status: json.status,
      children: json.children.map(c => this.deserializeNode(c, allAgents)),
      reports: json.reports,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };

    allAgents.set(node.id, node);
    return node;
  }

  // ==================== Tree Operations ====================

  /**
   * 打印组织树
   */
  printTree(): string {
    if (!this.org) return '组织未初始化';
    return this.printNode(this.org.root, 0);
  }

  private printNode(node: AgentNode, depth: number): string {
    const indent = '  '.repeat(depth);
    const icon = this.getStatusIcon(node.status);
    let result = `${indent}${icon} ${node.charter.title} (${node.id})`;
    
    if (node.currentTask) {
      result += ` [任务: ${node.currentTask.title}]`;
    }
    
    result += '\n';
    
    for (const child of node.children) {
      result += this.printNode(child, depth + 1);
    }
    
    return result;
  }

  private getStatusIcon(status: AgentStatus): string {
    const icons: Record<AgentStatus, string> = {
      idle: '⚪',
      running: '🔵',
      waiting: '🟡',
      completed: '✅',
      failed: '❌',
    };
    return icons[status];
  }

  /**
   * 获取组织统计
   */
  getStats(): { totalAgents: number; byStatus: Record<AgentStatus, number> } {
    const stats = {
      totalAgents: this.org?.allAgents.size || 0,
      byStatus: {
        idle: 0,
        running: 0,
        waiting: 0,
        completed: 0,
        failed: 0,
      } as Record<AgentStatus, number>,
    };

    this.org?.allAgents.forEach(agent => {
      stats.byStatus[agent.status]++;
    });

    return stats;
  }
}

// ==================== Singleton ====================

let factoryInstance: AgentFactory | null = null;

export function getFactory(): AgentFactory {
  if (!factoryInstance) {
    factoryInstance = new AgentFactory();
  }
  return factoryInstance;
}
