---
file: CONTRIBUTING.md
description: YYC³ Brain Computer System 贡献指南
author: YanYuCloudCube Team
version: v3.1.0
created: 2026-05-19
updated: 2026-05-19
status: active
tags: [contributing],[guide],[BCS]
category: guide
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 贡献指南

## 核心理念

**五高架构**：高可用 | 高性能 | 高安全 | 高扩展 | 高智能
**五标体系**：标准化 | 规范化 | 自动化 | 可视化 | 智能化
**五化转型**：流程化 | 数字化 | 生态化 | 工具化 | 服务化
**五维评估**：时间维 | 空间维 | 属性维 | 事件维 | 关联维

---

## 参与贡献

感谢您对 YYC³ Brain Computer System 项目的关注！请遵循以下规范参与贡献。

## 开发环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git >= 2.40

## 开发流程

### 1. Fork & Clone

```bash
git clone <repository-url>
cd YYC3-Brain-Computer-System
npm install
```

### 2. 分支规范

遵循 Git Flow 工作流：

| 分支类型 | 命名格式 | 示例 |
|----------|----------|------|
| 功能分支 | `feature/{描述}` | `feature/device-management` |
| 修复分支 | `bugfix/{描述}` | `bugfix/fix-sidebar-collapse` |
| 重构分支 | `refactor/{描述}` | `refactor/api-layer` |

### 3. 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

类型: feat | fix | docs | style | refactor | test | chore
```

**示例**：

```
feat(devops): 新增设备批量操作功能
fix(sidebar): 修复移动端侧边栏折叠异常
docs(readme): 更新项目技术栈说明
```

### 4. 代码规范

- **文件标头**: 所有代码文件必须包含 JSDoc 标头注释
- **命名规范**: 组件 PascalCase / Hook camelCase / 样式 kebab-case
- **类型安全**: TypeScript Strict Mode，禁止 `any`
- **样式规范**: 使用 TailwindCSS，遵循 shadcn/ui 约定

### 5. 代码标头格式

```typescript
/**
 * file: ComponentName.tsx
 * description: 组件功能描述
 * author: Your Name
 * version: v1.0.0
 * created: YYYY-MM-DD
 * updated: YYYY-MM-DD
 * status: active
 * tags: [component],[module]
 */
```

## 文档规范

所有文档必须包含 YAML Front Matter 标头：

```yaml
---
file: filename.md
description: 文档描述
author: 作者
version: v1.0.0
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active
tags: [标签1],[标签2]
category: category
language: zh-CN
---
```

## 审核流程

1. 提交 Pull Request
2. 代码审核（代码质量 + 规范符合度）
3. 功能验证（构建通过 + 功能正常）
4. 合并至 develop 分支

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

**© 2025-2026 YYC³ Team. All Rights Reserved.**
</div>
