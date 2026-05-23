import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, CheckCircle, ChevronRight,
  Eye, Zap,
  ArrowRight, Target, Activity, TrendingUp, Bell
} from 'lucide-react';

import { useLanguage } from '../LanguageContext';

// ===== Types =====
interface Alert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  titleEn: string;
  device: string;
  deviceId: string;
  metric: string;
  value: string;
  threshold: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assignee: string;
  chain: OperationChainItem[];
}

interface OperationChainItem {
  time: string;
  event: string;
  eventEn: string;
  type: 'trigger' | 'action' | 'auto' | 'resolve';
  highlight?: boolean;
}

// ===== Mock Data =====
const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    level: 'critical',
    title: 'GPU推理延迟异常 (NAS-Tensor-Inference)',
    titleEn: 'GPU Inference Latency Anomaly (NAS-Tensor-Inference)',
    device: 'NAS-Tensor-Inference',
    deviceId: 'DEV-012',
    metric: 'CPU Usage',
    value: '95%',
    threshold: '>90%',
    timestamp: '2026-02-25 14:24:15',
    status: 'active',
    assignee: '张三',
    chain: [
      { time: '14:20:00', event: '模型加载 Embedding v2.2', eventEn: 'Model loaded Embedding v2.2', type: 'action' },
      { time: '14:22:30', event: '推理任务 #12847 启动', eventEn: 'Inference task #12847 started', type: 'action' },
      { time: '14:23:45', event: 'GPU内存占用 92%', eventEn: 'GPU memory usage 92%', type: 'trigger' },
      { time: '14:24:15', event: 'CPU使用率突增至 95% — 告警触发', eventEn: 'CPU usage spiked to 95% — Alert triggered', type: 'trigger', highlight: true },
      { time: '14:24:30', event: '系统自动降低推理并发数', eventEn: 'System auto-reduced inference concurrency', type: 'auto' },
      { time: '14:25:00', event: '通知已发送至张三', eventEn: 'Notification sent to Zhang San', type: 'auto' },
    ],
  },
  {
    id: 'ALT-002',
    level: 'warning',
    title: 'yyc3_prod 数据库连接数接近上限',
    titleEn: 'yyc3_prod DB connections near limit',
    device: 'yyc3_prod',
    deviceId: 'DEV-006',
    metric: 'Connections',
    value: '450/500',
    threshold: '>400',
    timestamp: '2026-02-25 14:18:22',
    status: 'acknowledged',
    assignee: '张三',
    chain: [
      { time: '14:00:00', event: '连接数 320 (正常)', eventEn: 'Connections 320 (normal)', type: 'action' },
      { time: '14:10:00', event: '业务高峰期开始，连接数上升', eventEn: 'Peak traffic started, connections rising', type: 'trigger' },
      { time: '14:15:00', event: '连接数 400，触发预警阈值', eventEn: 'Connections 400, pre-warning threshold', type: 'trigger' },
      { time: '14:18:22', event: '连接数 450，告警触发', eventEn: 'Connections 450, alert triggered', type: 'trigger', highlight: true },
      { time: '14:19:00', event: '张三已确认告警', eventEn: 'Zhang San acknowledged alert', type: 'action' },
    ],
  },
  {
    id: 'ALT-003',
    level: 'warning',
    title: 'NAS存储容量告警 (73%)',
    titleEn: 'NAS Storage Capacity Alert (73%)',
    device: 'NAS-Server-Core',
    deviceId: 'DEV-002',
    metric: 'Disk Usage',
    value: '73%',
    threshold: '>70%',
    timestamp: '2026-02-25 13:45:00',
    status: 'acknowledged',
    assignee: '李四',
    chain: [
      { time: '12:00:00', event: '磁盘使用率 68%', eventEn: 'Disk usage 68%', type: 'action' },
      { time: '13:00:00', event: '大量推理日志写入', eventEn: 'Large inference log writes', type: 'trigger' },
      { time: '13:30:00', event: '磁盘使用率 71%', eventEn: 'Disk usage 71%', type: 'trigger' },
      { time: '13:45:00', event: '磁盘使用率 73%，告警触发', eventEn: 'Disk usage 73%, alert triggered', type: 'trigger', highlight: true },
      { time: '13:46:00', event: '李四已确认，计划清理归档', eventEn: 'Li Si acknowledged, planned archive cleanup', type: 'action' },
    ],
  },
  {
    id: 'ALT-004',
    level: 'info',
    title: 'SSL证书即将过期 (yyc3-125-ECS)',
    titleEn: 'SSL Certificate Expiring (yyc3-125-ECS)',
    device: 'yyc3-125-ECS',
    deviceId: 'DEV-003',
    metric: 'Certificate',
    value: '30天',
    threshold: '<90天',
    timestamp: '2026-02-25 09:00:00',
    status: 'resolved',
    assignee: '李四',
    chain: [
      { time: '09:00:00', event: '定时检测发现证书将在30天后过期', eventEn: 'Scheduled check found cert expires in 30 days', type: 'trigger', highlight: true },
      { time: '09:05:00', event: '已自动创建更新工单', eventEn: 'Auto-created renewal ticket', type: 'auto' },
      { time: '11:15:00', event: '李四已更新SSL证书', eventEn: 'Li Si updated SSL certificate', type: 'action' },
      { time: '11:20:00', event: '证书验证通过，告警已解除', eventEn: 'Certificate verified, alert resolved', type: 'resolve' },
    ],
  },
];

