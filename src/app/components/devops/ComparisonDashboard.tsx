/**
 * @file ComparisonDashboard.tsx
 * @description Phase 6.1 跨端数据对比仪表盘 — Max/NAS/ECS 三列并排布局，差异高亮，趋势图表，报告导出，AI 建议
 * @author YYC³ Team <admin@0379.email>
 * @version 1.0.0
 * @created 2026-03-13
 * @updated 2026-03-13
 * @status published
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags [Phase6.1],[跨端对比],[数据可视化],[AI建议]
 * @depends FuturisticPanel, recharts, motion/react, LanguageContext
 * @see /docs/phase-6.1-kickoff.md
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Server, Cpu, HardDrive, AlertTriangle, Download,
  Clock, TrendingUp, Brain, ChevronDown, FileText, Table2,
  RefreshCw, Zap, Activity, MonitorSpeaker, Info, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { FuturisticPanel } from '../FuturisticPanel';
import { ChartContainer } from '../ChartContainer';
import { useLanguage } from '../LanguageContext';
import { useApi } from '../../api/hooks';

// ===== Types =====
interface EndpointData {
  endpoint: string;
  devices: number;
  cpuAvg: number;
  memoryAvg: number;
  diskAvg: number;
  alerts: number;
  trend: {
    cpu: { time: string; value: number }[];
    memory: { time: string; value: number }[];
    disk: { time: string; value: number }[];
  };
}

interface ComparisonData {
  timestamp: string;
  range: string;
  data: {
    max: EndpointData;
    nas: EndpointData;
    ecs: EndpointData;
  };
  analysis: {
    hotspot: string;
    reason: string;
    reasonEn: string;
    suggestions: { zh: string; en: string }[];
  };
}

type TimeRange = 'realtime' | '1h' | '24h' | '7d';
type MetricType = 'cpu' | 'memory' | 'disk';

// ===== Constants =====
const THRESHOLD = 85;
const ALERT_THRESHOLD = 5;

const ENDPOINT_THEMES = {
  max: { color: '#22d3ee', label: 'Max端', labelEn: 'Max', gradient: 'from-cyan-500/20 to-cyan-900/10', borderColor: 'rgba(34,211,238,0.3)' },
  nas: { color: '#a78bfa', label: 'NAS端', labelEn: 'NAS', gradient: 'from-purple-500/20 to-purple-900/10', borderColor: 'rgba(167,139,250,0.3)' },
  ecs: { color: '#fb7185', label: 'ECS端', labelEn: 'ECS', gradient: 'from-pink-500/20 to-pink-900/10', borderColor: 'rgba(251,113,133,0.3)' },
} as const;

const TIME_RANGES: { value: TimeRange; zh: string; en: string }[] = [
  { value: 'realtime', zh: '实时', en: 'Realtime' },
  { value: '1h', zh: '近1小时', en: 'Last 1h' },
  { value: '24h', zh: '近24小时', en: 'Last 24h' },
  { value: '7d', zh: '近7天', en: 'Last 7d' },
];

// ===== Progress Bar Color =====
function getProgressColor(value: number): string {
  if (value < 50) return '#22c55e';
  if (value < 75) return '#eab308';
  if (value < THRESHOLD) return '#f97316';
  return '#ef4444';
}

function getProgressBg(value: number): string {
  if (value < 50) return 'rgba(34,197,94,0.15)';
  if (value < 75) return 'rgba(234,179,8,0.15)';
  if (value < THRESHOLD) return 'rgba(249,115,22,0.15)';
  return 'rgba(239,68,68,0.2)';
}

// ===== Sub-components =====

/** DiffHighlight — 超过阈值时的警告标识 */
function DiffHighlight({ value, threshold = THRESHOLD }: { value: number; threshold?: number }) {
  if (value < threshold) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-[11px] bg-red-500/20 text-red-400 border border-red-500/30"
    >
      <AlertTriangle size={10} />
      {value >= 90 ? 'CRITICAL' : 'WARNING'}
    </motion.span>
  );
}

