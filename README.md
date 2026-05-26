<p align="center">
  <img src="Public/yyc3-Family.png" alt="YYC³ Family" width="720" />
</p>

<div align="center">

# YYC³ Brain Computer System

**本地闭环 DevOps 智能管理平台**

_基于「五高五标五化五维」核心架构_

[![CI](https://github.com/YYC-Cube/YYC3-Brain-Compute-System/actions/workflows/ci.yml/badge.svg)](https://github.com/YYC-Cube/YYC3-Brain-Compute-System/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/Tests-162%20passed-brightgreen)]()
[![TypeCheck](https://img.shields.io/badge/TypeCheck-0%20errors-brightgreen)]()
[![Build](https://img.shields.io/badge/Build-passing-brightgreen)]()

</div>

---

> **_YanYuCloudCube_**
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 🌐 在线访问

| 资源 | 链接 |
|------|------|
| **生产站点** | [brain.yyc3.vip](https://brain.yyc3.vip) |
| **GitHub 仓库** | [YYC3-Brain-Compute-System](https://github.com/YYC-Cube/YYC3-Brain-Compute-System) |
| **Issues** | [提交问题](https://github.com/YYC-Cube/YYC3-Brain-Compute-System/issues) |

---

## 🧠 核心理念

| 架构　　　　 | 体系　　　　　　　　　　　　　　　　　　　 |
| --------------| --------------------------------------------|
| **五高架构** | 高可用 · 高性能 · 高安全 · 高扩展 · 高智能 |
| **五标体系** | 标准化 · 规范化 · 自动化 · 可视化 · 智能化 |
| **五化转型** | 流程化 · 数字化 · 生态化 · 工具化 · 服务化 |
| **五维评估** | 时间维 · 空间维 · 属性维 · 事件维 · 关联维 |

---

## 📦 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.3.1 |
| 构建工具 | Vite | 6.3.5 |
| CSS 框架 | TailwindCSS | 4.1.12 |
| UI 组件 | Radix UI + shadcn/ui | — |
| 动画库 | Motion (Framer Motion) | 12.23.24 |
| 图表 | Recharts | 2.15.2 |
| 语言 | TypeScript (Strict + ES2022) | 5.8 |
| 包管理 | pnpm | 10.33.0 |
| 测试 | Vitest + @testing-library/react | — |
| 校验 | zod | — |
| CI/CD | GitHub Actions (Node 20/22) | — |

---

## 🏗️ 功能模块 (26 模块)

### 脑机系统核心 (7 模块)

| 模块 | 说明 |
|------|------|
| 系统总览 | 全局状态仪表盘 |
| 技术文档 | 白皮书查看器 |
| 感知交互 | 传感器数据可视化 |
| 边缘计算 | 分布式计算监控 |
| 平台服务 | 服务编排管理 |
| 网络传输 | 网络拓扑与流量 |
| 安全防护 | 安全态势感知 |

### DevOps 功能 (18 模块)

设备管理 · 数据监控 · 操作审计 · 权限管理 · 操作中心 · 巡查模式 · 一键跟进 · AI 决策 · 本地文件管理 · CLI 终端 · IDE 视图 · 脚本操作 · 主题定制 · 模型设置 · 跨端对比 · 历史对比 · 告警阈值 · 测试执行

---

## ✅ 质量门禁

| 检查项 | 命令 | 状态 |
|--------|------|------|
| TypeScript | `tsc --noEmit` | 0 errors |
| ESLint | `eslint . --max-warnings 250` | 309 warnings |
| 测试 | `pnpm test` | 162/162 passed (10 suites) |
| 构建 | `pnpm build` | passing |
| 代码分割 | React.lazy × 26 | 60+ chunks |

---

## 🔒 安全体系

| 安全项 | 实现 |
|--------|------|
| CSP | Content-Security-Policy (index.html) |
| XSS 防护 | X-XSS-Protection + React 自动转义 |
| 点击劫持 | X-Frame-Options: SAMEORIGIN |
| 输入校验 | zod schema × 8 (Login/Device/Monitor/Audit/CLI/Alert) |
| 频率限制 | RateLimiter (API/登录/CLI) |
| 操作确认 | ConfirmDialog + useConfirmDialog |
| PWA 安全 | Service Worker + manifest.json |

---

## 📁 项目结构

```
YYC3-Brain-Computer-System/
├── src/app/
│   ├── api/                    # 8 层 API 架构
│   │   ├── client.ts           # HTTP 客户端 + 错误处理
│   │   ├── config.ts           # 环境配置
│   │   ├── endpoints-config.ts # 80 REST + 4 WS 端点
│   │   ├── hooks.ts            # React Query 风格 hooks
│   │   ├── mock.ts             # Mock 数据层
│   │   ├── schemas.ts          # zod 输入校验
│   │   └── websocket.ts        # WebSocket 管理
│   ├── components/
│   │   ├── devops/             # 18 个 DevOps 功能组件
│   │   ├── layout/             # MainLayout + Navbar + Sidebar
│   │   ├── modules/            # 7 个脑机系统核心模块
│   │   ├── ui/                 # 50+ shadcn/ui 组件
│   │   ├── ErrorBoundary.tsx   # 全局 + 模块级错误边界
│   │   ├── ConfirmDialog.tsx   # 敏感操作确认弹窗
│   │   ├── LanguageContext.tsx  # 国际化 (中/英)
│   │   └── ThemeContext.tsx     # 主题系统 v2
│   ├── hooks/                  # useNetworkStatus
│   ├── utils/                  # rateLimiter + webVitals
│   ├── test/                   # 测试配置
│   ├── main.tsx                # 应用入口
│   └── App.tsx                 # React.lazy × 26 模块
├── Public/
│   ├── yyc3-icons/             # 全端 Logo (Web/Android/iOS/macOS/watchOS)
│   ├── yyc3-Family.png         # 品牌 Family 图
│   ├── manifest.json           # PWA 清单
│   └── sw.js                   # Service Worker
├── scripts/                    # 自动化工具 (lint-fix/icon-clean)
├── .github/workflows/ci.yml   # CI 流水线 (Node 20/22)
├── docs/                       # 文档体系 (十阶段 BCS 架构)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 🚀 快速开始

```bash
pnpm install          # 安装依赖
pnpm run dev          # 启动开发服务器 (端口 3155)
pnpm run build        # 构建生产版本
pnpm run lint         # 代码检查 (--max-warnings 250)
pnpm run typecheck    # 类型检查
pnpm test             # 运行测试
pnpm test:coverage    # 测试覆盖率
```

---

## ⚙️ 环境配置

| 变量 | 说明 | 开发默认值 |
|------|------|-----------|
| `VITE_API_BASE_URL` | API 基础地址 | `http://192.168.3.100:3118/api/v1` |
| `VITE_WS_URL` | WebSocket 地址 | `ws://192.168.3.100:3118/api/v1/ws` |
| `VITE_API_TEST_MODE` | Mock 模式开关 | `true` |

---

## 📋 开发规范

- **代码标头**: 所有代码文件必须包含 JSDoc 标头注释
- **提交规范**: [Conventional Commits](https://www.conventionalcommits.org/)
- **命名规范**: 组件 PascalCase / Hook camelCase / 样式 kebab-case
- **类型安全**: TypeScript Strict Mode + ES2022
- **ESLint**: `--max-warnings 250` 硬性限制

---

## 🗺️ 生产路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| S1 | P0 清零：build + ErrorBoundary | ✅ |
| S2 | 测试 + CI 体系 | ✅ |
| S3 | 性能 + 代码分割 | ✅ |
| S4 | 安全合规 | ✅ |
| S5 | PWA + 监控 + 部署 | ✅ |
| S6 | ESLint Strict + 技术债务清理 | 🔄 进行中 |

---

## 📖 文档体系

| 文档 | 说明 |
|------|------|
| [00-BCS-项目现状审核报告](./docs/00-BCS-项目现状审核报告.md) | 五维度审核 (69/100 B-) |
| [01-BCS-任务规划与节点目标](./docs/01-BCS-任务规划与节点目标.md) | 5 阶段路线图 |
| [02-BCS-执行日志与进度跟踪](./docs/02-BCS-执行日志与进度跟踪.md) | 实时执行日志 |
| [03-BCS-总结文档与状态同步](./docs/03-BCS-总结文档与状态同步.md) | 会话总结 |
| [04-BCS-上下文记忆文档](./docs/04-BCS-上下文记忆文档.md) | 跨会话上下文 |

---

<div align="center">

**「 _YanYuCloudCube_ 」**

_言启千行代码，语枢万物智能_

_Words inspire thousands of lines of code, language pivots the intelligence of all things_

**© 2025-2026 YYC³ Team. All Rights Reserved.**

</div>
