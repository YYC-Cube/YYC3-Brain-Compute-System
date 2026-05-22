/**
 * @file SystemOverview.tsx
 * @description YYC³ 系统总览仪表盘 - 升级版动态可视化看板
 * @author YYC³
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Activity, Zap, Shield, Cpu, Network, Server,
  ArrowRight, ArrowUpRight, ArrowDownRight, CheckCircle,
  HardDrive, Monitor, FileText, Key, AlertTriangle, Clock,
  Wrench, Brain, BarChart3, History, Crosshair, Target,
  TrendingUp, TrendingDown, Wifi, Database, Globe, Eye,
  RefreshCw
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { NeonBorder } from '../NeonBorder';
import { FuturisticGrid } from '../FuturisticGrid';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';

interface SystemOverviewProps {
  onNavigate?: (id: string) => void;
}

// ===== Mock Live Data Generator =====
function generateTimeSeriesData(points: number = 24) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(now - (points - 1 - i) * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    cpu: Math.round(35 + Math.random() * 45 + Math.sin(i / 3) * 10),
    memory: Math.round(50 + Math.random() * 25 + Math.cos(i / 4) * 8),
    network: Math.round(200 + Math.random() * 800 + Math.sin(i / 2) * 200),
    disk: Math.round(38 + Math.random() * 5 + i * 0.3),
    latency: Math.round(5 + Math.random() * 15 + Math.sin(i / 5) * 5),
  }));
}

function generateEndpointData() {
  return [
    { name: 'Max', cpu: 72, memory: 58, disk: 41, devices: 4, status: 'running', color: '#22d3ee' },
    { name: 'NAS', cpu: 45, memory: 62, disk: 73, devices: 3, status: 'running', color: '#a78bfa' },
    { name: 'ECS', cpu: 28, memory: 56, disk: 51, devices: 3, status: 'partial', color: '#34d399' },
  ];
}

const ALERT_FEED = [
  { id: 1, level: 'critical', msg_zh: 'NAS-Ollama 内存使用率 78% 超阈值', msg_en: 'NAS-Ollama memory usage 78% exceeded threshold', time: '2m ago', icon: <AlertTriangle size={14} /> },
  { id: 2, level: 'warning', msg_zh: 'yyc3_prod 连接数接近上限 (85/100)', msg_en: 'yyc3_prod connections near limit (85/100)', time: '8m ago', icon: <Database size={14} /> },
  { id: 3, level: 'info', msg_zh: 'ECS-202 维护窗口即将开始', msg_en: 'ECS-202 maintenance window starting soon', time: '15m ago', icon: <Wrench size={14} /> },
  { id: 4, level: 'warning', msg_zh: 'Max-Server CPU 负载持续偏高', msg_en: 'Max-Server CPU load sustained high', time: '22m ago', icon: <Cpu size={14} /> },
  { id: 5, level: 'info', msg_zh: '巡查任务 #47 已完成', msg_en: 'Patrol task #47 completed', time: '35m ago', icon: <CheckCircle size={14} /> },
];

const RECENT_OPS = [
  { action_zh: '配置变更', action_en: 'Config Change', target: 'yyc3_prod', user: '张三', time: '14:30', result: 'success' },
  { action_zh: '设备新增', action_en: 'Device Add', target: 'ECS-202', user: '李四', time: '15:45', result: 'success' },
  { action_zh: '版本升级', action_en: 'Version Upgrade', target: 'Max-Server', user: '张三', time: '10:20', result: 'success' },
  { action_zh: '安全加固', action_en: 'Security Harden', target: 'All ECS', user: '李四', time: '11:30', result: 'success' },
];

// Donut data for device status
const DEVICE_STATUS_DATA = [
  { name: 'Running', value: 8, color: '#22c55e' },
  { name: 'Maintenance', value: 1, color: '#f59e0b' },
  { name: 'Error', value: 1, color: '#ef4444' },
];

export function SystemOverview({ onNavigate }: SystemOverviewProps) {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData);
  const [endpointData] = useState(generateEndpointData);
  const [tick, setTick] = useState(0);
  const [selectedChart, setSelectedChart] = useState<'cpu' | 'memory' | 'network'>('cpu');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
      setTimeSeriesData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          cpu: Math.round(35 + Math.random() * 45),
          memory: Math.round(50 + Math.random() * 25),
          network: Math.round(200 + Math.random() * 800),
          disk: Math.round(38 + Math.random() * 5),
          latency: Math.round(5 + Math.random() * 15),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    onNavigate?.(id);
  }, [onNavigate]);

  // Calculate live stats
  const latestData = timeSeriesData[timeSeriesData.length - 1];
  const prevData = timeSeriesData[timeSeriesData.length - 2];
  const cpuTrend = latestData.cpu - prevData.cpu;
  const memTrend = latestData.memory - prevData.memory;

  const topMetrics = [
    {
      label: isZh ? '设备在线' : 'Devices Online',
      value: '9/10',
      sub: isZh ? '90% 可用率' : '90% availability',
      icon: <Server size={18} />,
      color: '#22d3ee',
      bgColor: 'rgba(34,211,238,0.08)',
      trend: null,
    },
    {
      label: isZh ? '平均 CPU' : 'Avg CPU',
      value: `${latestData.cpu}%`,
      sub: `${cpuTrend >= 0 ? '+' : ''}${cpuTrend}%`,
      icon: <Cpu size={18} />,
      color: '#a78bfa',
      bgColor: 'rgba(167,139,250,0.08)',
      trend: cpuTrend,
    },
    {
      label: isZh ? '活跃告警' : 'Active Alerts',
      value: '3',
      sub: isZh ? '2 警告 · 1 严重' : '2 warn · 1 critical',
      icon: <AlertTriangle size={18} />,
      color: '#f59e0b',
      bgColor: 'rgba(245,158,11,0.08)',
      trend: null,
    },
    {
      label: isZh ? '系统健康' : 'System Health',
      value: '98%',
      sub: isZh ? '全链路正常' : 'All links normal',
      icon: <Shield size={18} />,
      color: '#34d399',
      bgColor: 'rgba(52,211,153,0.08)',
      trend: null,
    },
    {
      label: isZh ? '网络吞吐' : 'Network I/O',
      value: `${(latestData.network / 1000).toFixed(1)} GB`,
      sub: isZh ? '实时流量' : 'Live throughput',
      icon: <Network size={18} />,
      color: '#60a5fa',
      bgColor: 'rgba(96,165,250,0.08)',
      trend: null,
    },
    {
      label: isZh ? '运行时间' : 'Uptime',
      value: '47d 12h',
      sub: isZh ? '上次重启 47 天前' : 'Last restart 47d ago',
      icon: <Clock size={18} />,
      color: '#f472b6',
      bgColor: 'rgba(244,114,182,0.08)',
      trend: null,
    },
  ];

  return (
    <div className="space-y-5 h-full flex flex-col overflow-auto custom-scrollbar pb-4">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>
            {t('dashboard')} 
            <span className="font-mono px-2 py-0.5 rounded border" style={{ fontSize: '0.625rem', background: 'rgba(6,182,212,0.1)', color: '#67e8f9', borderColor: 'rgba(6,182,212,0.3)' }}>
              L5 FUSION
            </span>
          </h2>
          <p className="text-gray-400" style={{ fontSize: '0.8125rem' }}>{t('subtitleStandard')}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
            style={{ fontSize: '0.6875rem', background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)', color: '#4ade80' }}
          >
            <Wifi size={12} />
            LIVE
          </motion.div>
          <button
            onClick={() => setTimeSeriesData(generateTimeSeriesData())}
            className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all hover:bg-cyan-500/5"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
        {topMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-gray-800 p-4 cursor-default group hover:border-gray-600 transition-all relative overflow-hidden"
            style={{ background: metric.bgColor }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color: metric.color }}>
              {React.cloneElement(metric.icon as React.ReactElement, { size: 64 })}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ color: metric.color }}>{metric.icon}</div>
              <span className="text-gray-400 truncate" style={{ fontSize: '0.6875rem' }}>{metric.label}</span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metric.value}</span>
              {metric.trend !== null && (
                <span className={`flex items-center gap-0.5 ${metric.trend >= 0 ? 'text-red-400' : 'text-green-400'}`} style={{ fontSize: '0.6875rem' }}>
                  {metric.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {metric.sub}
                </span>
              )}
            </div>
            {metric.trend === null && (
              <div className="text-gray-500 mt-0.5" style={{ fontSize: '0.625rem' }}>{metric.sub}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
        {/* Performance Trends (2 cols) */}
        <div className="lg:col-span-2">
          <FuturisticPanel title={isZh ? '性能趋势 · 24H' : 'Performance Trends · 24H'} className="h-full">
            {/* Chart selector */}
            <div className="flex items-center gap-2 mb-4">
              {[
                { key: 'cpu' as const, label: 'CPU', color: '#a78bfa' },
                { key: 'memory' as const, label: isZh ? '内存' : 'Memory', color: '#22d3ee' },
                { key: 'network' as const, label: isZh ? '网络' : 'Network', color: '#34d399' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedChart(opt.key)}
                  className="px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: selectedChart === opt.key ? 600 : 400,
                    background: selectedChart === opt.key ? `${opt.color}15` : 'transparent',
                    borderColor: selectedChart === opt.key ? `${opt.color}50` : '#374151',
                    color: selectedChart === opt.key ? opt.color : '#9ca3af',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#374151' }} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#374151' }} tickLine={false} domain={selectedChart === 'network' ? [0, 'auto'] : [0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  {selectedChart === 'cpu' && (
                    <Area type="monotone" dataKey="cpu" stroke="#a78bfa" fill="url(#cpuGrad)" strokeWidth={2} dot={false} animationDuration={300} />
                  )}
                  {selectedChart === 'memory' && (
                    <Area type="monotone" dataKey="memory" stroke="#22d3ee" fill="url(#memGrad)" strokeWidth={2} dot={false} animationDuration={300} />
                  )}
                  {selectedChart === 'network' && (
                    <Area type="monotone" dataKey="network" stroke="#34d399" fill="url(#netGrad)" strokeWidth={2} dot={false} animationDuration={300} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </FuturisticPanel>
        </div>

        {/* Device Status Donut + Endpoint Summary */}
        <div className="flex flex-col gap-5">
          <FuturisticPanel title={isZh ? '设备状态' : 'Device Status'}>
            <div className="flex items-center gap-4">
              <div style={{ width: 120, height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DEVICE_STATUS_DATA}
                      cx="50%" cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {DEVICE_STATUS_DATA.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {DEVICE_STATUS_DATA.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </FuturisticPanel>

          {/* Endpoint bars */}
          <FuturisticPanel title={isZh ? '端点负载' : 'Endpoint Load'}>
            <div className="space-y-3">
              {endpointData.map(ep => (
                <div key={ep.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{ep.name}</span>
                    <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>{ep.devices} {isZh ? '台设备' : 'devices'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <MiniBar label="CPU" value={ep.cpu} color={ep.color} />
                    <MiniBar label="MEM" value={ep.memory} color={ep.color} />
                    <MiniBar label="DISK" value={ep.disk} color={ep.color} />
                  </div>
                </div>
              ))}
            </div>
          </FuturisticPanel>
        </div>
      </div>

      {/* Second Row: Alerts + Quick Nav + Recent Ops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
        {/* Alert Feed */}
        <FuturisticPanel title={isZh ? '告警动态' : 'Alert Feed'}>
          <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
            {ALERT_FEED.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-2.5 rounded-lg border transition-all hover:bg-white/5 cursor-pointer"
                style={{
                  borderColor: alert.level === 'critical' ? 'rgba(239,68,68,0.3)' : alert.level === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(55,65,81,0.5)',
                  background: alert.level === 'critical' ? 'rgba(239,68,68,0.05)' : 'transparent',
                }}
              >
                <div className="shrink-0 mt-0.5" style={{
                  color: alert.level === 'critical' ? '#ef4444' : alert.level === 'warning' ? '#f59e0b' : '#6b7280'
                }}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 truncate" style={{ fontSize: '0.75rem' }}>{isZh ? alert.msg_zh : alert.msg_en}</p>
                  <span className="text-gray-600" style={{ fontSize: '0.625rem' }}>{alert.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => handleNavigate('monitor')}
            className="mt-3 w-full text-center py-2 rounded-lg border border-gray-800 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
            style={{ fontSize: '0.75rem' }}
          >
            {isZh ? '查看全部告警' : 'View All Alerts'} →
          </button>
        </FuturisticPanel>

        {/* Quick Navigation */}
        <FuturisticPanel title={isZh ? '快捷入口' : 'Quick Access'}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'devices', icon: <HardDrive size={18} />, label: isZh ? '设备' : 'Devices', color: '#22d3ee' },
              { id: 'monitor', icon: <Monitor size={18} />, label: isZh ? '监控' : 'Monitor', color: '#a78bfa' },
              { id: 'audit', icon: <FileText size={18} />, label: isZh ? '审计' : 'Audit', color: '#f59e0b' },
              { id: 'patrol', icon: <Crosshair size={18} />, label: isZh ? '巡查' : 'Patrol', color: '#34d399' },
              { id: 'comparison', icon: <BarChart3 size={18} />, label: isZh ? '对比' : 'Compare', color: '#60a5fa' },
              { id: 'ai-suggestion', icon: <Brain size={18} />, label: 'AI', color: '#f472b6' },
              { id: 'historical', icon: <History size={18} />, label: isZh ? '历史' : 'History', color: '#818cf8' },
              { id: 'operations', icon: <Wrench size={18} />, label: isZh ? '操作' : 'Ops', color: '#fb923c' },
              { id: 'permissions', icon: <Key size={18} />, label: isZh ? '权限' : 'Perms', color: '#e879f9' },
            ].map(item => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigate(item.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-800/50 transition-all group"
              >
                <div className="p-2 rounded-lg transition-colors" style={{ color: item.color, background: `${item.color}15` }}>
                  {item.icon}
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors" style={{ fontSize: '0.6875rem' }}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </FuturisticPanel>

        {/* Recent Operations */}
        <FuturisticPanel title={isZh ? '最近操作' : 'Recent Operations'}>
          <div className="space-y-2">
            {RECENT_OPS.map((op, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/20 border border-gray-800/50 hover:bg-gray-800/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle size={14} className="text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-300 truncate" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      {isZh ? op.action_zh : op.action_en}
                    </div>
                    <div className="text-gray-600 truncate" style={{ fontSize: '0.625rem' }}>
                      {op.target} · {op.user}
                    </div>
                  </div>
                </div>
                <span className="text-gray-600 shrink-0" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>{op.time}</span>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => handleNavigate('audit')}
            className="mt-3 w-full text-center py-2 rounded-lg border border-gray-800 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
            style={{ fontSize: '0.75rem' }}
          >
            {isZh ? '查看操作审计' : 'View Audit Log'} →
          </button>
        </FuturisticPanel>
      </div>

      {/* Third Row: Architecture / Layer Cards + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">
        {/* Brain Architecture Quick View */}
        <FuturisticPanel title={isZh ? '脑机架构层' : 'Brain Architecture Layers'}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'perception', title: isZh ? '感知层' : 'Perception', icon: <Activity size={16} />, status: 'Collecting', color: '#22d3ee', metric: '42 PFlops' },
              { id: 'edge', title: isZh ? '边缘计算' : 'Edge Compute', icon: <Cpu size={16} />, status: 'Processing', color: '#f97316', metric: '16 ms' },
              { id: 'network', title: isZh ? '网络层' : 'Network', icon: <Network size={16} />, status: 'Connected', color: '#a78bfa', metric: '99.9%' },
              { id: 'platform', title: isZh ? '平台服务' : 'Platform', icon: <Server size={16} />, status: 'Online', color: '#60a5fa', metric: '12 svc' },
            ].map(layer => (
              <motion.button
                key={layer.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(layer.id)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-gray-600 transition-all text-left group"
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${layer.color}15`, color: layer.color }}>
                  {layer.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-gray-300 group-hover:text-white truncate" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{layer.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-gray-500" style={{ fontSize: '0.625rem' }}>{layer.status}</span>
                    <span className="text-gray-600" style={{ fontSize: '0.625rem' }}>·</span>
                    <span style={{ fontSize: '0.625rem', color: layer.color }}>{layer.metric}</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-700 group-hover:text-cyan-400 shrink-0 transition-colors" />
              </motion.button>
            ))}
          </div>
        </FuturisticPanel>

        {/* Compliance & Health */}
        <FuturisticPanel title={isZh ? '标准合规 · 五标体系' : 'Compliance · 5 Standards'}>
          <div className="space-y-2.5">
            {[
              { name: isZh ? '接口标准 (IEEE P2872)' : 'Interface Std (IEEE P2872)', status: 'Compliant', date: '2m ago' },
              { name: isZh ? '安全框架 (Level 3)' : 'Security Framework (L3)', status: 'Secured', date: '10m ago' },
              { name: isZh ? '数据协议 (BNCI 2020)' : 'Data Protocol (BNCI 2020)', status: 'Active', date: 'Continuous' },
              { name: isZh ? '评估体系 (Grade A)' : 'Evaluation (Grade A)', status: 'Passed', date: '1h ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/20 border border-gray-700/30 hover:bg-gray-800/40 hover:border-cyan-500/20 transition-all group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  <span className="text-gray-300 group-hover:text-white truncate" style={{ fontSize: '0.75rem' }}>{item.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded border" style={{ fontSize: '0.625rem', background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>
                    {item.status}
                  </span>
                  <span className="text-gray-600 font-mono hidden sm:block" style={{ fontSize: '0.625rem' }}>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #1f2937' }}>
            <span className="text-gray-500" style={{ fontSize: '0.6875rem' }}>{isZh ? '总合规分: 100/100' : 'Total Score: 100/100'}</span>
            <button onClick={() => handleNavigate('docs')} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors" style={{ fontSize: '0.6875rem' }}>
              {isZh ? '查看标准文档' : 'View Standards'} <ArrowRight size={12} />
            </button>
          </div>
        </FuturisticPanel>
      </div>
    </div>
  );
}

// Mini progress bar component
function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  const isHigh = value > 75;
  const barColor = isHigh ? '#ef4444' : color;
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-gray-600" style={{ fontSize: '0.5625rem' }}>{label}</span>
        <span style={{ fontSize: '0.5625rem', color: isHigh ? '#ef4444' : '#9ca3af', fontWeight: isHigh ? 600 : 400 }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
    </div>
  );
}
