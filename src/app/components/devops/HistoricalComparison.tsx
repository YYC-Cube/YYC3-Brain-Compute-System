/**
 * @file HistoricalComparison.tsx
 * @description Phase 6.2 历史对比仪表盘 — 本周 vs 上周趋势差异分析，含差异百分比、趋势方向、分端点详细对比图表
 * @author YYC3 Team <admin@0379.email>
 * @version 1.0.0
 * @created 2026-03-13
 * @updated 2026-03-13
 * @status published
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags [Phase6.2],[历史对比],[趋势分析],[数据可视化]
 * @depends FuturisticPanel, recharts, motion/react, LanguageContext
 * @see /docs/phase-6.1-kickoff.md
 */

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  Cpu, HardDrive,
  History,
  Info,
  Layers,
  Minus,
  MonitorSpeaker,
  RefreshCw,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { useApi } from '../../api/hooks';
import { ChartContainer } from '../ChartContainer';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Types =====
interface PeriodData {
  day: string;
  cpu: number;
  memory: number;
  disk: number;
  alerts: number;
}

interface EndpointHistorical {
  endpoint: string;
  thisWeek: PeriodData[];
  lastWeek: PeriodData[];
  summary: {
    cpuAvgThis: number;
    cpuAvgLast: number;
    memoryAvgThis: number;
    memoryAvgLast: number;
    diskAvgThis: number;
    diskAvgLast: number;
    alertsThis: number;
    alertsLast: number;
  };
}

interface HistoricalData {
  timestamp: string;
  period: string;
  endpoints: {
    max: EndpointHistorical;
    nas: EndpointHistorical;
    ecs: EndpointHistorical;
  };
  overallTrend: {
    cpu: 'up' | 'down' | 'stable';
    memory: 'up' | 'down' | 'stable';
    disk: 'up' | 'down' | 'stable';
    alerts: 'up' | 'down' | 'stable';
  };
  insights: { zh: string; en: string }[];
}

type MetricKey = 'cpu' | 'memory' | 'disk' | 'alerts';
type CompareMode = 'week' | 'month';

// ===== Constants =====
const ENDPOINT_COLORS = {
  max: '#22d3ee',
  nas: '#a78bfa',
  ecs: '#fb7185',
} as const;

const ENDPOINT_LABELS = {
  max: { zh: 'Max端', en: 'Max' },
  nas: { zh: 'NAS端', en: 'NAS' },
  ecs: { zh: 'ECS端', en: 'ECS' },
} as const;

const METRIC_CONFIG: Record<MetricKey, { zh: string; en: string; icon: React.ReactNode; unit: string; color: string }> = {
  cpu: { zh: 'CPU 均值', en: 'CPU Avg', icon: <Cpu size={14} />, unit: '%', color: '#22d3ee' },
  memory: { zh: '内存均值', en: 'Memory Avg', icon: <MonitorSpeaker size={14} />, unit: '%', color: '#a78bfa' },
  disk: { zh: '磁盘均值', en: 'Disk Avg', icon: <HardDrive size={14} />, unit: '%', color: '#fb7185' },
  alerts: { zh: '告警数', en: 'Alerts', icon: <AlertTriangle size={14} />, unit: '', color: '#fbbf24' },
};

// ===== Helper Components =====

/** TrendIndicator — 趋势方向指示 */
function TrendIndicator({ direction, value, isZh }: { direction: 'up' | 'down' | 'stable'; value: number; isZh: boolean }) {
  const absValue = Math.abs(value);
  if (direction === 'stable' || absValue < 1) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-400 text-[12px]">
        <Minus size={12} />
        <span>{isZh ? '持平' : 'Stable'}</span>
      </span>
    );
  }

  const isUp = direction === 'up';
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] ${isUp ? 'text-red-400' : 'text-green-400'}`}>
      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      <span>{isUp ? '+' : ''}{value.toFixed(1)}%</span>
    </span>
  );
}

/** DiffCard — 指标差异卡片 */
function DiffCard({
  metric, thisVal, lastVal, isZh
}: {
  metric: MetricKey; thisVal: number; lastVal: number; isZh: boolean;
}) {
  const config = METRIC_CONFIG[metric];
  const diff = thisVal - lastVal;
  const diffPct = lastVal !== 0 ? ((diff / lastVal) * 100) : 0;
  const direction: 'up' | 'down' | 'stable' = Math.abs(diffPct) < 1 ? 'stable' : diff > 0 ? 'up' : 'down';
  const isWarning = metric !== 'alerts'
    ? (direction === 'up' && thisVal > 80)
    : (direction === 'up' && thisVal > 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl transition-all ${isWarning ? 'ring-1 ring-red-500/25' : ''}`}
      style={{
        background: isWarning
          ? 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(30,41,59,0.4) 100%)'
          : 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%)',
        border: `1px solid ${isWarning ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.1)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-400 text-[13px]">
          {config.icon}
          <span>{isZh ? config.zh : config.en}</span>
        </div>
        <TrendIndicator direction={direction} value={diffPct} isZh={isZh} />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-white text-[22px]" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            {thisVal.toFixed(1)}{config.unit}
          </div>
          <div className="text-gray-500 text-[11px] mt-1">
            {isZh ? '本周' : 'This week'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-[16px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {lastVal.toFixed(1)}{config.unit}
          </div>
          <div className="text-gray-500 text-[11px] mt-1">
            {isZh ? '上周' : 'Last week'}
          </div>
        </div>
      </div>

      {/* Mini diff bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden flex">
          <div
            className="h-full rounded-full opacity-50"
            style={{
              width: `${Math.min(lastVal, 100)}%`,
              background: config.color,
            }}
          />
        </div>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden flex">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(thisVal, 100)}%`,
              background: config.color,
            }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
        <span>{isZh ? '上周' : 'Last'}</span>
        <span>{isZh ? '本周' : 'This'}</span>
      </div>
    </motion.div>
  );
}

