/**
 * Elastic Agent - Demo Script
 * 
 * 端到端演示：输入目标 → 自动构建组织 → 执行任务
 */

import { ElasticAgentAPI } from './api';

async function main() {
  console.log('=== Elastic Agent 端到端演示 ===\n');

  const api = new ElasticAgentAPI();
  const goal = '创办一个任务管理 SaaS 产品，实现盈利';

  // 步骤 1: 初始化组织
  console.log('📋 步骤 1: 初始化组织');
  console.log(`目标: ${goal}\n`);

  const init = api.init(goal);
  console.log(`✅ CEO 已就位: ${init.ceo.id}`);
  console.log(api.printTree());

  // 步骤 2: 分析需求
  console.log('\n🤔 步骤 2: 分析招聘需求');
  const suggestions = api.suggestRoles(goal);
  console.log(`建议招聘: ${suggestions.join(', ')}`);

  // 步骤 3: 招聘 CTO
  console.log('\n👥 步骤 3: 招聘 CTO');
  const ctoResult = api.prepareSpawn(init.ceo.id, 'cto');
  if (ctoResult.success) {
    console.log(`✅ CTO 已就位: ${ctoResult.agent!.id}`);
    
    // Spawn CTO Agent
    const spawnResult = await sessions_spawn({
      runtime: 'subagent',
      mode: 'run',
      label: `elastic-cto`,
      task: ctoResult.systemPrompt!,
    });
    
    api.updateStatus(ctoResult.agent!.id, 'running', spawnResult.childSessionKey);
    console.log(`   Session: ${spawnResult.childSessionKey}`);
  }

  // 步骤 4: CTO 招聘下级
  console.log('\n👥 步骤 4: CTO 招聘技术团队');
  if (ctoResult.success && ctoResult.agent) {
    const frontend = api.prepareSpawn(ctoResult.agent.id, 'frontend-dev');
    if (frontend.success) {
      console.log(`✅ 前端工程师已就位: ${frontend.agent!.id}`);
    }

    const backend = api.prepareSpawn(ctoResult.agent.id, 'backend-dev');
    if (backend.success) {
      console.log(`✅ 后端工程师已就位: ${backend.agent!.id}`);
    }
  }

  // 步骤 5: 显示最终组织
  console.log('\n📊 步骤 5: 最终组织架构');
  console.log(api.printTree());

  const stats = api.getStats();
  console.log(`\n统计: ${stats.totalAgents} 个 Agent`);
  console.log(`- 空闲: ${stats.byStatus.idle}`);
  console.log(`- 运行中: ${stats.byStatus.running}`);

  console.log('\n✅ 演示完成！');
  console.log('\n使用方法:');
  console.log('- 查看状态: api.getOrg()');
  console.log('- 下发任务: api.prepareTask(agentId, taskDesc)');
  console.log('- 招聘更多: api.prepareSpawn(parentId, templateId)');
}

// Sessions wrapper (mock for testing)
async function sessions_spawn(params: any): Promise<any> {
  // 在实际运行时，这会被真实的 sessions_spawn 替换
  return {
    childSessionKey: `mock-session-${Date.now()}`,
    status: 'accepted',
  };
}

main().catch(console.error);
