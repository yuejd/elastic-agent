/**
 * Elastic Agentic Agent - Test Suite
 * 
 * 测试核心功能
 */

const path = require('path');
const fs = require('fs');

// 确保可以加载模块
const libDir = path.join(__dirname, 'lib');
const templatesDir = path.join(__dirname, 'templates');

console.log('=== Elastic Agent 测试 ===\n');

// ==================== Test 1: Core Data Structures ====================

console.log('📋 测试 1: 核心数据结构');

try {
  const { 
    RoleCharter, 
    AgentNode, 
    Task,
    createCharter,
    createAgentNode,
    createTask,
    generateId,
  } = require('./lib/core');

  // 创建角色
  const charter = createCharter({
    title: 'Test CEO',
    mission: '测试使命',
    responsibilities: ['职责1', '职责2'],
    capabilities: ['能力1'],
    canSpawn: true,
  });

  console.log('  ✅ 创建角色:', charter.title);

  // 创建 Agent
  const agent = createAgentNode(charter);
  console.log('  ✅ 创建 Agent:', agent.id);

  // 创建任务
  const task = createTask({
    title: '测试任务',
    description: '这是一个测试任务',
    assignee: agent.id,
  });
  console.log('  ✅ 创建任务:', task.id);

  console.log('✅ 测试 1 通过\n');
} catch (err: any) {
  console.error('❌ 测试 1 失败:', err.message);
  process.exit(1);
}

// ==================== Test 2: Agent Factory ====================

console.log('📋 测试 2: Agent Factory');

try {
  const { AgentFactory } = require('./lib/factory');

  const factory = new AgentFactory();

  // 初始化组织
  const org = factory.init('创建一个测试产品');
  console.log('  ✅ 初始化组织:', org.goal);
  console.log('  ✅ CEO ID:', org.root.id);

  // 招聘 CTO
  const cto = factory.spawn(org.root.id, {
    title: 'CTO',
    mission: '负责技术',
    responsibilities: ['技术架构', '团队管理'],
    canSpawn: true,
  });
  console.log('  ✅ 招聘 CTO:', cto?.id);

  // 招聘前端
  const frontend = factory.spawn(cto!.id, {
    title: 'Frontend Dev',
    mission: '前端开发',
    responsibilities: ['UI开发'],
    canSpawn: false,
  });
  console.log('  ✅ 招聘前端:', frontend?.id);

  // 打印组织树
  const tree = factory.printTree();
  console.log('  ✅ 组织树:\n' + tree.split('\n').map((l: string) => '    ' + l).join('\n'));

  // 统计
  const stats = factory.getStats();
  console.log('  ✅ 统计:', stats);

  console.log('✅ 测试 2 通过\n');
} catch (err: any) {
  console.error('❌ 测试 2 失败:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// ==================== Test 3: Role Templates ====================

console.log('📋 测试 3: 角色模板');

try {
  const { 
    getRoleTemplate, 
    createRoleFromTemplate,
    listAvailableRoles,
  } = require('./templates/roles');

  const roles = listAvailableRoles();
  console.log('  ✅ 可用角色:', roles.join(', '));

  const ctoTemplate = getRoleTemplate('cto');
  console.log('  ✅ CTO 模板:', ctoTemplate?.title);

  const ctoRole = createRoleFromTemplate('cto', 'parent-123');
  console.log('  ✅ 创建 CTO 角色:', ctoRole?.id);

  console.log('✅ 测试 3 通过\n');
} catch (err: any) {
  console.error('❌ 测试 3 失败:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// ==================== Test 4: Protocol ====================

console.log('📋 测试 4: 通信协议');

try {
  const { 
    buildAgentSystemPrompt,
    analyzeSpawnNeed,
  } = require('./lib/protocol');
  const { createAgentNode, createCharter } = require('./lib/core');

  const charter = createCharter({
    title: 'CTO',
    mission: '负责技术',
    responsibilities: ['架构设计', '团队管理'],
    capabilities: ['技术', '管理'],
    canSpawn: true,
  });

  const agent = createAgentNode(charter);

  const prompt = buildAgentSystemPrompt(agent, '创建一个SaaS产品');
  console.log('  ✅ 系统提示词长度:', prompt.length);
  console.log('  ✅ 包含职位:', prompt.includes('CTO'));

  const task = {
    id: 'test-task',
    title: '开发前端',
    description: '需要前端开发能力',
    assignee: agent.id,
    status: 'pending' as const,
    priority: 'medium' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const decision = analyzeSpawnNeed(agent, task);
  console.log('  ✅ 招聘决策:', decision.shouldSpawn ? '需要招聘' : '不需要招聘');
  console.log('  ✅ 原因:', decision.reason);

  console.log('✅ 测试 4 通过\n');
} catch (err: any) {
  console.error('❌ 测试 4 失败:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// ==================== Test 5: API Layer ====================

console.log('📋 测试 5: API 层');

try {
  const { ElasticAgentAPI } = require('./api');

  const api = new ElasticAgentAPI();

  // 初始化
  const init = api.init('创办一个任务管理SaaS');
  console.log('  ✅ 初始化:', init.orgId);
  console.log('  ✅ CEO:', init.ceo.charter.title);

  // 准备招聘
  const spawnResult = api.prepareSpawn(init.ceo.id, 'cto');
  if (spawnResult.success) {
    console.log('  ✅ 准备招聘:', spawnResult.agent?.charter.title);
    console.log('  ✅ 提示词长度:', spawnResult.systemPrompt?.length);
  }

  // 建议角色
  const suggestions = api.suggestRoles('开发一个SaaS产品并盈利');
  console.log('  ✅ 建议角色:', suggestions);

  // 打印树
  console.log('  ✅ 组织树:\n' + api.printTree().split('\n').map((l: string) => '    ' + l).join('\n'));

  console.log('✅ 测试 5 通过\n');
} catch (err: any) {
  console.error('❌ 测试 5 失败:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// ==================== Summary ====================

console.log('=== 测试完成 ===');
console.log('✅ 所有测试通过！');
console.log('\n可以开始使用 Elastic Agent 了。');