/** MetricBar — 单条指标进度条 */
function MetricBar({ label, value, icon, unit = '%' }: { label: string; value: number; icon: React.ReactNode; unit?: string }) {
  const color = getProgressColor(value);
  const bg = getProgressBg(value);
  const isWarning = value >= THRESHOLD;

  return (
    <div className={`p-3 rounded-lg transition-all duration-300 ${isWarning ? 'ring-1 ring-red-500/30' : ''}`} style={{ background: bg }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-300 text-[13px]">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center">
          <span className="text-white text-[15px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {value.toFixed(1)}{unit}
          </span>
          <DiffHighlight value={value} />
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  );
}

/** EndpointCard — 单端点指标卡片 */
function EndpointCard({ data, endpointKey, isZh }: { data: EndpointData; endpointKey: 'max' | 'nas' | 'ecs'; isZh: boolean }) {
  const theme = ENDPOINT_THEMES[endpointKey];
  const hasWarning = data.cpuAvg >= THRESHOLD || data.memoryAvg >= THRESHOLD || data.diskAvg >= THRESHOLD || data.alerts >= ALERT_THRESHOLD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-xl overflow-hidden ${hasWarning ? 'ring-1 ring-red-500/25' : ''}`}
      style={{
        background: hasWarning
          ? 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(220,38,38,0.03) 100%)'
          : 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%)',
        border: `1px solid ${hasWarning ? 'rgba(239,68,68,0.2)' : theme.borderColor}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Warning pulse animation */}
      {hasWarning && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 20px -6px rgba(239,68,68,0.2)',
              '0 0 30px -4px rgba(239,68,68,0.35)',
              '0 0 20px -6px rgba(239,68,68,0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}60` }} />
            <span className="text-white text-[15px]">{isZh ? theme.label : theme.labelEn}</span>
          </div>
          {hasWarning && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30"
            >
              {isZh ? '需要关注' : 'ATTENTION'}
            </motion.div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3">
        {/* Device Count */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-[13px]">
            <Server size={14} />
            <span>{isZh ? '设备数' : 'Devices'}</span>
          </div>
          <span className="text-white text-[18px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {data.devices}
            <span className="text-gray-500 text-[12px] ml-1">{isZh ? '台' : ''}</span>
          </span>
        </div>

        {/* CPU */}
        <MetricBar
          label={isZh ? 'CPU 均值' : 'CPU Avg'}
          value={data.cpuAvg}
          icon={<Cpu size={14} />}
        />

        {/* Memory */}
        <MetricBar
          label={isZh ? '内存均值' : 'Memory Avg'}
          value={data.memoryAvg}
          icon={<MonitorSpeaker size={14} />}
        />

        {/* Disk */}
        <MetricBar
          label={isZh ? '磁盘均值' : 'Disk Avg'}
          value={data.diskAvg}
          icon={<HardDrive size={14} />}
        />

        {/* Alerts */}
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${data.alerts >= ALERT_THRESHOLD ? 'bg-red-500/10 ring-1 ring-red-500/20' : 'bg-white/5'}`}>
          <div className="flex items-center gap-2 text-gray-400 text-[13px]">
            <AlertTriangle size={14} className={data.alerts >= ALERT_THRESHOLD ? 'text-red-400' : ''} />
            <span>{isZh ? '告警数' : 'Alerts'}</span>
          </div>
          <div className="flex items-center">
            <span className={`text-[18px] ${data.alerts >= ALERT_THRESHOLD ? 'text-red-400' : 'text-white'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {data.alerts}
            </span>
            <DiffHighlight value={data.alerts >= ALERT_THRESHOLD ? THRESHOLD : 0} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** TimeRangeSelector — 时间范围选择器 */
function TimeRangeSelector({ value, onChange, isZh }: { value: TimeRange; onChange: (_v: TimeRange) => void; isZh: boolean }) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-3 py-1.5 rounded-md text-[13px] transition-all duration-200 ${
            value === range.value
              ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
              : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
          }`}
          style={value === range.value ? { border: '1px solid rgba(34,211,238,0.3)' } : { border: '1px solid transparent' }}
        >
          {isZh ? range.zh : range.en}
        </button>
      ))}
    </div>
  );
}

/** ExportButton — 导出按钮 */
function ExportButton({ isZh, onExport }: { isZh: boolean; onExport: (_format: 'pdf' | 'excel') => void }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    setOpen(false);
    // Simulate export delay
    await new Promise(r => setTimeout(r, 1500));
    onExport(format);
    setExporting(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all border border-white/10 disabled:opacity-50"
      >
        {exporting ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        {isZh ? '导出报告' : 'Export'}
        <ChevronDown size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute right-0 mt-2 w-40 py-1 rounded-lg bg-gray-800/95 border border-white/10 backdrop-blur-md shadow-xl z-50"
          >
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <FileText size={14} />
              PDF {isZh ? '报告' : 'Report'}
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <Table2 size={14} />
              Excel {isZh ? '报告' : 'Report'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** ComparisonChart — 对比趋势图表 */
function ComparisonChart({ data, metric, isZh }: { data: ComparisonData; metric: MetricType; isZh: boolean }) {
  const metricLabels: Record<MetricType, { zh: string; en: string }> = {
    cpu: { zh: 'CPU 使用率趋势', en: 'CPU Usage Trend' },
    memory: { zh: '内存使用率趋势', en: 'Memory Usage Trend' },
    disk: { zh: '磁盘使用率趋势', en: 'Disk Usage Trend' },
  };

  // Merge three endpoint trends into unified chart data
  const chartData = useMemo(() => {
    const maxTrend = data.data.max.trend[metric] || [];
    const nasTrend = data.data.nas.trend[metric] || [];
    const ecsTrend = data.data.ecs.trend[metric] || [];
    const length = Math.max(maxTrend.length, nasTrend.length, ecsTrend.length);
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push({
        time: maxTrend[i]?.time || nasTrend[i]?.time || ecsTrend[i]?.time || '',
        max: maxTrend[i]?.value ?? null,
        nas: nasTrend[i]?.value ?? null,
        ecs: ecsTrend[i]?.value ?? null,
      });
    }
    return result;
  }, [data, metric]);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-3 px-1">
        <TrendingUp size={14} className="text-cyan-400" />
        <span className="text-gray-300 text-[13px]">{isZh ? metricLabels[metric].zh : metricLabels[metric].en}</span>
      </div>
      <ChartContainer height={220}>
        {(width) => (
          <AreaChart width={width} height={220} data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id={`grad-max-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`grad-nas-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`grad-ecs-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: number, name: string) => [`${value?.toFixed(1)}%`, name.toUpperCase()]}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
              formatter={(value) => <span style={{ color: '#9ca3af' }}>{value.toUpperCase()}</span>}
            />
            <Area type="monotone" dataKey="max" stroke="#22d3ee" strokeWidth={2} fill={`url(#grad-max-${metric})`} dot={false} />
            <Area type="monotone" dataKey="nas" stroke="#a78bfa" strokeWidth={2} fill={`url(#grad-nas-${metric})`} dot={false} />
            <Area type="monotone" dataKey="ecs" stroke="#fb7185" strokeWidth={2} fill={`url(#grad-ecs-${metric})`} dot={false} />
          </AreaChart>
        )}
      </ChartContainer>
    </div>
  );
}

