import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Shield, CheckCircle, AlertTriangle, XCircle, Clock,
  Play, Pause, RefreshCw, Calendar, ChevronRight, BarChart3,
  Server, Database, Wifi, HardDrive, Cpu, MemoryStick,
  TrendingUp, Activity, Eye, Settings, Download
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Chart Container =====
function ChartBox({ children, height = 180 }: { children: (w: number, h: number) => React.ReactNode; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 400, height });
  const measure = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.width > 0) setDims({ width: Math.floor(rect.width), height });
    }
  }, [height]);
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [measure]);
  return (
    <div ref={ref} style={{ width: '100%', height, minHeight: height, position: 'relative' }}>
      {dims.width > 10 && children(dims.width, dims.height)}
    </div>
  );
}

// ===== Types =====
interface PatrolCheck {
  id: string;
  category: string;
  categoryEn: string;
  name: string;
  nameEn: string;
  status: 'pass' | 'warning' | 'fail';
  value: string;
  threshold: string;
  detail: string;
  detailEn: string;
}

interface PatrolReport {
  id: string;
  timestamp: string;
  type: 'auto' | 'manual';
  healthScore: number;
  totalChecks: number;
  passed: number;
  warnings: number;
  failures: number;
  duration: string;
}

// ===== Mock Data =====
const PATROL_CHECKS: PatrolCheck[] = [
  { id: 'PC-01', category: '节点健康', categoryEn: 'Node Health', name: 'Max-Server-Primary', nameEn: 'Max-Server-Primary', status: 'pass', value: '正常', threshold: '-', detail: 'CPU 72%, MEM 58%, Disk 41%', detailEn: 'CPU 72%, MEM 58%, Disk 41%' },
  { id: 'PC-02', category: '节点健康', categoryEn: 'Node Health', name: 'NAS-Server-Core', nameEn: 'NAS-Server-Core', status: 'warning', value: 'Disk 73%', threshold: '>70%', detail: '磁盘使用率接近阈值', detailEn: 'Disk usage near threshold' },
  { id: 'PC-03', category: '节点健康', categoryEn: 'Node Health', name: 'NAS-Tensor-Inference', nameEn: 'NAS-Tensor-Inference', status: 'fail', value: 'CPU 95%', threshold: '>90%', detail: 'GPU内存泄漏导致CPU过载', detailEn: 'GPU memory leak causing CPU overload' },
  { id: 'PC-04', category: '数据库', categoryEn: 'Database', name: 'yyc3_prod 连接数', nameEn: 'yyc3_prod Connections', status: 'warning', value: '450/500', threshold: '>400', detail: '连接数接近上限', detailEn: 'Connections near limit' },
  { id: 'PC-05', category: '数据库', categoryEn: 'Database', name: 'yyc3_prod 慢查询', nameEn: 'yyc3_prod Slow Queries', status: 'pass', value: '3/h', threshold: '<10/h', detail: '慢查询数量正常', detailEn: 'Slow query count normal' },
  { id: 'PC-06', category: '数据库', categoryEn: 'Database', name: 'yyc3_archive 备份', nameEn: 'yyc3_archive Backup', status: 'pass', value: '最新', threshold: '<24h', detail: '最近备份: 2h前', detailEn: 'Last backup: 2h ago' },
  { id: 'PC-07', category: '网络', categoryEn: 'Network', name: 'ECS端延迟', nameEn: 'ECS Latency', status: 'pass', value: '35ms', threshold: '<100ms', detail: '三台ECS延迟均正常', detailEn: 'All 3 ECS latency normal' },
  { id: 'PC-08', category: '网络', categoryEn: 'Network', name: 'VPN隧道状态', nameEn: 'VPN Tunnel Status', status: 'pass', value: '活跃', threshold: '-', detail: 'Max↔NAS隧道稳定', detailEn: 'Max↔NAS tunnel stable' },
  { id: 'PC-09', category: '安全', categoryEn: 'Security', name: '防火墙状态', nameEn: 'Firewall Status', status: 'pass', value: '活跃', threshold: '-', detail: '所有规则正常生效', detailEn: 'All rules active' },
  { id: 'PC-10', category: '安全', categoryEn: 'Security', name: 'SSL证书', nameEn: 'SSL Certificates', status: 'warning', value: '30天', threshold: '<90天', detail: 'yyc3-125-ECS证书将过期', detailEn: 'yyc3-125-ECS cert expiring' },
  { id: 'PC-11', category: '存储', categoryEn: 'Storage', name: 'Redis内存使用', nameEn: 'Redis Memory', status: 'pass', value: '42%', threshold: '<80%', detail: 'Master 42%, Slave 38%', detailEn: 'Master 42%, Slave 38%' },
  { id: 'PC-12', category: '存储', categoryEn: 'Storage', name: 'NAS存储容量', nameEn: 'NAS Storage', status: 'warning', value: '73%', threshold: '>70%', detail: '建议清理归档数据', detailEn: 'Suggest cleaning archived data' },
];

