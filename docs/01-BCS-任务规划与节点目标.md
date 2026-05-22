---
file: 01-BCS-任务规划与节点目标.md
description: YYC³ BCS 生产可用推进规划 — 阶段/标准/节点/预期/执行机制
author: 总设计师 <admin@0379.email>
version: v1.0.0
created: 2026-05-19
updated: 2026-05-19
status: active
tags: [planning],[milestones],[roadmap],[BCS],[生产可用]
category: plan
language: zh-CN
audience: developers,ai-tutors,stakeholders
complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*

---

# 📋 BCS 任务规划与节点目标

## 规划总则

> **执行有规划，规划有节点，节点有目标，目标可评估**

**总体目标**: 将 YYC³ BCS 从「框架完整」推进至「生产可用」，完成全链路闭环

**当前状态**: B- (69/100) → **目标状态**: A- (85+/100)

---

## 一、总览 — 流程 | 阶段 | 标准 | 节点 | 预期

```
┌─────────────────────────────────────────────────────────────────────┐
│                  BCS 生产可用推进 · 全景路线图                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Phase S1 — 基础加固 (P0清零)                                        │
│  ├─ 标准: tsc零错误 / build零警告 / ErrorBoundary全覆盖              │
│  ├─ 节点: M1 生产构建首次成功                                        │
│  └─ 预期: 白屏零风险 / 构建可部署                                    │
│                         ↓                                            │
│  Phase S2 — 质量体系 (测试+CI)                                       │
│  ├─ 标准: 核心模块>80%单测 / CI绿灯 / lint零警告                     │
│  ├─ 节点: M2 CI流水线首次全绿                                        │
│  └─ 预期: 变更有安全网 / 质量可追溯                                  │
│                         ↓                                            │
│  Phase S3 — 架构优化 (性能+路由)                                     │
│  ├─ 标准: 首屏<2s / 声明式路由 / 单文件<400行                        │
│  ├─ 节点: M3 Lighthouse>80分                                        │
│  └─ 预期: 用户体验达标 / 代码可维护                                  │
│                         ↓                                            │
│  Phase S4 — 安全加固 (生产基线)                                      │
│  ├─ 标准: CSP/CSRF/RateLimit/输入校验                                │
│  ├─ 节点: M4 安全审计通过                                            │
│  └─ 预期: 安全合规 / 可上线                                          │
│                         ↓                                            │
│  Phase S5 — 智能演进 (PWA+监控+i18n)                                 │
│  ├─ 标准: PWA离线可用 / Web Vitals达标 / 全组件双语                  │
│  ├─ 节点: M5 生产环境首次部署                                        │
│  └─ 预期: 生产环境稳定运行 / 持续监控                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、Phase S1 — 基础加固 (P0清零)

### 目标
生产构建首次成功 + ErrorBoundary全覆盖 + 白屏零风险

### 验收标准
- [ ] `pnpm build` 零错误零警告
- [ ] 全局ErrorBoundary包裹App根
- [ ] 每个模块级组件有独立ErrorBoundary
- [ ] `pnpm preview` 可正常访问所有模块
- [ ] 网络断线有友好提示

### 详细任务

| Task | 任务 | 涉及文件 | 状态 |
|------|------|----------|------|
| S1.1 | 首次生产构建验证 | vite.config.ts | ⬜ |
| S1.2 | 创建全局ErrorBoundary | 新建 src/app/components/ErrorBoundary.tsx | ⬜ |
| S1.3 | 模块级ErrorBoundary | App.tsx (switch中每case包裹) | ⬜ |
| S1.4 | 网络状态检测Hook | 新建 src/app/hooks/useNetworkStatus.ts | ⬜ |
| S1.5 | 修复构建中发现的所有错误 | 按实际发现 | ⬜ |

### 里程碑

| 节点 | 计划 | 交付物 | 状态 |
|------|------|--------|------|
| **M1: 生产构建首次成功** | S1完成 | dist/ 目录可部署 | ⬜ |

---

## 三、Phase S2 — 质量体系 (测试+CI)

### 目标
核心功能有测试覆盖 + CI自动检查 + 变更有安全网

### 验收标准
- [ ] Vitest + @testing-library 配置完成
- [ ] API层(client/hooks/mock)单测>80%
- [ ] 关键DevOps组件(设备/监控/告警)有基础测试
- [ ] GitHub Actions CI 配置完成(lint+typecheck+test)
- [ ] pre-commit hook (lint-staged)

### 详细任务

| Task | 任务 | 涉及文件 | 状态 |
|------|------|----------|------|
| S2.1 | Vitest配置 | vitest.config.ts + package.json | ⬜ |
| S2.2 | API client单测 | src/app/api/__tests__/client.test.ts | ⬜ |
| S2.3 | API hooks单测 | src/app/api/__tests__/hooks.test.ts | ⬜ |
| S2.4 | Mock数据验证单测 | src/app/api/__tests__/mock.test.ts | ⬜ |
| S2.5 | 核心组件渲染测试 | src/app/components/__tests__/ | ⬜ |
| S2.6 | CI流水线 | .github/workflows/ci.yml | ⬜ |
| S2.7 | pre-commit hook | .husky/ + lint-staged | ⬜ |

### 里程碑

| 节点 | 计划 | 交付物 | 状态 |
|------|------|--------|------|
| **M2: CI流水线首次全绿** | S2完成 | 所有检查通过 | ⬜ |

---

## 四、Phase S3 — 架构优化 (性能+路由)

### 目标
首屏性能达标 + 声明式路由 + 代码可维护

### 验收标准
- [ ] React.lazy + Suspense 代码分割
- [ ] react-router 声明式路由替代switch
- [ ] 大组件拆分(单文件<400行)
- [ ] next-themes替换为项目自研ThemeContext
- [ ] Lighthouse Performance > 80分

### 详细任务

| Task | 任务 | 涉及文件 | 状态 |
|------|------|----------|------|
| S3.1 | React.lazy路由级代码分割 | App.tsx | ⬜ |
| S3.2 | react-router声明式路由迁移 | App.tsx + routes/ | ⬜ |
| S3.3 | ModelSettings拆分 | devops/ModelSettings.tsx → 多文件 | ⬜ |
| S3.4 | 其他大组件拆分 | 按实际>400行文件 | ⬜ |
| S3.5 | next-themes清理 | sonner.tsx用ThemeContext | ⬜ |
| S3.6 | Lighthouse基准测试 | 性能报告 | ⬜ |

### 里程碑

| 节点 | 计划 | 交付物 | 状态 |
|------|------|--------|------|
| **M3: Lighthouse>80分** | S3完成 | 性能报告 | ⬜ |

---

## 五、Phase S4 — 安全加固 (生产基线)

### 目标
安全合规达标 / 可上线部署

### 验收标准
- [ ] CSP策略配置
- [ ] CSRF Token机制(后端联调时)
- [ ] 前端输入校验(zod/react-hook-form)
- [ ] Rate Limiting(前端节流)
- [ ] 敏感操作二次确认
- [ ] 安全审计清单全部通过

### 详细任务

| Task | 任务 | 涉及文件 | 状态 |
|------|------|----------|------|
| S4.1 | CSP meta标签 | index.html | ⬜ |
| S4.2 | zod输入校验schema | src/app/api/schemas/ | ⬜ |
| S4.3 | 前端Rate Limiter | src/app/utils/rateLimiter.ts | ⬜ |
| S4.4 | 敏感操作确认弹窗 | 复用AlertDialog组件 | ⬜ |
| S4.5 | 安全审计清单验证 | docs/安全审计报告 | ⬜ |

### 里程碑

| 节点 | 计划 | 交付物 | 状态 |
|------|------|--------|------|
| **M4: 安全审计通过** | S4完成 | 安全审计报告 | ⬜ |

---

## 六、Phase S5 — 智能演进 (PWA+监控+i18n)

### 目标
生产环境首次部署 / 持续监控 / 体验优化

### 验收标准
- [ ] PWA Service Worker配置
- [ ] Web Vitals采集+上报
- [ ] 全组件双语覆盖
- [ ] 生产环境部署(192.168.3.x:3118)
- [ ] 监控仪表板可访问

### 详细任务

| Task | 任务 | 涉及文件 | 状态 |
|------|------|----------|------|
| S5.1 | PWA manifest + SW | public/manifest.json + sw.js | ⬜ |
| S5.2 | Web Vitals集成 | src/app/utils/webVitals.ts | ⬜ |
| S5.3 | i18n系统化 | src/app/i18n/ | ⬜ |
| S5.4 | 生产部署配置 | .env.production + nginx | ⬜ |
| S5.5 | 监控仪表板 | SystemOverview增强 | ⬜ |

### 里程碑

| 节点 | 计划 | 交付物 | 状态 |
|------|------|--------|------|
| **M5: 生产环境首次部署** | S5完成 | 可访问的线上系统 | ⬜ |

---

## 七、执行机制

### 7.1 每日工作流

```
启动 → 读取 04-BCS-上下文记忆文档.md
     → 读取 02-BCS-执行日志与进度跟踪.md
     → 确认当前Task
     → 执行(Plan → Do → Check → Act)
     → 更新 02-执行日志
     → 更新 04-上下文记忆
结束 → 生成/更新 03-总结文档与状态同步.md
```

### 7.2 质量门禁 (每个Task完成前)

- [ ] `pnpm typecheck` 零错误
- [ ] `pnpm lint` 零错误
- [ ] 相关测试通过(如有)
- [ ] 文件有JSDoc标头注释
- [ ] 无硬编码敏感信息

### 7.3 里程碑验收流程

```
完成所有Task → 运行全量质量门禁
            → 对照验收标准逐项检查
            → 更新里程碑状态
            → 更新 03-总结文档
            → 更新 04-上下文记忆
```

### 7.4 变更记录

| 日期 | 变更内容 | 原因 | 影响 |
|------|----------|------|------|
| 2026-05-19 | 初始规划创建 | 项目首次总设计师审核 | 全局 |

---

**规划人**: 总设计师
**规划日期**: 2026-05-19
**文档版本**: v1.0.0
