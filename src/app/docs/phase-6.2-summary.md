# Phase 6.2: Historical Comparison & Alert Threshold Config

> **This Week vs Last Week Trend Analysis + Per-endpoint Alert Thresholds**  
> Build Date: 2026-03-13 | Version: v2.1.0

---

## Deliverables

### 1. Historical Comparison Dashboard (`/components/devops/HistoricalComparison.tsx`)

| Feature | Description | Status |
|---------|-------------|--------|
| Period Toggle | Week-vs-week / Month-vs-month comparison | Done |
| Diff Summary Cards | 4 metric cards (CPU/Memory/Disk/Alerts) with trend arrows | Done |
| Endpoint Diff Bar Chart | Grouped bar chart showing WoW delta per endpoint | Done |
| Per-endpoint Trend Overlay | This-week (solid) vs last-week (dashed) area chart | Done |
| Endpoint/Metric Tabs | Switch between Max/NAS/ECS + CPU/Memory/Disk/Alerts | Done |
| AI Trend Insights | 4 smart insights from historical data analysis | Done |
| Bilingual Support | Full zh/en i18n support | Done |

### 2. Alert Threshold Config (`/components/devops/AlertThresholdConfig.tsx`)

| Feature | Description | Status |
|---------|-------------|--------|
| Global/Independent Mode | Toggle between unified or per-endpoint thresholds | Done |
| Per-endpoint Cards | Max/NAS/ECS each with 4 threshold sliders | Done |
| Threshold Sliders | Bidirectional slider + number input, color-coded | Done |
| Notification Settings | Email / Webhook / Dashboard popup toggles | Done |
| Save/Reset Actions | Save with loading animation, reset to defaults | Done |
| Bilingual Support | Full zh/en i18n support | Done |

### 3. API Endpoints (3 new, total 80 REST + 4 WS)

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| Historical | GET | `/monitor/historical` | Week/month comparison data |
| Get Thresholds | GET | `/monitor/thresholds` | Read alert threshold config |
| Update Thresholds | PUT | `/monitor/thresholds` | Write alert threshold config |

### 4. Test Cases (13 new, total 110)

- TC-HC-001 ~ TC-HC-005: Historical Comparison (5 cases)
- TC-AT-001 ~ TC-AT-005: Alert Threshold Config (5 cases)
- TC-HC-API-001, TC-AT-API-001: API Integration (2 cases)
- TC-62-XM-001, TC-62-XM-002: Cross-module Integration (1 case)

All 110 test cases: **PASSED** (100%)

---

## Architecture

```
Phase 6.2 Components:
  /components/devops/HistoricalComparison.tsx  (~450 lines)
  /components/devops/AlertThresholdConfig.tsx   (~420 lines)

Mock API:
  GET  /monitor/historical    → /api/mock.ts
  GET  /monitor/thresholds    → /api/mock.ts
  PUT  /monitor/thresholds    → /api/mock.ts

Navigation:
  Sidebar: "Historical" (History icon) + "Thresholds" (Sliders icon)
  App.tsx: case 'historical' / case 'thresholds'
```

---

## Next Steps

- **Phase 6.3**: Real backend integration (set `TEST_MODE: false`, connect to `192.168.3.100:3118`)
- **Phase 7**: Capacity planning module with predictive analytics
- **Enhancement**: Link threshold config to ComparisonDashboard highlight logic

---

**Copyright (c) 2026 YanYuCloudCube Team**
