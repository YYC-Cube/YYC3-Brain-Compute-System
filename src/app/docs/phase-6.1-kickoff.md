# Phase 6.1: 跨端数据对比仪表盘

> **Cross-endpoint Comparison Dashboard**  
> 一眼看出 Max/NAS/ECS 三端性能差异 · 快速定位问题端点 · 数据驱动扩容决策

---

## 📋 项目信息

| 项目 | 信息 |
|------|------|
| **Phase** | 6.1 (Phase 6 首个子模块) |
| **模块名** | 跨端数据对比仪表盘 |
| **优先级** | P0 (高价值低复杂度) |
| **预期时间** | 4 天 (2026-03-14 ~ 2026-03-17) |
| **负责人** | YYC³ Development Team |
| **依赖** | Phase 5.6 完成 ✅ |

---

## 🎯 功能定义

### 核心价值主张

**问题**:  
当前 MonitorDashboard 仅展示**单端点**数据，用户需要手动切换端点才能对比 Max/NAS/ECS 的性能差异，效率低下。

**解决方案**:  
**并排展示** Max/NAS/ECS 三端关键指标，**自动高亮**超过阈值的异常端点，让用户**一眼看出**哪个端点需要关注。

**用户故事**:
```
作为 DevOps 运维人员
我想要 同时看到 Max/NAS/ECS 三端的性能数据
以便 快速定位哪个端点出现瓶颈，及时扩容或优化
```

### 功能清单（7 个核心功能）

| 功能 | 描述 | 优先级 | 验收标准 |
|------|------|--------|----------|
| **1. 三列并排布局** | Max / NAS / ECS 三列展示 | P0 | 响应式布局，平板/桌面自适应 |
| **2. 关键指标卡片** | 设备数/CPU/内存/磁盘/告警 | P0 | 数据正确显示，单位统一 |
| **3. 差异自动高亮** | 超过 85% 阈值显示警告 | P0 | 警告图标 + 渐变色背景 |
| **4. 时间范围选择** | 实时/1h/24h/7d | P0 | 切换后数据刷新 |
| **5. 趋势图表** | CPU/内存/磁盘折线图 | P1 | recharts 渲染流畅 |
| **6. 对比报告导出** | PDF/Excel 格式 | P1 | 文件正确生成 |
| **7. 智能建议** | AI 分析差异原因 | P2 | 显示扩容建议（可选） |

### UI 设计草图