const levelConfig = {
  critical: { label: '紧急', labelEn: 'Critical', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30', dot: 'bg-red-500', glow: 'shadow-red-500/20' },
  warning: { label: '告警', labelEn: 'Warning', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', dot: 'bg-yellow-500', glow: 'shadow-yellow-500/20' },
  info: { label: '信息', labelEn: 'Info', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500/30', dot: 'bg-blue-500', glow: 'shadow-blue-500/20' },
};

const statusConfig = {
  active: { label: '活跃', labelEn: 'Active', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/20' },
  acknowledged: { label: '已确认', labelEn: 'Acknowledged', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/20' },
  resolved: { label: '已解决', labelEn: 'Resolved', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/20' },
};

const chainTypeConfig = {
  trigger: { color: 'border-yellow-500', dot: 'bg-yellow-500', text: 'text-yellow-300' },
  action: { color: 'border-cyan-500', dot: 'bg-cyan-500', text: 'text-cyan-300' },
  auto: { color: 'border-blue-500', dot: 'bg-blue-500', text: 'text-blue-300' },
  resolve: { color: 'border-green-500', dot: 'bg-green-500', text: 'text-green-300' },
};

export function FollowUpSystem() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [expandedAlert, setExpandedAlert] = useState<string | null>(MOCK_ALERTS[0].id);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAlerts = MOCK_ALERTS.filter(a => {
    const matchLevel = filterLevel === 'all' || a.level === filterLevel;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchLevel && matchStatus;
  });

  const stats = {
    total: MOCK_ALERTS.length,
    active: MOCK_ALERTS.filter(a => a.status === 'active').length,
    acknowledged: MOCK_ALERTS.filter(a => a.status === 'acknowledged').length,
    resolved: MOCK_ALERTS.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Target className="w-6 h-6" />
            {isZh ? '一键跟进' : 'Follow-up System'}
            {stats.active > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-900/30 text-red-300 border border-red-500/30 animate-pulse">
                {stats.active} {isZh ? '活跃告警' : 'ACTIVE'}
              </span>
            )}
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '告警追踪、操作链路回溯与快速修复' : 'Alert tracking, operation chain tracing & quick fix'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '总告警' : 'Total'}</div>
          <div className="text-xl text-white font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-red-900/10 border border-red-500/20">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '活跃' : 'Active'}</div>
          <div className="text-xl text-red-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.active}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-yellow-900/10 border border-yellow-500/20">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '已确认' : 'Ack'}</div>
          <div className="text-xl text-yellow-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.acknowledged}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-green-900/10 border border-green-500/20">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '已解决' : 'Resolved'}</div>
          <div className="text-xl text-green-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 shrink-0">
        <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
          {[
            { key: 'all', label: isZh ? '全部' : 'All' },
            { key: 'critical', label: isZh ? '紧急' : 'Critical' },
            { key: 'warning', label: isZh ? '告警' : 'Warning' },
            { key: 'info', label: isZh ? '信息' : 'Info' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterLevel(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                filterLevel === tab.key
                  ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
          {[
            { key: 'all', label: isZh ? '全部状态' : 'All Status' },
            { key: 'active', label: isZh ? '活跃' : 'Active' },
            { key: 'acknowledged', label: isZh ? '已确认' : 'Ack' },
            { key: 'resolved', label: isZh ? '已解决' : 'Resolved' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                filterStatus === tab.key
                  ? 'bg-gray-700/50 text-white border border-gray-600'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
              style={{ fontSize: '0.7rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 min-h-0 overflow-auto space-y-3">
        {filteredAlerts.map((alert, idx) => {
          const lvl = levelConfig[alert.level];
          const st = statusConfig[alert.status];
          const isExpanded = expandedAlert === alert.id;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl border overflow-hidden transition-all ${lvl.border} ${
                alert.status === 'active' ? lvl.bg : 'bg-gray-900/30'
              }`}
            >
              {/* Alert Header */}
              <button
                onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                {/* Level Icon */}
                <div className="shrink-0 mt-0.5">
                  {alert.level === 'critical' ? (
                    <AlertTriangle className={`w-5 h-5 ${lvl.color} ${alert.status === 'active' ? 'animate-pulse' : ''}`} />
                  ) : alert.level === 'warning' ? (
                    <AlertTriangle className={`w-5 h-5 ${lvl.color}`} />
                  ) : (
                    <Bell className={`w-5 h-5 ${lvl.color}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {isZh ? alert.title : alert.titleEn}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${lvl.bg} ${lvl.color} border ${lvl.border}`} style={{ fontSize: '0.6rem' }}>
                      {isZh ? lvl.label : lvl.labelEn}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${st.bg} ${st.color} border ${st.border}`} style={{ fontSize: '0.6rem' }}>
                      {isZh ? st.label : st.labelEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500" style={{ fontSize: '0.7rem' }}>
                    <span className="font-mono">{alert.metric}: {alert.value}</span>
                    <span>·</span>
                    <span>{alert.timestamp}</span>
                    <span>·</span>
                    <span>{isZh ? '负责人' : 'Assignee'}: {alert.assignee}</span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform shrink-0 mt-1 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-800/50 pt-3">
                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                          <Eye className="w-3.5 h-3.5" /> {isZh ? '查看详情' : 'View Detail'}
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                          <TrendingUp className="w-3.5 h-3.5" /> {isZh ? '查看历史' : 'View History'}
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                          <Activity className="w-3.5 h-3.5" /> {isZh ? '查看关联' : 'View Related'}
                        </button>
                        {alert.status === 'active' && (
                          <>
                            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600/80 border border-cyan-500/50 text-white hover:bg-cyan-500 transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                              <Zap className="w-3.5 h-3.5" /> {isZh ? '一键修复' : 'Quick Fix'}
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600/80 border border-green-500/50 text-white hover:bg-green-500 transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                              <CheckCircle className="w-3.5 h-3.5" /> {isZh ? '标记解决' : 'Mark Resolved'}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Operation Chain Timeline */}
                      <div className="text-[10px] text-gray-500 font-mono uppercase mb-3" style={{ fontSize: '0.6rem' }}>
                        {isZh ? '操作链路' : 'Operation Chain'}
                      </div>
                      <div className="space-y-0 relative">
                        {/* Vertical line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-800" />

                        {alert.chain.map((item, i) => {
                          const ct = chainTypeConfig[item.type];
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`flex items-start gap-3 py-2 relative ${item.highlight ? 'pl-0' : ''}`}
                            >
                              {/* Timeline dot */}
                              <div className={`w-4 h-4 rounded-full border-2 ${ct.color} ${ct.dot} shrink-0 relative z-10 ${item.highlight ? 'ring-2 ring-offset-1 ring-offset-gray-900' : ''}`}
                                style={item.highlight ? { boxShadow: '0 0 8px currentColor' } : {}}
                              />

                              {/* Time */}
                              <span className="text-[10px] text-gray-600 font-mono w-14 shrink-0 pt-0.5" style={{ fontSize: '0.625rem' }}>
                                {item.time}
                              </span>

                              {/* Event */}
                              <span className={`text-xs ${item.highlight ? ct.text + ' font-medium' : 'text-gray-400'}`} style={{ fontSize: '0.75rem', fontWeight: item.highlight ? 500 : 400 }}>
                                {isZh ? item.event : item.eventEn}
                                {item.highlight && (
                                  <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-gray-800 text-gray-500" style={{ fontSize: '0.6rem' }}>
                                    ← {isZh ? '当前' : 'Current'}
                                  </span>
                                )}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <CheckCircle className="w-12 h-12 mb-3 opacity-30" />
            <p style={{ fontSize: '0.875rem' }}>{isZh ? '没有匹配的告警' : 'No matching alerts'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
