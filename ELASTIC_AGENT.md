# Elastic Agentic Agent 协议

## 核心理念

**Agent 不是工具，是组织。**

当一个 Agent 的目标超出其能力范围，它可以：
1. 定义新角色（岗位描述）
2. Spawn 新 Agent 担任该角色
3. 新 Agent 拥有同样的"招聘权"

## 组织结构

```
┌─────────────────────────────────────┐
│         Root Agent (CEO)            │
│   目标：实现公司盈利                 │
│   分析后定义：需要市场部、技术部     │
└────────────┬────────────────────────┘
             │ spawn
    ┌────────┴────────┐
    ▼                 ▼
┌─────────────┐  ┌─────────────┐
│  Marketing  │  │   Tech      │  ← 一级部门
│  Agent      │  │   Agent     │
│  目标：获客 │  │  目标：产品  │
│  需要：文案 │  │  需要：前端  │
└──────┬──────┘  └──────┬──────┘
       │ spawn          │ spawn
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Copywriter │  │  Frontend   │  ← 二级岗位
│  Agent      │  │  Agent      │
└─────────────┘  └─────────────┘
```

## 协议规范

### 1. 角色定义（Role Charter）

Agent 在 spawn 新 Agent 前，必须定义：

```yaml
role:
  title: 职位名称
  mission: 核心使命（一句话）
  responsibilities:
    - 职责1
    - 职责2
  capabilities_needed: 
    - 所需能力
  authority: 
    can_spawn: true/false  # 是否能继续招人
    budget: 可用资源
  deliverables:
    - 交付物
  parent: 父Agent标识
```

### 2. Spawn 指令

使用 OpenClaw 的 `sessions_spawn`：

```json
{
  "runtime": "subagent",
  "mode": "session",
  "thread": true,
  "label": "marketing-director",
  "task": "你是市场部总监。使命：在预算内最大化获客。\n\n职责：\n1. 制定营销策略\n2. 管理营销预算\n3. 如需，可招聘文案、投放专员\n\n权限：可spawn下级Agent\n\n汇报对象：CEO Agent\n\n现在，请基于公司目标制定你的工作计划。"
}
```

### 3. 通信协议

- **指派任务**：`sessions_send` 向下传达
- **汇报结果**：子Agent完成后向上级汇报
- **跨部门协作**：通过父Agent协调

### 4. 生命周期

- **创建**：父Agent按需spawn
- **运行**：独立会话，可调用工具
- **汇报**：完成后向父Agent报告
- **终止**：任务完成后 `subagents kill` 或自然结束

## 实现示例

### 场景：创业公司

**Root Agent (CEO)** 收到目标："创立一个SaaS产品并在6个月内实现盈利"

```
1. CEO 分析：
   - 需要产品 → 招聘 CTO Agent
   - 需要市场 → 招聘 CMO Agent  
   - 需要销售 → 招聘 销售总监 Agent

2. Spawn CTO Agent:
   - 任务：3个月内上线MVP
   - 权限：可招聘前端、后端、设计
   
3. CTO Agent 分析：
   - 需要前端开发 → spawn 前端Agent
   - 需要后端开发 → spawn 后端Agent
   
4. 各Agent独立工作，向上汇报，形成组织协作
```

## 关键特性

1. **弹性伸缩**：需要时扩展，完成后收缩
2. **职责清晰**：每个Agent有明确的使命
3. **层级治理**：避免混乱，有明确的汇报线
4. **自主决策**：每个Agent在自己的领域内自主

## 当前限制

- OpenClaw 的 sub-agent 不支持持久化（重启后丢失）
- 跨Agent内存共享需要显式通过文件传递
- 需要人工设计初始的spawn逻辑

## 演示命令

启动一个CEO Agent：

```bash
# 用户发起任务时，Root Agent 演示：
# 1. 分析任务
# 2. 定义需要的角色
# 3. Spawn 子Agent
# 4. 协调工作
```

---

这个协议让 AI Agent 从"单体智能"进化为"组织智能"。