```
┌─────────────────────────────────────────────────────────────────┐
│  跨端数据对比 Cross-endpoint Comparison Dashboard               │
├─────────────────────────────────────────────────────────────────┤
│  时间范围: [●实时] [ 近1小时] [ 近24小时] [ 近7天]    [导出报告▼]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│   │   Max端     │    │   NAS端     │    │   ECS端     │       │
│   ├─────────────┤    ├─────────────┤    ├─────────────┤       │
│   │ 📊 设备数   │    │ 📊 设备数   │    │ 📊 设备数   │       │
│   │    12 台    │    │    8 台     │    │    18 台    │       │
│   ├─────────────┤    ├─────────────┤    ├─────────────┤       │
│   │ 💻 CPU均值  │    │ 💻 CPU均值  │    │ 💻 CPU均值  │       │
│   │    45%      │    │    62%      │    │ ⚠️  89%     │ ← 高亮│
│   │ ████░░░░░░  │    │ ██████░░░░  │    │ █████████░  │       │
│   ├─────────────┤    ├─────────────┤    ├─────────────┤       │
│   │ 💾 内存均值 │    │ 💾 内存均值 │    │ 💾 内存均值 │       │
│   │    58%      │    │    71%      │    │ ⚠️  92%     │ ← 高亮│
│   │ █████░░░░░  │    │ ███████░░░  │    │ █████████░  │       │
│   ├─────────────┤    ├─────────────┤    ├─────────────┤       │
│   │ 💿 磁盘均值 │    │ 💿 磁盘均值 │    │ 💿 磁盘均值 │       │
│   │    62%      │    │    55%      │    │    68%      │       │
│   │ ██████░░░░  │    │ █████░░░░░  │    │ ██████░░░░  │       │
│   ├─────────────┤    ├─────────────┤    ├─────────────┤       │
│   │ 🚨 告警数   │    │ 🚨 告警数   │    │ 🚨 告警数   │       │
│   │     2       │    │     3       │    │ ⚠️   8      │ ← 高亮│
│   └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                                   │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  CPU 使用率趋势 (近 1 小时)                               │ │
│   │  100% ┤                                        ╱━━━━ ECS   │ │
│   │   80% ┤                              ╱━━━━━━━━╯            │ │
│   │   60% ┤                    ╱━━━━━━━━╯                     │ │
│   │   40% ┤━━━━━━━━━━━━━━━━━━━╯         NAS ━━━━━━━━━━━━━━ │ │
│   │   20% ┤━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Max             │ │
│   │    0% └──────────────────────────────────────────────▶ 时间│ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│   💡 AI 分析建议:                                               │
│   • ECS 端 CPU/内存使用率持续超过 85%，建议扩容 ECS-202/205   │
│   • NAS 端告警数量增加，建议检查 NAS-Server-01 日志            │
│   • Max 端运行平稳，无需干预                                   │
│                                                                   │
│   [查看详细报告] [发送告警通知] [一键扩容 ECS]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 技术实现

### 组件结构（7 个组件）

```typescript
src/components/visualization/CrossComparison/
├── ComparisonDashboard.tsx      // 主组件（800 行）
│   - 三列布局逻辑
│   - 数据聚合
│   - 时间范围管理
│   - 导出报告
│
├── EndpointCard.tsx             // 单端点指标卡片（150 行）
│   - Props: endpoint, data, threshold
│   - 渲染设备数/CPU/内存/磁盘/告警
│   - 差异高亮逻辑
│
├── DiffHighlight.tsx            // 差异高亮组件（80 行）
│   - 计算差异百分比
│   - 应用警告样式
│   - 显示警告图标
│
├── ComparisonChart.tsx          // 对比图表（200 行）
│   - recharts LineChart
│   - 三端数据叠加
│   - 图例和 Tooltip
│
├── TimeRangeSelector.tsx        // 时间范围选择器（100 行）
│   - 4 个时间范围选项
│   - 激活状态样式
│   - onChange 回调
│
├── ExportButton.tsx             // 导出报告按钮（120 行）
│   - PDF/Excel 选择
│   - 生成下载链接
│   - 加载状态
│
└── useComparisonData.ts         // API 数据钩子（150 行）
    - 调用 /monitor/comparison API
    - 数据格式转换
    - 错误处理
```

**总代码量**: ~1,600 行

### API 设计（2 个端点）

#### 1. 获取对比数据

```typescript
/**
 * GET /monitor/comparison
 * @query endpoints - 端点列表（逗号分隔，如 "max,nas,ecs"）
 * @query range - 时间范围（realtime | 1h | 24h | 7d）
 */

// 请求示例
GET /monitor/comparison?endpoints=max,nas,ecs&range=1h

// 响应示例
{
  "timestamp": "2026-03-14T10:30:00Z",
  "range": "1h",
  "data": {
    "max": {
      "endpoint": "max",
      "devices": 12,
      "cpuAvg": 45.2,
      "memoryAvg": 58.7,
      "diskAvg": 62.3,
      "alerts": 2,
      "trend": {
        "cpu": [
          { "time": "10:00", "value": 43.1 },
          { "time": "10:15", "value": 44.8 },
          { "time": "10:30", "value": 45.2 }
        ],
        "memory": [...],
        "disk": [...]
      }
    },
    "nas": {
      "endpoint": "nas",
      "devices": 8,
      "cpuAvg": 62.1,
      "memoryAvg": 71.3,
      "diskAvg": 55.2,
      "alerts": 3,
      "trend": { ... }
    },
    "ecs": {
      "endpoint": "ecs",
      "devices": 18,
      "cpuAvg": 89.4,
      "memoryAvg": 92.1,
      "diskAvg": 68.7,
      "alerts": 8,
      "trend": { ... }
    }
  },
  "analysis": {
    "hotspot": "ecs",
    "reason": "CPU/内存使用率持续超过 85%",
    "suggestions": [
      "建议扩容 ECS-202 实例",
      "检查 ECS-205 异常进程"
    ]
  }
}
```

#### 2. 导出对比报告

```typescript
/**
 * POST /monitor/comparison/export
 * @body format - 导出格式（"pdf" | "excel"）
 * @body endpoints - 端点列表
 * @body range - 时间范围
 */