/** AISuggestionBlock — AI 建议区块 */
function AISuggestionBlock({ analysis, isZh }: { analysis: ComparisonData['analysis']; isZh: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
          <Brain size={14} className="text-white" />
        </div>
        <span className="text-white text-[14px]">{isZh ? 'AI 分析建议' : 'AI Analysis'}</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30">
          {isZh ? '热点端点' : 'Hotspot'}: {analysis.hotspot.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-400 text-[13px] mb-3 pl-1">
        {isZh ? analysis.reason : analysis.reasonEn}
      </p>

      <div className="space-y-2">
        {analysis.suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/5">
            <Zap size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <span className="text-gray-300 text-[13px]">{isZh ? s.zh : s.en}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-all border border-violet-500/20">
          <ArrowUpRight size={12} />
          {isZh ? '查看详细报告' : 'View Report'}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all border border-amber-500/20">
          <AlertTriangle size={12} />
          {isZh ? '发送告警通知' : 'Send Alert'}
        </button>
      </div>
    </motion.div>
  );
}

// ===== Main Component =====
export function ComparisonDashboard() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [activeChart, setActiveChart] = useState<MetricType>('cpu');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Fetch comparison data
  const { data: apiData, loading, refetch } = useApi<ComparisonData>(
    'GET',
    '/monitor/comparison',
    { endpoints: 'max,nas,ecs', range: timeRange },
    { immediate: true, deps: [timeRange] }
  );

  // Auto refresh for realtime mode
  useEffect(() => {
    if (timeRange !== 'realtime') return;
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [timeRange, refetch]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setLastUpdated(new Date());
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch]);

  // Export handler
  const handleExport = useCallback((format: 'pdf' | 'excel') => {
    // In mock mode, simulate download
    const msg = isZh
      ? `${format.toUpperCase()} 报告已生成 (Mock模式)`
      : `${format.toUpperCase()} report generated (Mock mode)`;
    alert(msg);
  }, [isZh]);

  // Chart metric tabs
  const chartTabs: { key: MetricType; zh: string; en: string }[] = [
    { key: 'cpu', zh: 'CPU', en: 'CPU' },
    { key: 'memory', zh: '内存', en: 'Memory' },
    { key: 'disk', zh: '磁盘', en: 'Disk' },
  ];

  if (loading && !apiData) {
    return (
      <div className="p-6 space-y-6">
        <FuturisticPanel title={isZh ? '跨端数据对比' : 'Cross-endpoint Comparison'} icon={<BarChart3 size={16} className="text-white" />}>
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

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <FuturisticPanel
        title={isZh ? '跨端数据对比' : 'Cross-endpoint Comparison'}
        subtitle={isZh ? 'Max / NAS / ECS 三端性能指标并排对比' : 'Side-by-side performance comparison across Max / NAS / ECS'}
        icon={<BarChart3 size={16} className="text-white" />}
        glowEffect
      >
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} isZh={isZh} />
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-gray-400 hover:text-cyan-400 bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              {isZh ? '刷新' : 'Refresh'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-[12px]">
              <Clock size={12} />
              <span>{isZh ? '最后更新' : 'Updated'}: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <ExportButton isZh={isZh} onExport={handleExport} />
          </div>
        </div>
      </FuturisticPanel>

      {/* Three-column Endpoint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <EndpointCard data={data.data.max} endpointKey="max" isZh={isZh} />
        <EndpointCard data={data.data.nas} endpointKey="nas" isZh={isZh} />
        <EndpointCard data={data.data.ecs} endpointKey="ecs" isZh={isZh} />
      </div>

      {/* Trend Charts */}
      <FuturisticPanel
        title={isZh ? '趋势图表' : 'Trend Charts'}
        subtitle={isZh ? '三端指标叠加对比' : 'Overlaid metric comparison across endpoints'}
        icon={<Activity size={16} className="text-white" />}
        variant="primary"
      >
        {/* Chart metric tabs */}
        <div className="flex items-center gap-1 mb-4 bg-white/5 rounded-lg p-1 w-fit">
          {chartTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`px-4 py-1.5 rounded-md text-[13px] transition-all ${
                activeChart === tab.key
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-300 border border-transparent'
              }`}
            >
              {isZh ? tab.zh : tab.en}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ComparisonChart data={data} metric={activeChart} isZh={isZh} />
          </motion.div>
        </AnimatePresence>

        {/* Threshold reference line note */}
        <div className="flex items-center gap-2 mt-3 px-1 text-[11px] text-gray-500">
          <Info size={11} />
          <span>{isZh ? `阈值线: ${THRESHOLD}% — 超过此值将触发高亮告警` : `Threshold: ${THRESHOLD}% — values above trigger highlight alerts`}</span>
        </div>
      </FuturisticPanel>

      {/* AI Suggestions */}
      <FuturisticPanel
        title={isZh ? 'AI 智能分析' : 'AI Intelligence'}
        subtitle={isZh ? '基于跨端数据的智能诊断与建议' : 'Smart diagnosis and recommendations from cross-endpoint data'}
        icon={<Brain size={16} className="text-white" />}
        variant="secondary"
      >
        <AISuggestionBlock analysis={data.analysis} isZh={isZh} />
      </FuturisticPanel>
    </div>
  );
}
