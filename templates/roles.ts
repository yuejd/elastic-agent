/**
 * Elastic Agentic Agent - Role Templates
 * 
 * 预定义的角色模板库
 */

import { RoleCharter, createCharter } from '../lib/core';

// ==================== Role Template Types ====================

export interface RoleTemplate {
  id: string;
  title: string;
  description: string;
  charter: Omit<RoleCharter, 'id' | 'createdAt' | 'parent'>;
}

// ==================== CEO Templates ====================

export const CEO_TEMPLATE: RoleTemplate = {
  id: 'ceo',
  title: 'CEO',
  description: '首席执行官，负责战略决策和团队组建',
  charter: {
    title: 'CEO',
    mission: '领导组织达成既定目标',
    responsibilities: [
      '制定战略方向',
      '组建核心团队',
      '协调各部门资源',
      '向用户汇报最终成果',
    ],
    capabilities: ['战略规划', '团队管理', '决策制定', '资源协调'],
    authority: {
      canSpawn: true,
      maxDepth: 3,
    },
    deliverables: ['战略计划', '组织架构', '最终成果汇报'],
  },
};

// ==================== Tech Team Templates ====================

export const CTO_TEMPLATE: RoleTemplate = {
  id: 'cto',
  title: 'CTO',
  description: '首席技术官，负责技术架构和研发团队',
  charter: {
    title: 'CTO',
    mission: '构建技术体系，带领团队完成产品开发',
    responsibilities: [
      '制定技术架构',
      '选择技术栈',
      '组建技术团队',
      '把控代码质量',
    ],
    capabilities: ['技术架构', '代码审查', '团队管理'],
    authority: {
      canSpawn: true,
      maxDepth: 2,
    },
    deliverables: ['技术方案', '系统架构图', '开发计划'],
  },
};

export const FRONTEND_DEV_TEMPLATE: RoleTemplate = {
  id: 'frontend-dev',
  title: 'Frontend Developer',
  description: '前端开发工程师',
  charter: {
    title: 'Frontend Developer',
    mission: '实现高质量的用户界面',
    responsibilities: [
      '开发前端功能',
      '优化用户体验',
      '编写单元测试',
    ],
    capabilities: ['React/Vue', 'TypeScript', 'CSS'],
    authority: {
      canSpawn: false,
    },
    deliverables: ['前端代码', '组件文档', '测试报告'],
  },
};

export const BACKEND_DEV_TEMPLATE: RoleTemplate = {
  id: 'backend-dev',
  title: 'Backend Developer',
  description: '后端开发工程师',
  charter: {
    title: 'Backend Developer',
    mission: '构建稳定可靠的后端服务',
    responsibilities: [
      '设计 API 接口',
      '开发业务逻辑',
      '数据库设计与优化',
    ],
    capabilities: ['Node.js/Python', 'SQL', 'API设计'],
    authority: {
      canSpawn: false,
    },
    deliverables: ['后端代码', 'API文档', '数据库设计'],
  },
};

export const DEVOPS_TEMPLATE: RoleTemplate = {
  id: 'devops',
  title: 'DevOps Engineer',
  description: '运维工程师',
  charter: {
    title: 'DevOps Engineer',
    mission: '保障系统稳定运行',
    responsibilities: [
      '搭建 CI/CD 流水线',
      '配置监控告警',
      '维护生产环境',
    ],
    capabilities: ['Docker', 'K8s', 'CI/CD'],
    authority: {
      canSpawn: false,
    },
    deliverables: ['部署脚本', '监控配置', '运维文档'],
  },
};

// ==================== Marketing Team Templates ====================

export const CMO_TEMPLATE: RoleTemplate = {
  id: 'cmo',
  title: 'CMO',
  description: '首席营销官，负责市场营销',
  charter: {
    title: 'CMO',
    mission: '制定营销策略，实现获客目标',
    responsibilities: [
      '制定营销策略',
      '管理营销预算',
      '组建营销团队',
      '分析市场数据',
    ],
    capabilities: ['营销策划', '数据分析', '团队管理'],
    authority: {
      canSpawn: true,
      maxDepth: 2,
    },
    deliverables: ['营销计划', '获客方案', 'ROI报告'],
  },
};

export const CONTENT_WRITER_TEMPLATE: RoleTemplate = {
  id: 'content-writer',
  title: 'Content Writer',
  description: '内容创作者',
  charter: {
    title: 'Content Writer',
    mission: '创作高质量营销内容',
    responsibilities: [
      '撰写营销文案',
      '制作内容素材',
      '维护内容渠道',
    ],
    capabilities: ['文案写作', 'SEO', '社媒运营'],
    authority: {
      canSpawn: false,
    },
    deliverables: ['营销文案', '内容素材', '渠道报告'],
  },
};

// ==================== Product Team Templates ====================

export const PRODUCT_MANAGER_TEMPLATE: RoleTemplate = {
  id: 'product-manager',
  title: 'Product Manager',
  description: '产品经理',
  charter: {
    title: 'Product Manager',
    mission: '定义产品方向，协调产品开发',
    responsibilities: [
      '产品需求分析',
      '制定产品路线图',
      '协调研发资源',
      '跟进产品进度',
    ],
    capabilities: ['需求分析', '项目管理', '用户研究'],
    authority: {
      canSpawn: true,
      maxDepth: 1,
    },
    deliverables: ['产品需求文档', '产品路线图', '竞品分析'],
  },
};

export const UX_DESIGNER_TEMPLATE: RoleTemplate = {
  id: 'ux-designer',
  title: 'UX Designer',
  description: '用户体验设计师',
  charter: {
    title: 'UX Designer',
    mission: '设计优秀的产品体验',
    responsibilities: [
      '用户研究',
      '交互设计',
      '原型制作',
      '可用性测试',
    ],
    capabilities: ['Figma', '用户研究', '交互设计'],
    authority: {
      canSpawn: false,
    },
    deliverables: ['设计稿', '原型', '用户研究报告'],
  },
};

// ==================== Template Registry ====================

export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  'ceo': CEO_TEMPLATE,
  'cto': CTO_TEMPLATE,
  'frontend-dev': FRONTEND_DEV_TEMPLATE,
  'backend-dev': BACKEND_DEV_TEMPLATE,
  'devops': DEVOPS_TEMPLATE,
  'cmo': CMO_TEMPLATE,
  'content-writer': CONTENT_WRITER_TEMPLATE,
  'product-manager': PRODUCT_MANAGER_TEMPLATE,
  'ux-designer': UX_DESIGNER_TEMPLATE,
};

/**
 * 获取角色模板
 */
export function getRoleTemplate(templateId: string): RoleTemplate | undefined {
  return ROLE_TEMPLATES[templateId];
}

/**
 * 创建角色（基于模板）
 */
export function createRoleFromTemplate(
  templateId: string, 
  parentAgentId?: string
): RoleCharter | null {
  const template = ROLE_TEMPLATES[templateId];
  if (!template) return null;

  return createCharter({
    title: template.charter.title,
    mission: template.charter.mission,
    responsibilities: template.charter.responsibilities,
    capabilities: template.charter.capabilities,
    canSpawn: template.charter.authority.canSpawn,
    maxDepth: template.charter.authority.maxDepth,
    deliverables: template.charter.deliverables,
    parent: parentAgentId,
  });
}

/**
 * 列出所有可用角色
 */
export function listAvailableRoles(): string[] {
  return Object.keys(ROLE_TEMPLATES);
}
