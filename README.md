# Elastic Agentic Agent

基于 OpenClaw 的弹性组织型智能体系统。

## 概念

**Elastic Agent = 组织而非工具**

- 传统 Agent：固定能力，单打独斗
- Elastic Agent：按需招聘，形成组织树

```
CEO Agent
  ├── CTO Agent
  │     ├── Frontend Agent
  │     └── Backend Agent
  └── CMO Agent
        ├── Content Agent
        └── Ads Agent
```

## 核心能力

1. **角色定义（Role Charter）** - 每个Agent有明确职责
2. **弹性招聘（Auto Spawn）** - Agent判断是否需要下级
3. **任务协调（Coordination）** - 下发、汇总、汇报
4. **状态持久化（Persistence）** - 组织架构保存到文件

## 快速开始

```
用户: 帮我创办一个任务管理SaaS公司
系统: [自动构建组织] → [各Agent执行] → [输出结果]
```

## 文件结构

```
elastic-agent/
├── SKILL.md              # Skill 入口
├── lib/
│   ├── core.ts           # 核心类：OrgTree, AgentNode
│   ├── factory.ts        # Agent Factory
│   └── protocol.ts       # 通信协议
├── templates/
│   └── roles/            # 角色模板库
├── state/
│   ├── org.json          # 当前组织架构
│   └── tasks/            # 任务状态
└── tests/
    └── demo.ts           # 演示脚本
```

## 设计文档

见 [ELASTIC_AGENT.md](./ELASTIC_AGENT.md)