const PATROL_HISTORY: PatrolReport[] = [
  { id: 'PR-001', timestamp: '2026-02-25 10:00', type: 'auto', healthScore: 88, totalChecks: 12, passed: 8, warnings: 3, failures: 1, duration: '12s' },
  { id: 'PR-002', timestamp: '2026-02-25 09:45', type: 'auto', healthScore: 85, totalChecks: 12, passed: 7, warnings: 4, failures: 1, duration: '11s' },
  { id: 'PR-003', timestamp: '2026-02-25 09:30', type: 'auto', healthScore: 90, totalChecks: 12, passed: 9, warnings: 2, failures: 1, duration: '13s' },
  { id: 'PR-004', timestamp: '2026-02-25 09:15', type: 'manual', healthScore: 92, totalChecks: 12, passed: 10, warnings: 1, failures: 1, duration: '15s' },
  { id: 'PR-005', timestamp: '2026-02-25 09:00', type: 'auto', healthScore: 87, totalChecks: 12, passed: 8, warnings: 3, failures: 1, duration: '12s' },
  { id: 'PR-006', timestamp: '2026-02-24 23:45', type: 'auto', healthScore: 95, totalChecks: 12, passed: 11, warnings: 1, failures: 0, duration: '11s' },
  { id: 'PR-007', timestamp: '2026-02-24 23:30', type: 'auto', healthScore: 96, totalChecks: 12, passed: 11, warnings: 1, failures: 0, duration: '10s' },
  { id: 'PR-008', timestamp: '2026-02-24 23:15', type: 'auto', healthScore: 97, totalChecks: 12, passed: 12, warnings: 0, failures: 0, duration: '10s' },
];

function generateHealthTrend() {
  return PATROL_HISTORY.slice().reverse().map(r => ({
    time: r.timestamp.split(' ')[1],
    score: r.healthScore,
    passed: r.passed,
    warnings: r.warnings,
    failures: r.failures,
  }));
}

const statusIcon = {
  pass: <CheckCircle className="w-4 h-4 text-green-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  fail: <XCircle className="w-4 h-4 text-red-400" />,
};

const statusColor = {
  pass: { text: 'text-green-400', bg: 'bg-green-900/10', border: 'border-green-500/20' },
  warning: { text: 'text-yellow-400', bg: 'bg-yellow-900/10', border: 'border-yellow-500/20' },
  fail: { text: 'text-red-400', bg: 'bg-red-900/10', border: 'border-red-500/20' },
};

