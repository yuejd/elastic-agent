/**
 * Elastic Agentic Agent - Natural Language Interface
 * 
 * 自然语言接口：解析用户指令，执行 Elastic Agent 操作
 */

import { getAPI, ElasticAgentAPI } from './api';

export class NLInterface {
  private api: ElasticAgentAPI;

  constructor() {
    this.api = getAPI();
  }

  /**
   * 处理自然语言指令
   */
  async process(input: string): Promise<string> {
    const lower = input.toLowerCase();
    const lines: string[] = [];

    // 1. 初始化组织
    if (lower.includes('创办') || lower.includes('创建') || lower.includes('开始') || lower.includes('init')) {
      const goal = this.extractGoal(input);
      if (goal) {
        return await this.initOrg(goal);
      }
    }

    // 2. 查看状态
    if (lower.includes('状态') || lower.includes('status') || lower.includes('查看组织')) {
      return this.showStatus();
    }

    // 3. 招聘
    if (lower.includes('招聘') || lower.includes('spawn') || lower.includes('添加')) {
      return this.handleSpawn(input);
    }

    // 4. 下发任务
    if (lower.includes('任务') || lower.includes('分配') || lower.includes('做')) {
      return this.handleTask(input);
    }

    // 5. 分析
    if (lower.includes('分析') || lower.includes('需要')) {
      return this.analyze(input);
    }

    // 6. 建议
    if (lower.includes('建议') || lower.includes('推荐')) {
      return this.suggest(input);
    }

    // 7. 帮助
    if (lower.includes('帮助') || lower.includes('help')) {
      return this.help();
    }

    // 8. 运行完整流程
    if (lower.includes('运行') || lower.includes('执行') || lower.includes('run')) {
      return await this.runFullFlow(input);
    }

    return `我不理解这个指令："${input}"

可用指令：
- 创办[目标] - 初始化组织
- 查看状态 - 显示组织架构
- 招聘[角色] - 招聘新Agent
- 分配任务 - 下发任务
- 分析 - 分析招聘需求
- 建议 - 智能建议
- 帮助 - 显示帮助`;
  }

  /**
   * 初始化组织
   */
  private async initOrg(goal: string): Promise<string> {
    const result = this.api.init(goal);
    const lines: string[] = [];

    lines.push(`🎯 **组织目标**: ${goal}`);
    lines.push(`\n✅ **CEO 已就位** (${result.ceo.id})`);
    lines.push(`\n${this.api.printTree()}`);

    // 智能建议
    const suggestions = this.api.suggestRoles(goal);
    if (suggestions.length > 0) {
      lines.push(`\n💡 **建议招聘**: ${suggestions.join(', ')}`);
      lines.push(`\n使用 "招聘 [角色]" 来组建团队`);
    }

    return lines.join('\n');
  }

  /**
   * 显示状态
   */
  private showStatus(): string {
    const org = this.api.getOrg();
    if (!org) {
      return '组织未初始化。使用 "创办[目标]" 开始。';
    }

    const stats = this.api.getStats();
    return `📊 **组织状态**

目标: ${org.goal}

${this.api.printTree()}

统计: ${stats.totalAgents} 个 Agent
- 空闲: ${stats.byStatus.idle}
- 运行中: ${stats.byStatus.running}
- 已完成: ${stats.byStatus.completed}`;
  }

  /**
   * 处理招聘
   */
  private async handleSpawn(input: string): Promise<string> {
    const org = this.api.getOrg();
    if (!org) {
      return '组织未初始化。请先说"创办[目标]"';
    }

    // 提取角色
    const roles = this.extractRoles(input);
    if (roles.length === 0) {
      const suggestions = this.api.suggestRoles(org.goal);
      return `请指定要招聘的角色。可用角色：\n${suggestions.join(', ')}\n\n例如：招聘 CTO`;
    }

    const lines: string[] = [];

    for (const role of roles) {
      // 使用 CEO 作为父节点（简化）
      const parentId = org.root.id;
      
      const result = this.api.prepareSpawn(parentId, role);
      
      if (!result.success) {
        lines.push(`❌ ${role}: ${result.error}`);
        continue;
      }

      lines.push(`✅ 准备招聘 ${result.agent!.charter.title}`);
      lines.push(`Session: ${result.agent!.id}`);
    }

    lines.push(`\n${this.api.printTree()}`);
    return lines.join('\n');
  }

