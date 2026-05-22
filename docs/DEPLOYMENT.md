---
file: DEPLOYMENT.md
description: YYC³ Brain Computer System — GitHub Pages 自动化部署指南
author: YanYuCloudCube Team
version: v1.0.0
created: 2026-05-23
updated: 2026-05-23
status: active
tags: [deployment],[github-pages],[cicd],[automation]
category: operations
language: zh-CN
audience: devops,developers
---

# 🚀 YYC³ Brain Computer System — 部署指南

> **自动化部署到 brain.yyc3.vip | GitHub Pages + GitHub Actions CI/CD**

---

## 📋 目录

1. [快速开始](#快速开始)
2. [前置条件](#前置条件)
3. [GitHub Pages 配置](#github-pages-配置)
4. [DNS 域名配置](#dns-域名配置)
5. [GitHub Secrets 配置](#github-secrets-配置)
6. [CI/CD 工作流说明](#cicd-工作流说明)
7. [手动触发部署](#手动触发部署)
8. [常见问题排查](#常见问题排查)
9. [回滚操作指南](#回滚操作指南)
10. [监控与告警](#监控与告警)

---

## 快速开始

### 3步上线（5分钟）

```bash
# 1️⃣ Fork 或 Clone 本仓库
git clone https://github.com/YYC-Cube/yyc3-braincomputer-system.git

# 2️⃣ 配置 GitHub Secrets（见下方第5节）
# 路径: Settings → Secrets and variables → Actions → New repository secret

# 3️⃣ Push 到 main 分支，自动部署！
git add .
git commit -m "feat: initial deployment"
git push origin main
# 等待 5-10 分钟后访问 https://brain.yyc3.vip
```

---

## 前置条件

### 必须具备

| 项目 | 要求 |
|------|------|
| **GitHub 账号** | 拥有仓库写权限 |
| **域名** | brain.yyc3.vip（已购买并可通过DNS管理） |
| **Node.js** | 本地开发需要 v20+ (可选) |
| **pnpm** | 包管理器 v10+ |

### 推荐工具

- **GitHub CLI**: `gh` 命令行工具（可选但推荐）
- **UptimeRobot**: 免费域名监控（可选）

---

## GitHub Pages 配置

### 步骤 1：启用 GitHub Pages

```
1. 打开仓库页面: https://github.com/YYC-Cube/yyc3-braincomputer-system
2. 点击 Settings (设置)
3. 左侧菜单选择 Pages
4. Source (源) 选择: "GitHub Actions" ⭐ 重要!
5. 保存 (无需其他配置)
```

### 步骤 2：验证权限

确保工作流有以下权限（已配置在 deploy.yml 中）：

```yaml
permissions:
  contents: read      # 读取代码
  pages: write        # 写入Pages
  id-token: write     # OIDC token (GitHub Actions身份验证)
```

---

## DNS 域名配置

### 方案 A：使用 CNAME 记录（推荐）

```
类型: CNAME
名称: brain (或 @, 取决于DNS提供商)
值: yyc-cube.github.io.
TTL: 3600 (1小时)
```

### 方案 B：使用 A 记录（备选）

```
类型: A
名称: brain
值: 185.199.108.153
    185.199.109.153
    185.199.110.153
    185.199.111.153
TTL: 3600
```

### DNS 验证命令

```bash
# 检查 DNS 解析是否生效（可能需要几分钟到24小时）
nslookup brain.yyc3.vip

# 或使用 dig (macOS/Linux)
dig brain.yyc3.vip +short

# 预期输出:
# yyc-cube.github.io.
# 或 185.199.108.153 (如果使用A记录)
```

### 自定义域名在 GitHub 设置

```
1. Settings → Pages
2. Custom domain (自定义域名) 输入: brain.yyc3.vip
3. 勾选 "Enforce HTTPS" (强制HTTPS)
4. GitHub 会自动添加 Let's Encrypt SSL证书
```

---

## GitHub Secrets 配置

### 必需的 Secrets

进入 **Settings → Secrets and variables → Actions → New repository secret**

#### 1. VITE_API_TEST_MODE (必需)

```
Name: VITE_API_TEST_MODE
Value: true          # 使用Mock模式（推荐初期）
       false         # 连接真实API（需要API网关）
       auto          # 自动检测（默认）
Secret: ✓ 保持勾选
```

#### 2. VITE_API_BASE_URL (可选)

```
Name: VITE_API_BASE_URL
Value:                # 留空 = 自动检测
       https://api.brain.yyc3.vip/api/v1  # 生产API
Secret: ✓ 保持勾选
```

#### 3. VITE_WS_URL (可选)

```
Name: VITE_WS_URL
Value:                # 留空 = 自动检测
       wss://api.brain.yyc3.vip/api/v1/ws  # 生产WebSocket
Secret: ✓ 保持勾选
```

#### 4. 其他可选 Secrets

| Secret名 | 说明 | 默认值 |
|----------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | YYC³ Brain Computer System |
| `VITE_APP_VERSION` | 版本号 | 3.2.0 |

### 快速配置命令（使用 gh CLI）

```bash
# 登录 GitHub CLI
gh auth login

# 设置 Secrets
gh secret set VITE_API_TEST_MODE -b "true" --repo YYC-Cube/yyc3-braincomputer-system
gh secret set VITE_APP_TITLE -b "YYC³ Brain Computer System" --repo YYC-Cube/yyc3-braincomputer-system

# 验证 Secrets
gh secret list --repo YYC-Cube/yyc3-braincomputer-system
```

---

## CI/CD 工作流说明

### 工作流文件位置

`.github/workflows/deploy.yml`

### 触发条件

```yaml
on:
  push:
    branches: [main]        # push到main分支自动触发
  workflow_dispatch:         # 支持手动触发
    inputs:
      skip_tests:
        description: 'Skip tests (emergency only)'
        type: boolean
        default: false
```

### 构建流程

```
┌─────────────┐
│  Checkout   │ ← 拉取代码
└──────┬──────┘
       ↓
┌─────────────┐
│ Setup pnpm  │ ← 安装pnpm v10
└──────┬──────┘
       ↓
┌─────────────┐
│ Install     │ ← pnpm install (带缓存)
└──────┬──────┘
       ↓
┌─────────────┐
│ Lint        │ ← ESLint检查 (3分钟超时)
└──────┬──────┘
       ↓
┌─────────────┐
│ TypeCheck   │ ← TypeScript检查 (3分钟超时)
└──────┬──────┘
       ↓
┌─────────────┐
│ Test        │ ← 单元测试 (可跳过)
└──────┬──────┘
       ↓
┌─────────────┐
│ Build       │ ← Vite生产构建 (5分钟超时)
└──────┬──────┘
       ↓
┌─────────────┐
│ Upload      │ ← 上传构建产物
└──────┬──────┘
       ↓
┌─────────────┐
│ Deploy      │ ← 部署到GitHub Pages
└──────┬──────┘
       ↓
┌─────────────┐
│ Verify      │ ← 验证域名可达性
└─────────────┘
```

### 质量门禁（Quality Gates）

所有检查必须通过才能部署：

| 门禁 | 命令 | 超时 | 说明 |
|------|------|------|------|
| **Lint** | `pnpm lint` | 3min | ESLint代码规范 |
| **TypeCheck** | `pnpm typecheck` | 3min | TypeScript类型检查 |
| **Test** | `pnpm test:coverage` | 5min | 单元测试+覆盖率 |
| **Build** | `pnpm build` | 5min | 生产构建 |

### 缓存优化

工作流已配置 **pnpm store 缓存**，加速依赖安装：

```yaml
- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**效果**：首次构建 ~2min，后续构建 ~30s（缓存命中时）

---

## 手动触发部署

### 方法 1：GitHub UI 界面

```
1. 进入仓库 Actions 页面
2. 左侧选择 "Deploy to GitHub Pages"
3. 右侧 "Run workflow" 按钮
4. 选择分支: main
5. 可选: 勾选 "Skip tests" (紧急情况)
6. 点击绿色 "Run workflow" 按钮
```

### 方法 2：使用 gh CLI

```bash
# 触发部署工作流
gh workflow run "Deploy to GitHub Pages" \
  --ref main \
  --repo YYC-Cube/yyc3-braincomputer-system

# 查看运行状态
gh run list --workflow=deploy.yml \
  --repo YYC-Cube/yyc3-braincomputer-system

# 查看运行日志
gh run view <run-id> \
  --repo YYC-Cube/yyc3-braincomputer-system \
  --log-failed
```

### 方法 3：紧急部署（跳过测试）

```bash
# 通过 API 触发（跳过测试）
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YYC-Cube/yyc3-braincomputer-system/actions/workflows/deploy.yml/dispatches \
  -d '{"ref":"main","inputs":{"skip_tests":"true"}}'
```

---

## 常见问题排查

### 问题 1：部署失败 - 构建错误

**症状**：Actions 显示 ❌ Build step failed

**排查步骤**：
```bash
# 1. 本地复现构建
pnpm install
pnpm build

# 2. 检查错误日志
# Actions → 点击失败的 run → Build → 展开错误步骤

# 3. 常见原因及解决:
#    - TypeScript 错误 → 运行 pnpm typecheck 修复
#    - ESLint 错误 → 运行 pnpm lint:fix 自动修复
#    - 依赖安装失败 → 删除 node_modules 和 pnpm-lock.yaml 重装
```

### 问题 2：域名无法访问

**症状**：浏览器显示 "无法访问此网站"

**排查步骤**：
```bash
# 1. 检查 DNS 解析
nslookup brain.yyc3.vip

# 2. 检查 HTTPS 证书
curl -I https://brain.yyc3.vip

# 3. 检查 GitHub Pages 状态
# Settings → Pages → 查看是否有警告信息

# 4. 常见原因:
#    - DNS 未生效 → 等待 5分钟-24小时
#    - CNAME 配置错误 → 检查DNS提供商设置
#    - GitHub Pages 未启用 → 确认Source为"GitHub Actions"
```

### 问题 3：白屏或资源404

**症状**：页面空白或控制台显示资源加载失败

**解决方案**：
```javascript
// 检查 vite.config.ts 的 base 配置
// 应该是:
base: './'  // 相对路径（GitHub Pages兼容）
// 或者
base: '/yyc3-braincomputer-system/' // 如果使用子目录
```

### 问题 4：API请求失败

**症状**：功能不可用，控制台显示网络错误

**原因**：Mock模式未正确配置

**解决**：
```bash
# 确保 GitHub Secret 已设置:
# VITE_API_TEST_MODE = true

# 或者在本地 .env 文件中:
VITE_API_TEST_MODE=true
```

### 问题 5：部署速度慢

**优化建议**：
- ✅ 确保使用 `--frozen-lockfile`（已配置）
- ✅ 利用 pnpm 缓存（已配置）
- ✅ 减少不必要的依赖
- ⚠️ 大型依赖考虑 CDN 外链

---

## 回滚操作指南

### 场景 1：回滚到上一个版本（推荐）

```bash
# 1. 查看提交历史
git log --oneline -10

# 2. 回滚到上一个稳定版本 (例如 HEAD~1)
git revert HEAD

# 3. 推送触发自动重新部署
git push origin main
# 等待 5-10 分钟即可恢复
```

### 场景 2：紧急回滚（立即下线）

```bash
# 选项 A: 暂停工作流
# GitHub → Actions → Deploy to GitHub Pages → ... → Disable workflow

# 选项 B: 强制回滚到指定commit
git reset --hard <stable-commit-hash>
git push --force origin main  # ⚠️ 谨慎使用 force push
```

### 场景 3：完全删除部署

```bash
# 1. 删除 GitHub Pages 分支
gh api repos/YYC-Cube/yyc3-braincomputer-system/pages \
  -X DELETE

# 2. 或者在 UI 中操作:
# Settings → Pages → 禁用或更改 Source
```

---

## 监控与告警

### 内置监控（免费）

#### GitHub Actions 通知

```
Settings → Notifications → Email
# 可接收:
# - 工作流成功/失败通知
# - 部署状态变更
```

#### UptimeRobot 监控（推荐）

1. 注册 [uptimerobot.com](https://uptimerobot.com)（免费账户可监控50个站点）
2. 添加监控:
   - **URL**: `https://brain.yyc3.vip`
   - **间隔**: 5分钟
   - **告警**: Email / Webhook / Slack
3. 可获得 99.9% 可用性报告

### 高级监控（可选）

#### Sentry 错误追踪

```bash
# 安装 Sentry SDK
pnpm add @sentry/react

# 在 main.tsx 中初始化
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

#### Google Analytics 统计

在 `index.html` 中添加:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 性能基准

### 当前指标（2026-05-23）

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| **构建时间** | <30s | 1.97s | ✅ 优秀 |
| **主Bundle大小** | <200KB gzip | 112KB gzip | ✅ 优秀 |
| **Lighthouse性能** | >90 | 待测 | ⏳ 首次部署后测量 |
| **首次内容绘制(FCP)** | <1.8s | 待测 | ⏳ |
| **最大内容绘制(LCP)** | <2.5s | 待测 | ⏳ |

### 性能优化建议

1. **图片优化**: 使用 WebP 格式 + 懒加载
2. **字体优化**: 使用 `font-display: swap`
3. **代码分割**: 已实现 React.lazy × 26 ✅
4. **预加载关键资源**: `<link rel="preload">`
5. **CDN加速**: 静态资源走 GitHub CDN ✅

---

## 安全最佳实践

### ✅ 已实施的安全措施

- [x] Content-Security-Policy (CSP)
- [x] X-XSS-Protection 启用
- [x] X-Frame-Options 防劫持
- [x] Strict-Transport-Security (HSTS)
- [x] zod 输入校验
- [x] RateLimiter 频率限制
- [x] 敏感操作确认弹窗
- [x] Environment 检测头

### 🔒 Secrets 管理

**不要做的**:
- ❌ 将密码/token硬编码在代码中
- ❌ 将 `.env` 文件提交到 Git
- ❌ 在日志中打印敏感信息

**应该做的**:
- ✅ 使用 GitHub Secrets 存储敏感变量
- ✅ 定期轮换 Token/密钥
- ✅ 最小权限原则（仅给必要的Secrets）
- ✅ 定期审计 Secrets 使用情况

---

## 附录

### A. 有用的链接

| 资源 | 链接 |
|------|------|
| **GitHub Pages 文档** | https://docs.github.com/en/pages |
| **GitHub Actions 部署** | https://github.com/actions/deploy-pages |
| **Vite 静态部署** | https://vitejs.dev/guide/static-deploy.html |
| **项目 Issues** | https://github.com/YYC-Cube/yyc3-braincomputer-system/issues |
| **技术支持邮箱** | admin@0379.email |

### B. 环境变量速查表

| 变量名 | 说明 | 开发默认 | 生产推荐 |
|--------|------|----------|----------|
| `VITE_API_BASE_URL` | API地址 | `http://192.168.3.100:3118/api/v1` | 留空(auto) |
| `VITE_WS_URL` | WebSocket地址 | `ws://192.168.3.100:3118/api/v1/ws` | 留空(auto) |
| `VITE_API_TEST_MODE` | Mock模式 | `auto` | `true`(初期) |
| `VITE_APP_TITLE` | 应用标题 | `YYC³ Brain Computer System` | 同左 |
| `VITE_APP_VERSION` | 版本号 | `3.2.0` | 同左 |

### C. 故障排除清单

部署前必检:

- [ ] GitHub Pages 已启用 (Source: GitHub Actions)
- [ ] DNS 解析正确且生效
- [ ] GitHub Secrets 已配置 (至少 VITE_API_TEST_MODE)
- [ ] 本地 `pnpm build` 成功
- [ ] 本地 `pnpm test` 通过
- [ ] 无未提交的重要更改
- [ ] `main` 分支保护规则已配置 (可选但推荐)

部署后验证:

- [ ] Actions 工作流显示 ✅ 绿色
- [ ] brain.yyc3.vip 可通过 HTTPS 访问
- [ ] 页面正常加载，无白屏
- [ ] 浏览器控制台无红色错误
- [ ] 所有静态资源 (JS/CSS/图片) 加载正常
- [ ] Mock模式下核心功能可用
- [ ] PWA manifest 正确加载
- [ ] Service Worker 注册成功

---

<div align="center">

> ### 🚀 祝部署顺利！
>
> 如有问题请查看 [Issues](https://github.com/YYC-Cube/yyc3-braincomputer-system/issues) 
> 或发送邮件至 **admin@0379.email**

**文档版本**: v1.0.0 | **最后更新**: 2026-05-23 | **适用版本**: v3.2.0+

</div>