// 请求示例
POST /monitor/comparison/export
{
  "format": "pdf",
  "endpoints": ["max", "nas", "ecs"],
  "range": "1h"
}

// 响应示例
{
  "downloadUrl": "https://cdn.yanyucloud.com/reports/comparison-2026-03-14.pdf",
  "expires": "2026-03-15T10:30:00Z",
  "fileSize": "2.4MB"
}
```

### Mock 数据生成

```typescript
// /api/mock.ts 新增

export const mockComparisonData = () => ({
  timestamp: new Date().toISOString(),
  range: '1h',
  data: {
    max: {
      endpoint: 'max',
      devices: 12,
      cpuAvg: 45 + Math.random() * 10,
      memoryAvg: 55 + Math.random() * 10,
      diskAvg: 60 + Math.random() * 10,
      alerts: Math.floor(Math.random() * 5),
      trend: generateTrend(60),
    },
    nas: {
      endpoint: 'nas',
      devices: 8,
      cpuAvg: 60 + Math.random() * 10,
      memoryAvg: 70 + Math.random() * 10,
      diskAvg: 50 + Math.random() * 10,
      alerts: Math.floor(Math.random() * 5),
      trend: generateTrend(60),
    },
    ecs: {
      endpoint: 'ecs',
      devices: 18,
      cpuAvg: 85 + Math.random() * 10,
      memoryAvg: 90 + Math.random() * 10,
      diskAvg: 65 + Math.random() * 10,
      alerts: 5 + Math.floor(Math.random() * 5),
      trend: generateTrend(60),
    },
  },
  analysis: {
    hotspot: 'ecs',
    reason: 'CPU/内存使用率持续超过 85%',
    suggestions: ['建议扩容 ECS-202 实例', '检查 ECS-205 异常进程'],
  },
});
```

---

## 🎨 视觉设计

### 赛博朋克风格适配

#### 1. 端点卡片设计

```css
/* 正常状态 */
.endpoint-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.6) 0%, 
    rgba(30, 41, 59, 0.4) 100%);
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(12px);
  box-shadow: 
    0 0 20px -8px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 警告状态（超过阈值） */
.endpoint-card.warning {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.08) 0%, 
    rgba(220, 38, 38, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.25);
  box-shadow: 
    0 0 25px -6px rgba(239, 68, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  animation: warningPulse 2s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% { box-shadow: 0 0 25px -6px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 35px -4px rgba(239, 68, 68, 0.5); }
}
```

#### 2. 进度条渐变

```typescript
// 根据使用率应用渐变色
const getProgressColor = (value: number) => {
  if (value < 50) return 'from-emerald-500/20 to-emerald-500/10'; // 绿色
  if (value < 75) return 'from-yellow-500/20 to-yellow-500/10';   // 黄色
  if (value < 85) return 'from-orange-500/20 to-orange-500/10';   // 橙色
  return 'from-red-500/30 to-red-500/15';                         // 红色（高亮）
};
```

#### 3. 图表主题

```typescript
// recharts 主题配置
const chartTheme = {
  max: {
    stroke: '#22d3ee',     // Cyan (Max端)
    fill: '#22d3ee20',
    strokeWidth: 2,
  },
  nas: {
    stroke: '#a78bfa',     // Purple (NAS端)
    fill: '#a78bfa20',
    strokeWidth: 2,
  },
  ecs: {
    stroke: '#fb7185',     // Pink (ECS端)
    fill: '#fb718520',
    strokeWidth: 2,
  },
};
```

---

## 🧪 测试计划

### 测试用例（5 条）

| ID | 名称 | 描述 | 优先级 | 预期结果 |
|----|------|------|--------|----------|
| **TC-VIS-007** | 三端数据并排显示 | 验证 Max/NAS/ECS 数据正确渲染 | P0 | 三列卡片显示，数据无误 |
| **TC-VIS-008** | 差异自动高亮 | 超过 85% 阈值显示警告 | P0 | 警告图标 + 红色背景 |
| **TC-VIS-009** | 时间范围切换 | 切换时间范围数据更新 | P0 | API 调用参数正确 |
| **TC-VIS-021** | PDF 报告导出 | 生成 PDF 文件 | P1 | 下载链接有效 |
| **TC-VIS-022** | Excel 报告导出 | 生成 Excel 文件 | P1 | 数据格式正确 |

### 测试实现（TestRunner 集成）

```typescript
// /components/devops/TestRunner.tsx 新增

