---
name: elastic-agent
description: "Elastic Agentic Agent - 组织型智能体系统。让 Agent 拥有招聘能力，按需组建团队。使用场景：创办公司、开发产品、复杂项目协作。触发词：创办、创建组织、招聘团队。"
---

# Elastic Agentic Agent

让 Agent 拥有"招聘"能力，形成弹性组织。

## 使用方法

在聊天中说：

```
创办一个任务管理 SaaS
```

系统会自动：
1. 创建 CEO Agent
2. 分析需要招聘的角色
3. 组建团队
4. 下发任务

## 命令

| 命令 | 说明 |
|------|------|
| `创办[目标]` | 初始化组织 |
| `查看状态` | 显示组织架构 |
| `招聘[角色]` | 招聘新 Agent |
| `分配任务` | 下发任务 |
| `建议` | 智能招聘建议 |

## 可用角色

- `ceo` - CEO
- `cto` - CTO
- `cmo` - CMO
- `product-manager` - 产品经理
- `frontend-dev` - 前端工程师
- `backend-dev` - 后端工程师
- `devops` - 运维工程师
- `content-writer` - 内容创作者
- `ux-designer` - UX 设计师

## 示例

```
用户: 创办一个任务管理 SaaS

系统: 🎯 组织目标: 创办一个任务管理 SaaS
     ✅ CEO 已就位
     
     ⚪ CEO (xxx-id)
     
     💡 建议招聘: cto, product-manager
     
用户: 招聘 CTO

系统: ✅ CTO 已就位
     
     ⚪ CEO (xxx-id)
       ⚪ CTO (yyy-id)
```

## 实现

```typescript
import { getAPI } from './lib/index';

const api = getAPI();

// 初始化
const init = api.init('创办任务管理 SaaS');

// 招聘
const result = api.prepareSpawn(init.ceo.id, 'cto');

// Spawn Agent
await sessions_spawn({
  runtime: 'subagent',
  mode: 'run',
  task: result.systemPrompt,
});
```