export function PatrolMode() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [activeView, setActiveView] = useState('current');
  const [isPatrolling, setIsPatrolling] = useState(false);
  const [autoPatrol, setAutoPatrol] = useState(true);
  const [autoInterval, setAutoInterval] = useState(15);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [healthTrend] = useState(generateHealthTrend);

  const latestReport = PATROL_HISTORY[0];
  const passCount = PATROL_CHECKS.filter(c => c.status === 'pass').length;
  const warnCount = PATROL_CHECKS.filter(c => c.status === 'warning').length;
  const failCount = PATROL_CHECKS.filter(c => c.status === 'fail').length;

  const categories = Array.from(new Set(PATROL_CHECKS.map(c => isZh ? c.category : c.categoryEn)));
  const filtered = PATROL_CHECKS.filter(c =>
    categoryFilter === 'all' || (isZh ? c.category : c.categoryEn) === categoryFilter
  );

  const handleStartPatrol = () => {
    setIsPatrolling(true);
    setTimeout(() => setIsPatrolling(false), 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-cyan-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Search className="w-6 h-6" />
            {isZh ? '巡查模式' : 'Patrol Mode'}
            {autoPatrol && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-green-900/30 text-green-300 border border-green-500/30 animate-pulse">
                AUTO · {autoInterval}min
              </span>
            )}
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '系统健康巡检与风险预警' : 'System health patrol & risk early warning'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoPatrol(!autoPatrol)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              autoPatrol
                ? 'bg-green-900/20 border-green-500/30 text-green-400 hover:bg-green-900/30'
                : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
            style={{ fontSize: '0.875rem' }}
          >
            {autoPatrol ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isZh ? (autoPatrol ? '暂停自动' : '开启自动') : (autoPatrol ? 'Pause Auto' : 'Enable Auto')}
          </button>
          <button
            onClick={handleStartPatrol}
            disabled={isPatrolling}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600/80 border border-cyan-500/50 text-white hover:bg-cyan-500 transition-colors text-sm disabled:opacity-50"
            style={{ fontSize: '0.875rem' }}
          >
            {isPatrolling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isZh ? (isPatrolling ? '巡查中...' : '手动巡查') : (isPatrolling ? 'Patrolling...' : 'Manual Patrol')}
          </button>
        </div>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 col-span-2 md:col-span-1">
          <div className="text-[10px] text-gray-500 font-mono uppercase" style={{ fontSize: '0.6rem' }}>{isZh ? '健康度评分' : 'Health Score'}</div>
          <div className={`text-3xl font-mono ${getScoreColor(latestReport.healthScore)}`} style={{ fontSize: '1.875rem', fontWeight: 700 }}>
            {latestReport.healthScore}%
          </div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '通过' : 'Passed'}</span>
          </div>
          <div className="text-xl text-green-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{passCount}/{PATROL_CHECKS.length}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '告警' : 'Warnings'}</span>
          </div>
          <div className="text-xl text-yellow-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{warnCount}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '异常' : 'Failures'}</span>
          </div>
          <div className="text-xl text-red-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{failCount}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '上次巡查' : 'Last Patrol'}</span>
          </div>
          <div className="text-xs text-gray-300 font-mono" style={{ fontSize: '0.75rem' }}>{latestReport.timestamp.split(' ')[1]}</div>
          <div className="text-[10px] text-gray-500" style={{ fontSize: '0.6rem' }}>{latestReport.duration}</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 shrink-0">
        {[
          { key: 'current', label: isZh ? '当前巡查' : 'Current Patrol' },
          { key: 'trend', label: isZh ? '健康趋势' : 'Health Trend' },
          { key: 'history', label: isZh ? '巡查历史' : 'Patrol History' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`px-4 py-2 rounded-md text-xs transition-all ${
              activeView === tab.key
                ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
            style={{ fontSize: '0.75rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {/* Current Patrol Results */}
          {activeView === 'current' && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Category Filter */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    categoryFilter === 'all' ? 'bg-gray-700/50 text-white border border-gray-600' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                  }`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {isZh ? '全部' : 'All'}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      categoryFilter === cat ? 'bg-gray-700/50 text-white border border-gray-600' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Patrol loading animation */}
              {isPatrolling && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-900/10 flex items-center gap-3"
                >
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div>
                    <div className="text-sm text-cyan-400" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{isZh ? '正在执行系统巡查...' : 'Running system patrol...'}</div>
                    <div className="text-xs text-cyan-400/60" style={{ fontSize: '0.7rem' }}>{isZh ? '检查所有节点、数据库、网络与安全配置' : 'Checking all nodes, databases, network & security'}</div>
                  </div>
                </motion.div>
              )}

              {/* Check Items */}
              {filtered.map((check, idx) => {
                const sc = statusColor[check.status];
                return (
                  <motion.div
                    key={check.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${sc.bg} ${sc.border}`}
                  >
                    <div className="shrink-0">{statusIcon[check.status]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-200" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                          {isZh ? check.name : check.nameEn}
                        </span>
                        <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-gray-800/50" style={{ fontSize: '0.6rem' }}>
                          {isZh ? check.category : check.categoryEn}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5" style={{ fontSize: '0.7rem' }}>
                        {isZh ? check.detail : check.detailEn}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-mono ${sc.text}`} style={{ fontSize: '0.75rem' }}>{check.value}</div>
                      {check.threshold !== '-' && (
                        <div className="text-[10px] text-gray-600" style={{ fontSize: '0.6rem' }}>{isZh ? '阈值' : 'Threshold'}: {check.threshold}</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Health Trend Chart */}
          {activeView === 'trend' && (
            <motion.div
              key="trend"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FuturisticPanel title={isZh ? '健康度趋势' : 'Health Score Trend'} subtitle={isZh ? '最近8次巡查' : 'Last 8 patrols'}>
                <ChartBox height={280}>
                  {(w, h) => (
                    <AreaChart width={w} height={h} data={healthTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 8, fontSize: 12, color: '#e5e7eb' }}
                        labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#06b6d4" fill="url(#scoreGrad)" strokeWidth={2} name={isZh ? '健康度' : 'Health Score'} dot={{ r: 3, fill: '#06b6d4' }} />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} iconType="line" />
                    </AreaChart>
                  )}
                </ChartBox>
              </FuturisticPanel>
            </motion.div>
          )}

          {/* Patrol History */}
          {activeView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
                <table className="w-full text-sm" style={{ fontSize: '0.875rem' }}>
                  <thead className="bg-gray-900/90">
                    <tr className="border-b border-gray-700/50">
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '时间' : 'Time'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '类型' : 'Type'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '健康度' : 'Health'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden md:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '通过' : 'Pass'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden md:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '告警' : 'Warn'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden md:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '异常' : 'Fail'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden lg:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '耗时' : 'Duration'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PATROL_HISTORY.map((report, idx) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-300 font-mono" style={{ fontSize: '0.75rem' }}>{report.timestamp}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            report.type === 'auto' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' : 'bg-purple-900/20 text-purple-400 border border-purple-500/20'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {report.type === 'auto' ? (isZh ? '自动' : 'Auto') : (isZh ? '手动' : 'Manual')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-mono ${getScoreColor(report.healthScore)}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {report.healthScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-xs text-green-400 font-mono" style={{ fontSize: '0.75rem' }}>{report.passed}</span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-xs text-yellow-400 font-mono" style={{ fontSize: '0.75rem' }}>{report.warnings}</span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-xs text-red-400 font-mono" style={{ fontSize: '0.75rem' }}>{report.failures}</span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-xs text-gray-500 font-mono" style={{ fontSize: '0.7rem' }}>{report.duration}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