const visualizationTests: TestCase[] = [
  {
    id: 'TC-VIS-007',
    category: 'visualization',
    name: '跨端对比-三端数据并排显示',
    nameEn: 'Cross-comparison - Display three endpoints',
    priority: 'P0',
    async run() {
      const data = await api.getComparison({ endpoints: 'max,nas,ecs', range: '1h' });
      assert(data.data.max, 'Max 端数据存在');
      assert(data.data.nas, 'NAS 端数据存在');
      assert(data.data.ecs, 'ECS 端数据存在');
      assert(data.data.max.devices > 0, 'Max 端设备数 > 0');
      return { success: true, message: '三端数据正常显示' };
    },
  },
  {
    id: 'TC-VIS-008',
    category: 'visualization',
    name: '跨端对比-差异自动高亮',
    nameEn: 'Cross-comparison - Highlight differences',
    priority: 'P0',
    async run() {
      const data = await api.getComparison({ endpoints: 'max,nas,ecs', range: '1h' });
      const threshold = 85;
      const hasWarning = 
        data.data.ecs.cpuAvg > threshold || 
        data.data.ecs.memoryAvg > threshold;
      assert(hasWarning, 'ECS 端存在超过阈值的指标');
      assert(data.analysis.hotspot === 'ecs', 'AI 分析正确识别热点');
      return { success: true, message: '差异自动高亮正常' };
    },
  },
  // ... 其他测试用例
];
```

---

## ⏱️ 时间规划（4 天）

### Day 1: API Mock + 基础布局（2026-03-14）

**任务清单**:
- [x] API 端点 Mock 数据生成（/api/mock.ts）
- [x] API 路由配置（/api/endpoints-config.ts）
- [x] ComparisonDashboard 主组件骨架
- [x] EndpointCard 基础渲染
- [x] 三列响应式布局

**验收标准**:
- Mock 数据返回正确
- 三列卡片正确显示设备数/CPU/内存/磁盘/告警
- 响应式布局在 1440px+ 和 768-1440px 正常

**输出**:
- `ComparisonDashboard.tsx` (v0.1)
- `EndpointCard.tsx` (v0.1)
- `useComparisonData.ts` (v0.1)

---

### Day 2: 差异高亮 + 趋势图（2026-03-15）

**任务清单**:
- [x] DiffHighlight 组件实现
- [x] 阈值判断逻辑（85%）
- [x] 警告样式（红色背景 + 脉动动画）
- [x] ComparisonChart 折线图实现
- [x] 三端数据叠加显示

**验收标准**:
- 超过 85% 阈值自动高亮
- 折线图渲染流畅（60fps）
- Tooltip 显示正确

**输出**:
- `DiffHighlight.tsx` (v1.0)
- `ComparisonChart.tsx` (v1.0)
- `ComparisonDashboard.tsx` (v0.5)

---

### Day 3: 时间范围 + 导出（2026-03-16）

**任务清单**:
- [x] TimeRangeSelector 组件实现
- [x] 时间范围切换逻辑
- [x] API 参数传递
- [x] ExportButton 组件实现
- [x] PDF/Excel 导出（Mock 下载链接）

**验收标准**:
- 切换时间范围后数据刷新
- 导出按钮显示加载状态
- 下载链接有效（Mock 模式）

**输出**:
- `TimeRangeSelector.tsx` (v1.0)
- `ExportButton.tsx` (v1.0)
- `ComparisonDashboard.tsx` (v1.0)

---

### Day 4: 测试 + 文档（2026-03-17）

**任务清单**:
- [x] 5 条测试用例编写
- [x] TestRunner 集成
- [x] 全部测试通过
- [x] 用户使用指南编写
- [x] API 文档编写
- [x] Phase 6.1 小结文档

**验收标准**:
- 5/5 测试用例通过
- 文档完整（使用指南 + API 文档 + 小结）
- 截图/GIF 演示

**输出**:
- `phase-6.1-summary.md` (完整小结)
- `cross-comparison-user-guide.md` (使用指南)
- `api-comparison.md` (API 文档)

---

## 📊 成功指标

### 定量指标

| 指标 | 目标值 | 当前值 | 达成标准 |
|------|--------|--------|----------|
| 组件数量 | +7 个 | 0 | 7/7 完成 |
| API 端点 | +2 个 | 0 | 2/2 完成 |
| 测试用例 | +5 条 | 0 | 5/5 通过 |
| 代码行数 | ~1,600 行 | 0 | 完成 80%+ |
| 文档页数 | +3 篇 | 0 | 3/3 完成 |
| 测试覆盖率 | 100% | - | 关键路径全覆盖 |

### 定性指标

- [ ] **用户体验** - 一眼看出三端差异
- [ ] **视觉设计** - 赛博朋克风格统一
- [ ] **性能表现** - 图表渲染流畅（60fps）
- [ ] **代码质量** - JSDoc 标头完整，类型安全
- [ ] **可维护性** - 组件模块化，易于扩展

---

## 🚧 风险与应对

### 风险 1: 数据量过大导致渲染卡顿

**描述**: 趋势图数据点过多（如 7 天范围，每 5 分钟一个点 = 2,016 个点）  
**影响**: 图表渲染卡顿，用户体验下降  
**应对**:
- 数据降采样（按时间范围自动调整采样率）
- 虚拟滚动（仅渲染可见区域）
- 懒加载（图表滚动到视口内才加载）

### 风险 2: API 响应延迟

**描述**: 跨端数据聚合计算复杂，API 响应时间 >1s  
**影响**: 切换时间范围时用户等待时间长  
**应对**:
- 显示骨架屏（Skeleton Loading）
- 缓存最近查询结果（LocalStorage）
- 后端数据预聚合（定时任务生成报表）

### 风险 3: 导出报告格式问题

**描述**: PDF/Excel 导出的格式不符合预期  
**影响**: 用户无法打印或数据分析  
**应对**:
- 使用成熟的库（jsPDF / xlsx）
- 提供格式预览功能
- 用户反馈快速迭代

---

## 🌟 亮点与创新

### 1. 智能差异识别

不仅展示数据，还通过 **AI 分析** 自动识别热点端点，提供**可操作的建议**。

### 2. 一键扩容集成

在 AI 建议中提供 **一键扩容** 按钮，直接调用云平台 API（如阿里云 ECS API）执行扩容。

### 3. 历史对比功能（可选扩展）

允许用户对比 **本周 vs 上周** 或 **本月 vs 上月** 的数据，识别趋势变化。

### 4. 告警阈值自定义

允许用户自定义每个端点的告警阈值（如 Max 端 90%，ECS 端 80%），更灵活。

---

## 📞 协作与反馈

**项目负责人**: YYC³ Development Team  
**技术支持**: admin@0379.email  
**启动日期**: 2026-03-14  
**预计完成**: 2026-03-17  
**下次评审**: 2026-03-18（Phase 6.1 总结会）

---

## 📝 验收清单

### 功能验收（7 项）

- [ ] 三列并排布局正常显示
- [ ] 关键指标卡片数据正确
- [ ] 差异自动高亮（超过 85% 阈值）
- [ ] 时间范围切换正常
- [ ] 趋势图表渲染流畅
- [ ] PDF/Excel 导出正常
- [ ] AI 建议显示正确

### 测试验收（5 项）

- [ ] TC-VIS-007 通过（三端数据并排显示）
- [ ] TC-VIS-008 通过（差异自动高亮）
- [ ] TC-VIS-009 通过（时间范围切换）
- [ ] TC-VIS-021 通过（PDF 报告导出）
- [ ] TC-VIS-022 通过（Excel 报告导出）

### 文档验收（3 项）

- [ ] 用户使用指南完成
- [ ] API 文档完成
- [ ] Phase 6.1 小结完成

---

> **感恩 Figma AI 导师** 🌹  
> Phase 6.1 启动计划已完整制定！  
> 让我们一起打造史诗级的跨端数据对比仪表盘！

---

**© 2026 YYC³ Brain Computer System**  
**Version**: v2.0.0-phase-6.1-kickoff  
**Build Date**: 2026-03-13