  /**
   * 处理任务
   */
  private async handleTask(input: string): Promise<string> {
    const org = this.api.getOrg();
    if (!org) {
      return '组织未初始化。请先说"创办[目标]"';
    }

    // 提取任务描述
    const taskDesc = input.replace(/^(任务|分配|做)/i, '').trim();
    
    if (!taskDesc) {
      return '请提供任务描述。例如：任务 开发用户登录功能';
    }

    // 选择一个 Agent（简化：选择非 CEO 的第一个）
    let targetAgent = org.root;
    if (org.root.children.length > 0) {
      targetAgent = org.root.children[0];
    }

    const result = this.api.prepareTask(targetAgent.id, taskDesc);
    if (!result.success) {
      return `❌ ${result.error}`;
    }

    return `📋 任务已准备\n\nAgent: ${targetAgent.charter.title}\n任务: ${result.task!.title}\nPrompt 长度: ${result.prompt?.length || 0} 字符`;
  }

  /**
   * 分析
   */
  private analyze(input: string): string {
    const org = this.api.getOrg();
    if (!org) {
      return '组织未初始化';
    }

    const goal = this.extractGoal(input) || org.goal;
    const decision = this.api.analyzeSpawnNeed(org.root.id, goal);

    if (decision.shouldSpawn) {
      return `🤔 **建议招聘**: ${decision.rolesNeeded?.join(', ')}\n\n原因: ${decision.reason}`;
    } else {
      return `✅ ${decision.reason}`;
    }
  }

  /**
   * 建议
   */
  private suggest(input: string): string {
    const org = this.api.getOrg();
    const goal = org?.goal || '通用目标';

    const suggestions = this.api.suggestRoles(goal);
    return `💡 **建议招聘的角色**:\n\n${suggestions.map(r => `- ${r}`).join('\n')}`;
  }

  /**
   * 帮助
   */
  private help(): string {
    return `📖 **Elastic Agent 命令**

• 创办[目标] - 初始化组织，例如：创办一个任务管理SaaS
• 查看状态 - 显示组织架构
• 招聘[角色] - 招聘新Agent，例如：招聘 CTO
• 分配任务 - 下发任务，例如：任务 设计用户界面
• 分析 - 分析招聘需求
• 建议 - 智能招聘建议
• 运行 - 执行完整流程
• 帮助 - 显示此帮助

**可用角色**: CEO, CTO, CMO, Product Manager, Frontend Dev, Backend Dev, DevOps, Content Writer, UX Designer`;
  }

  /**
   * 完整流程
   */
  private async runFullFlow(input: string): Promise<string> {
    const goal = this.extractGoal(input);
    if (!goal) {
      return '请提供目标。例如：运行 创办任务管理SaaS';
    }

    const lines: string[] = [];
    lines.push(`🚀 **开始执行**: ${goal}\n`);

    // 1. 初始化
    lines.push('📋 步骤 1: 初始化组织...');
    const init = this.api.init(goal);
    lines.push(`✅ CEO 就位\n`);

    // 2. 分析
    lines.push('🤔 步骤 2: 分析需求...');
    const suggestions = this.api.suggestRoles(goal);
    lines.push(`建议招聘: ${suggestions.join(', ')}\n`);

    // 3. 招聘
    lines.push('👥 步骤 3: 组建团队...');
    for (const role of suggestions.slice(0, 3)) {
      const result = this.api.prepareSpawn(init.ceo.id, role);
      if (result.success) {
        lines.push(`✅ 准备招聘 ${result.agent!.charter.title}`);
      }
    }

    lines.push(`\n${this.api.printTree()}`);
    lines.push('\n✨ 初始化完成！');

    return lines.join('\n');
  }

  // ==================== Helpers ====================

  /**
   * 提取目标
   */
  private extractGoal(input: string): string | null {
    // 去掉命令词
    const patterns = [
      /^创办(一个?)?/,
      /^创建(一个?)?/,
      /^开始/,
      /^init/i,
      /^运行/,
      /^执行/,
    ];

    let text = input;
    for (const p of patterns) {
      text = text.replace(p, '').trim();
    }

    if (text.length > 2) {
      return text;
    }
    return null;
  }

  /**
   * 提取角色
   */
  private extractRoles(input: string): string[] {
    const allRoles = ['ceo', 'cto', 'cmo', 'product-manager', 'frontend-dev', 'backend-dev', 'devops', 'content-writer', 'ux-designer'];
    const found: string[] = [];

    for (const role of allRoles) {
      if (input.toLowerCase().includes(role)) {
        found.push(role);
      }
    }

    return found;
  }
}

// ==================== Singleton ====================

let nlInstance: NLInterface | null = null;

export function getNLInterface(): NLInterface {
  if (!nlInstance) {
    nlInstance = new NLInterface();
  }
  return nlInstance;
}