/** DiffBarChart — 差异柱状图 */
function DiffBarChart({ data, isZh }: { data: HistoricalData; isZh: boolean }) {
  const endpoints = ['max', 'nas', 'ecs'] as const;
  const metrics: MetricKey[] = ['cpu', 'memory', 'disk'];

  const chartData = metrics.map(metric => {
    const row: Record<string, any> = { metric: isZh ? METRIC_CONFIG[metric].zh : METRIC_CONFIG[metric].en };
    endpoints.forEach(ep => {
      const s = data.endpoints[ep].summary;
      const thisVal = metric === 'cpu' ? s.cpuAvgThis : metric === 'memory' ? s.memoryAvgThis : s.diskAvgThis;
      const lastVal = metric === 'cpu' ? s.cpuAvgLast : metric === 'memory' ? s.memoryAvgLast : s.diskAvgLast;
      row[`${ep}_diff`] = +(thisVal - lastVal).toFixed(1);
    });
    return row;
  });

  return (
    <ChartContainer height={220}>
      {(width) => (
        <BarChart width={width} height={220} data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`} />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              const ep = name.replace('_diff', '').toUpperCase();
              return [`${value > 0 ? '+' : ''}${value}%`, ep];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value.replace('_diff', '').toUpperCase()}</span>}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
          <Bar dataKey="max_diff" fill={ENDPOINT_COLORS.max} radius={[4, 4, 0, 0]} />
          <Bar dataKey="nas_diff" fill={ENDPOINT_COLORS.nas} radius={[4, 4, 0, 0]} />
          <Bar dataKey="ecs_diff" fill={ENDPOINT_COLORS.ecs} radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartContainer>
  );
}

/** EndpointTrendChart — 单端点本周vs上周趋势叠加 */
function EndpointTrendChart({
  endpointData, endpointKey, metric, isZh
}: {
  endpointData: EndpointHistorical;
  endpointKey: 'max' | 'nas' | 'ecs';
  metric: MetricKey;
  isZh: boolean;
}) {
  const color = ENDPOINT_COLORS[endpointKey];
  const days = isZh
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartData = useMemo(() => {
    return days.map((day, i) => ({
      day,
      thisWeek: endpointData.thisWeek[i]?.[metric] ?? 0,
      lastWeek: endpointData.lastWeek[i]?.[metric] ?? 0,
    }));
  }, [endpointData, metric, days]);

  return (
    <ChartContainer height={180}>
      {(width) => (
        <AreaChart width={width} height={180} data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id={`grad-this-${endpointKey}-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={(v) => metric === 'alerts' ? `${v}` : `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              const label = name === 'thisWeek' ? (isZh ? '本周' : 'This Week') : (isZh ? '上周' : 'Last Week');
              return [`${value.toFixed(1)}${metric === 'alerts' ? '' : '%'}`, label];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px' }}
            formatter={(value) => (
              <span style={{ color: '#9ca3af' }}>
                {value === 'thisWeek' ? (isZh ? '本周' : 'This Week') : (isZh ? '上周' : 'Last Week')}
              </span>
            )}
          />
          <Area type="monotone" dataKey="lastWeek" stroke={color} strokeWidth={1.5} strokeDasharray="5 3" fill="none" dot={false} opacity={0.5} />
          <Area type="monotone" dataKey="thisWeek" stroke={color} strokeWidth={2} fill={`url(#grad-this-${endpointKey}-${metric})`} dot={false} />
        </AreaChart>
      )}
    </ChartContainer>
  );
}

// ===== Main Component =====
export function HistoricalComparison() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [compareMode, setCompareMode] = useState<CompareMode>('week');
  const [activeEndpoint, setActiveEndpoint] = useState<'max' | 'nas' | 'ecs'>('ecs');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('cpu');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: apiData, loading, refetch } = useApi<HistoricalData>(
    'GET',
    '/monitor/historical',
    { period: compareMode },
    { immediate: true, deps: [compareMode] }
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
    setLastUpdated(new Date());
  }, [refetch]);

  if (loading && !apiData) {
    return (
      <div className="p-6 space-y-6">
        <FuturisticPanel title={isZh ? '历史对比分析' : 'Historical Comparison'} icon={<History size={16} className="text-white" />}>
          <div className="flex items-center justify-center h-64">
            <RefreshCw size={24} className="text-cyan-400 animate-spin" />
            <span className="ml-3 text-gray-400">{isZh ? '加载数据中...' : 'Loading data...'}</span>
          </div>
        </FuturisticPanel>
      </div>
    );
  }

  const data = apiData;
  if (!data) return null;

  const endpointKeys = ['max', 'nas', 'ecs'] as const;
  const metricKeys: MetricKey[] = ['cpu', 'memory', 'disk', 'alerts'];

  // Overall summary from the most significant endpoint (ecs)
  const overall = data.endpoints.ecs.summary;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <FuturisticPanel
        title={isZh ? '历史对比分析' : 'Historical Comparison'}
        subtitle={isZh ? '本周 vs 上周性能趋势差异分析' : 'This week vs last week performance trend analysis'}
        icon={<History size={16} className="text-white" />}
        glowEffect
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Compare mode toggle */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {[
                { value: 'week' as CompareMode, zh: '本周 vs 上周', en: 'Week vs Week' },
                { value: 'month' as CompareMode, zh: '本月 vs 上月', en: 'Month vs Month' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setCompareMode(mode.value)}
                  className={`px-3 py-1.5 rounded-md text-[13px] transition-all ${compareMode === mode.value
                      ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  style={compareMode === mode.value ? { border: '1px solid rgba(34,211,238,0.3)' } : { border: '1px solid transparent' }}
                >
                  <Calendar size={12} className="inline mr-1.5" />
                  {isZh ? mode.zh : mode.en}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-gray-400 hover:text-cyan-400 bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <RefreshCw size={13} />
              {isZh ? '刷新' : 'Refresh'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-[12px]">
            <Clock size={12} />
            <span>{isZh ? '最后更新' : 'Updated'}: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </FuturisticPanel>

      {/* Overall Trend Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricKeys.map(metric => {
          const trend = data.overallTrend[metric];
          // Aggregate across all endpoints
          const thisAvg = endpointKeys.reduce((sum, ep) => {
            const s = data.endpoints[ep].summary;
            return sum + (metric === 'cpu' ? s.cpuAvgThis : metric === 'memory' ? s.memoryAvgThis : metric === 'disk' ? s.diskAvgThis : s.alertsThis);
          }, 0) / 3;
          const lastAvg = endpointKeys.reduce((sum, ep) => {
            const s = data.endpoints[ep].summary;
            return sum + (metric === 'cpu' ? s.cpuAvgLast : metric === 'memory' ? s.memoryAvgLast : metric === 'disk' ? s.diskAvgLast : s.alertsLast);
          }, 0) / 3;

          return (
            <DiffCard key={metric} metric={metric} thisVal={thisAvg} lastVal={lastAvg} isZh={isZh} />
          );
        })}
      </div>

      {/* Diff Bar Chart — All endpoints diff summary */}
      <FuturisticPanel
        title={isZh ? '端点差异概览' : 'Endpoint Diff Overview'}
        subtitle={isZh ? '各端点指标周环比变化量' : 'Week-over-week change by endpoint and metric'}
        icon={<BarChart3 size={16} className="text-white" />}
        variant="primary"
      >
        <DiffBarChart data={data} isZh={isZh} />
        <div className="flex items-center gap-2 mt-3 px-1 text-[11px] text-gray-500">
          <Info size={11} />
          <span>{isZh ? '正值表示本周高于上周，负值表示本周低于上周' : 'Positive = higher this week, negative = lower this week'}</span>
        </div>
      </FuturisticPanel>

      {/* Per-endpoint detail comparison */}
      <FuturisticPanel
        title={isZh ? '分端点趋势对比' : 'Per-endpoint Trend Comparison'}
        subtitle={isZh ? '选择端点和指标查看本周与上周叠加趋势' : 'Select endpoint & metric to view overlaid this-vs-last week trends'}
        icon={<Layers size={16} className="text-white" />}
        variant="secondary"
      >
        {/* Endpoint tabs */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {endpointKeys.map(ep => {
              const label = isZh ? ENDPOINT_LABELS[ep].zh : ENDPOINT_LABELS[ep].en;
              return (
                <button
                  key={ep}
                  onClick={() => setActiveEndpoint(ep)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all ${activeEndpoint === ep
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                    }`}
                  style={activeEndpoint === ep ? {
                    border: `1px solid ${ENDPOINT_COLORS[ep]}40`,
                    boxShadow: `0 0 8px ${ENDPOINT_COLORS[ep]}15`,
                  } : { border: '1px solid transparent' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: ENDPOINT_COLORS[ep] }} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Metric tabs */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {metricKeys.map(m => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-3 py-1.5 rounded-md text-[13px] transition-all ${activeMetric === m
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-gray-300 border border-transparent'
                  }`}
              >
                {isZh ? METRIC_CONFIG[m].zh : METRIC_CONFIG[m].en}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeEndpoint}-${activeMetric}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2 px-1">
              <Activity size={14} style={{ color: ENDPOINT_COLORS[activeEndpoint] }} />
              <span className="text-gray-300 text-[13px]">
                {isZh ? ENDPOINT_LABELS[activeEndpoint].zh : ENDPOINT_LABELS[activeEndpoint].en}
                {' — '}
                {isZh ? METRIC_CONFIG[activeMetric].zh : METRIC_CONFIG[activeMetric].en}
              </span>
            </div>
            <EndpointTrendChart
              endpointData={data.endpoints[activeEndpoint]}
              endpointKey={activeEndpoint}
              metric={activeMetric}
              isZh={isZh}
            />
          </motion.div>
        </AnimatePresence>

        {/* Endpoint summary mini cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {endpointKeys.map(ep => {
            const s = data.endpoints[ep].summary;
            const thisVal = activeMetric === 'cpu' ? s.cpuAvgThis : activeMetric === 'memory' ? s.memoryAvgThis : activeMetric === 'disk' ? s.diskAvgThis : s.alertsThis;
            const lastVal = activeMetric === 'cpu' ? s.cpuAvgLast : activeMetric === 'memory' ? s.memoryAvgLast : activeMetric === 'disk' ? s.diskAvgLast : s.alertsLast;
            const diff = thisVal - lastVal;
            const diffPct = lastVal !== 0 ? ((diff / lastVal) * 100) : 0;
            const isActive = activeEndpoint === ep;

            return (
              <button
                key={ep}
                onClick={() => setActiveEndpoint(ep)}
                className={`p-3 rounded-lg text-left transition-all ${isActive ? 'ring-1' : ''}`}
                style={{
                  background: isActive ? `${ENDPOINT_COLORS[ep]}10` : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? `${ENDPOINT_COLORS[ep]}30` : 'rgba(148,163,184,0.1)',
                  border: `1px solid ${isActive ? `${ENDPOINT_COLORS[ep]}30` : 'rgba(148,163,184,0.1)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: ENDPOINT_COLORS[ep] }} />
                    <span className="text-gray-300 text-[12px]">
                      {isZh ? ENDPOINT_LABELS[ep].zh : ENDPOINT_LABELS[ep].en}
                    </span>
                  </div>
                  <TrendIndicator
                    direction={Math.abs(diffPct) < 1 ? 'stable' : diff > 0 ? 'up' : 'down'}
                    value={diffPct}
                    isZh={isZh}
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-[16px]" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {thisVal.toFixed(1)}{activeMetric === 'alerts' ? '' : '%'}
                  </span>
                  <span className="text-gray-500 text-[12px]">
                    vs {lastVal.toFixed(1)}{activeMetric === 'alerts' ? '' : '%'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </FuturisticPanel>

      {/* AI Insights */}
      <FuturisticPanel
        title={isZh ? 'AI 趋势洞察' : 'AI Trend Insights'}
        subtitle={isZh ? '基于历史数据的智能趋势分析' : 'Smart trend analysis from historical data'}
        icon={<Zap size={16} className="text-white" />}
      >
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div className="space-y-2">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/5">
                <Zap size={13} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-[13px]">{isZh ? insight.zh : insight.en}</span>
              </div>
            ))}
          </div>
        </div>
      </FuturisticPanel>
    </div>
  );
}
