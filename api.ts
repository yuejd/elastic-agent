/**
 * Elastic Agentic Agent - API Layer
 * 
 * 纯逻辑层，不直接调用 OpenClaw sessions_spawn
 * 由外部调用者执行实际的 spawn
 */

import {
  AgentFactory,
  getFactory,
  createRoleFromTemplate,
  buildAgentSystemPrompt,
  buildTaskPrompt,
  analyzeSpawnNeed,
  AgentNode,
  Task,
  OrgTree,
} from './lib/index';

// ==================== Elastic Agent API ====================

export class ElasticAgentAPI {
  private factory: AgentFactory;

  constructor() {
    this.factory = getFactory();
  }

  // ==================== Organization ====================

  /**
   * 初始化组织
   */
  init(goal: string): { 
    orgId: string; 
    ceo: AgentNode; 
    systemPrompt: string;
  } {
    const org = this.factory.init(goal);
    const ceo = org.root;
    const systemPrompt = buildAgentSystemPrompt(ceo, org.goal);
    
    return {
      orgId: org.id,
      ceo,
      systemPrompt,
    };
  }

  /**
   * 获取组织
   */
  getOrg(): OrgTree | null {
    return this.factory.getOrg();
  }

  /**
   * 打印组织树
   */
  printTree(): string {
    return this.factory.printTree();
  }

  /**
   * 获取统计
   */
  getStats(): any {
    return this.factory.getStats();
  }

  // ==================== Agent Management ====================

  /**
   * 准备招聘（返回需要的信息）
   */
  prepareSpawn(
    parentId: string,
    templateId: string
  ): {
    success: boolean;
    agent?: AgentNode;
    systemPrompt?: string;
    error?: string;
  } {
    const org = this.factory.getOrg();
    if (!org) {
      return { success: false, error: '组织未初始化' };
    }

    const parent = org.allAgents.get(parentId);
    if (!parent) {
      return { success: false, error: `父 Agent 不存在: ${parentId}` };
    }

    if (!parent.charter.authority.canSpawn) {
      return { success: false, error: `${parent.charter.title} 没有招聘权限` };
    }

    const charter = createRoleFromTemplate(templateId, parentId);
    if (!charter) {
      return { success: false, error: `模板不存在: ${templateId}` };
    }

    const agent = this.factory.spawn(parentId, {
      title: charter.title,
      mission: charter.mission,
      responsibilities: charter.responsibilities,
      capabilities: charter.capabilities,
      canSpawn: charter.authority.canSpawn,
      maxDepth: charter.authority.maxDepth,
      deliverables: charter.deliverables,
    });

    if (!agent) {
      return { success: false, error: '创建 Agent 失败' };
    }

    const systemPrompt = buildAgentSystemPrompt(agent, org.goal);

    return {
      success: true,
      agent,
      systemPrompt,
    };
  }

  /**
   * 更新 Agent 状态
   */
  updateStatus(agentId: string, status: string, sessionKey?: string): void {
    const agent = this.factory.getAgent(agentId);
    if (agent) {
      if (sessionKey) {
        agent.sessionKey = sessionKey;
      }
      this.factory.updateAgentStatus(agentId, status as any);
    }
  }

  /**
   * 获取 Agent
   */
  getAgent(agentId: string): AgentNode | undefined {
    return this.factory.getAgent(agentId);
  }

  // ==================== Task Management ====================

  /**
   * 准备任务（返回需要的信息）
   */
  prepareTask(
    agentId: string,
    taskDescription: string
  ): {
    success: boolean;
    task?: Task;
    prompt?: string;
    error?: string;
  } {
    const org = this.factory.getOrg();
    if (!org) {
      return { success: false, error: '组织未初始化' };
    }

    const agent = org.allAgents.get(agentId);
    if (!agent) {
      return { success: false, error: `Agent 不存在: ${agentId}` };
    }

    const task = this.factory.createTask({
      title: taskDescription.split('\n')[0],
      description: taskDescription,
      assignee: agentId,
    });

    this.factory.assignTask(agentId, task);

    const prompt = buildTaskPrompt(task, `你的上级是 ${agent.charter.parent || 'CEO'}`);

    return {
      success: true,
      task,
      prompt,
    };
  }

  // ==================== Analysis ====================

  /**
   * 分析是否需要招聘
   */
  analyzeSpawnNeed(agentId: string, taskDescription: string): any {
    const agent = this.factory.getAgent(agentId);
    if (!agent) {
      return { shouldSpawn: false, reason: 'Agent 不存在' };
    }

    const task = {
      id: 'temp',
      title: '分析任务',
      description: taskDescription,
      assignee: agentId,
      status: 'pending' as const,
      priority: 'medium' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return analyzeSpawnNeed(agent, task);
  }

  /**
   * 智能招聘建议
   */
  suggestRoles(goal: string): string[] {
    const roles: string[] = [];
    const lower = goal.toLowerCase();

    if (lower.includes('saaS') || lower.includes('网站') || lower.includes('产品')) {
      roles.push('cto', 'product-manager');
    }

    if (lower.includes('盈利') || lower.includes('营销') || lower.includes('推广')) {
      roles.push('cmo', 'content-writer');
    }

    if (lower.includes('设计') || lower.includes('体验')) {
      roles.push('ux-designer');
    }

    if (lower.includes('开发') || lower.includes('技术')) {
      roles.push('frontend-dev', 'backend-dev');
    }

    // 默认技术团队
    if (roles.length === 0) {
      roles.push('cto');
    }

    return [...new Set(roles)];
  }

  // ==================== Report Collection ====================

  /**
   * 收集汇报
   */
  collectReports(): any[] {
    const org = this.factory.getOrg();
    if (!org) return [];

    const reports: any[] = [];
    
    org.allAgents.forEach(agent => {
      if (agent.reports.length > 0) {
        reports.push(...agent.reports);
      }
    });

    return reports;
  }

  /**
   * 添加汇报
   */
  addReport(from: string, to: string, type: string, content: string): void {
    this.factory.addReport({ from, to, type, content });
  }
}

// ==================== Singleton ====================

let apiInstance: ElasticAgentAPI | null = null;

export function getAPI(): ElasticAgentAPI {
  if (!apiInstance) {
    apiInstance = new ElasticAgentAPI();
  }
  return apiInstance;
}
