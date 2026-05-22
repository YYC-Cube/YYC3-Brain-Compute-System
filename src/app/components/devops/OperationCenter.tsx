import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Play, RefreshCw, Trash2, Download, FileText, Plus,
  Server, Cpu, Database, Zap, Clock, CheckCircle, XCircle,
  AlertTriangle, ChevronRight, RotateCcw, Terminal, Copy,
  Layers, Rocket, Shield, Archive, Search, Filter
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Types =====
interface OperationTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  steps: { label: string; labelEn: string }[];
  estimatedTime: string;
  risk: 'low' | 'medium' | 'high';
  lastUsed: string;
  usageCount: number;
}

interface QuickAction {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  description: string;
  descriptionEn: string;
}

interface OperationLog {
  id: string;
  action: string;
  actionEn: string;
  operator: string;
  target: string;
  status: 'running' | 'success' | 'failed' | 'queued';
  timestamp: string;
  duration: string;
}

// ===== Mock Data =====
const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: '重启节点', labelEn: 'Restart Node', icon: <RotateCcw className="w-5 h-5" />, category: 'node', color: 'from-cyan-500 to-blue-500', description: '重启指定服务器节点', descriptionEn: 'Restart specified server node' },
  { id: 'qa-2', label: '部署模型', labelEn: 'Deploy Model', icon: <Rocket className="w-5 h-5" />, category: 'model', color: 'from-purple-500 to-pink-500', description: '部署AI推理模型至节点', descriptionEn: 'Deploy AI model to node' },
  { id: 'qa-3', label: '清理缓存', labelEn: 'Clear Cache', icon: <Trash2 className="w-5 h-5" />, category: 'system', color: 'from-orange-500 to-red-500', description: '清理Redis及本地缓存', descriptionEn: 'Clear Redis and local cache' },
  { id: 'qa-4', label: '导出日志', labelEn: 'Export Logs', icon: <Download className="w-5 h-5" />, category: 'system', color: 'from-green-500 to-emerald-500', description: '导出系统运行日志', descriptionEn: 'Export system operation logs' },
  { id: 'qa-5', label: '生成报告', labelEn: 'Gen Report', icon: <FileText className="w-5 h-5" />, category: 'system', color: 'from-blue-500 to-indigo-500', description: '生成系统健康报告', descriptionEn: 'Generate system health report' },
  { id: 'qa-6', label: '数据库备份', labelEn: 'DB Backup', icon: <Database className="w-5 h-5" />, category: 'task', color: 'from-teal-500 to-cyan-500', description: '执行数据库全量备份', descriptionEn: 'Full database backup' },
  { id: 'qa-7', label: '安全扫描', labelEn: 'Security Scan', icon: <Shield className="w-5 h-5" />, category: 'system', color: 'from-red-500 to-rose-500', description: '执行全端点安全扫描', descriptionEn: 'Run full endpoint security scan' },
  { id: 'qa-8', label: '归档数据', labelEn: 'Archive Data', icon: <Archive className="w-5 h-5" />, category: 'task', color: 'from-amber-500 to-yellow-500', description: '将历史数据归档至NAS', descriptionEn: 'Archive historical data to NAS' },
];

const OPERATION_TEMPLATES: OperationTemplate[] = [
  {
    id: 'tpl-1', name: '模型部署标准流程', nameEn: 'Standard Model Deployment',
    description: '从模型检查到部署验证的完整流程', descriptionEn: 'Complete flow from model check to deployment verification',
    category: 'model',
    steps: [
      { label: '模型文件校验', labelEn: 'Model file verification' },
      { label: '目标节点健康检查', labelEn: 'Target node health check' },
      { label: '停止旧版本服务', labelEn: 'Stop old version service' },
      { label: '部署新模型文件', labelEn: 'Deploy new model files' },
      { label: '启动推理服务', labelEn: 'Start inference service' },
      { label: '运行冒烟测试', labelEn: 'Run smoke tests' },
      { label: '性能基准对比', labelEn: 'Performance benchmark comparison' },
    ],
    estimatedTime: '15-30min', risk: 'medium', lastUsed: '2026-02-22', usageCount: 28,
  },
  {
    id: 'tpl-2', name: '节点故障排查流程', nameEn: 'Node Troubleshooting',
    description: '系统化的节点故障定位与修复', descriptionEn: 'Systematic node fault location and repair',
    category: 'node',
    steps: [
      { label: '检查节点连通性', labelEn: 'Check node connectivity' },
      { label: '查看系统资源使用', labelEn: 'View system resource usage' },
      { label: '分析错误日志', labelEn: 'Analyze error logs' },
      { label: '检查服务状态', labelEn: 'Check service status' },
      { label: '执行修复操作', labelEn: 'Execute repair actions' },
      { label: '验证修复结果', labelEn: 'Verify repair results' },
    ],
    estimatedTime: '10-60min', risk: 'low', lastUsed: '2026-02-21', usageCount: 45,
  },
  {
    id: 'tpl-3', name: '每日备份任务', nameEn: 'Daily Backup Task',
    description: '自动化的每日数据备份流程', descriptionEn: 'Automated daily data backup flow',
    category: 'task',
    steps: [
      { label: '锁定写入操作', labelEn: 'Lock write operations' },
      { label: '创建数据库快照', labelEn: 'Create database snapshot' },
      { label: '压缩备份文件', labelEn: 'Compress backup files' },
      { label: '传输至NAS存储', labelEn: 'Transfer to NAS storage' },
      { label: '验证备份完整性', labelEn: 'Verify backup integrity' },
      { label: '清理过期备份', labelEn: 'Clean expired backups' },
      { label: '发送备份报告', labelEn: 'Send backup report' },
    ],
    estimatedTime: '20-45min', risk: 'low', lastUsed: '2026-02-22', usageCount: 365,
  },
  {
    id: 'tpl-4', name: '安全加固流程', nameEn: 'Security Hardening',
    description: '全面的系统安全加固检查与修复', descriptionEn: 'Comprehensive security hardening check and fix',
    category: 'system',
    steps: [
      { label: '系统补丁检查', labelEn: 'System patch check' },
      { label: '防火墙规则审计', labelEn: 'Firewall rule audit' },
      { label: '端口扫描', labelEn: 'Port scanning' },
      { label: '用户权限审核', labelEn: 'User permission audit' },
      { label: '加密配置验证', labelEn: 'Encryption config verification' },
    ],
    estimatedTime: '30-60min', risk: 'high', lastUsed: '2026-02-19', usageCount: 12,
  },
];

const OPERATION_LOGS: OperationLog[] = [
  { id: 'OL-001', action: '重启 NAS-Tensor-Inference', actionEn: 'Restart NAS-Tensor-Inference', operator: '张三', target: 'DEV-012', status: 'running', timestamp: '14:32:15', duration: '进行中' },
  { id: 'OL-002', action: '数据库备份 yyc3_prod', actionEn: 'DB Backup yyc3_prod', operator: '系统', target: 'DEV-006', status: 'success', timestamp: '14:30:00', duration: '23m 45s' },
  { id: 'OL-003', action: '清理Redis缓存', actionEn: 'Clear Redis Cache', operator: '李四', target: 'DEV-009', status: 'success', timestamp: '14:15:22', duration: '2s' },
  { id: 'OL-004', action: '安全扫描 全ECS端', actionEn: 'Security Scan All ECS', operator: '王五', target: 'BATCH', status: 'queued', timestamp: '14:35:00', duration: '排队中' },
  { id: 'OL-005', action: '导出审计日志', actionEn: 'Export Audit Logs', operator: '赵六', target: 'SYSTEM', status: 'success', timestamp: '13:45:10', duration: '8s' },
  { id: 'OL-006', action: '部署Embedding v2.2', actionEn: 'Deploy Embedding v2.2', operator: '张三', target: 'DEV-012', status: 'failed', timestamp: '12:20:33', duration: '4m 12s' },
  { id: 'OL-007', action: '网络配置更新', actionEn: 'Network Config Update', operator: '李四', target: 'DEV-002', status: 'success', timestamp: '11:50:00', duration: '15s' },
  { id: 'OL-008', action: '归档历史数据', actionEn: 'Archive History Data', operator: '系统', target: 'DEV-008', status: 'success', timestamp: '03:00:00', duration: '1h 12m' },
];

const statusConfig = {
  running: { label: '运行中', labelEn: 'Running', color: 'text-cyan-400', bg: 'bg-cyan-500', animate: true },
  success: { label: '成功', labelEn: 'Success', color: 'text-green-400', bg: 'bg-green-500', animate: false },
  failed: { label: '失败', labelEn: 'Failed', color: 'text-red-400', bg: 'bg-red-500', animate: false },
  queued: { label: '排队中', labelEn: 'Queued', color: 'text-yellow-400', bg: 'bg-yellow-500', animate: true },
};

const riskConfig = {
  low: { label: '低', labelEn: 'Low', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/30' },
  medium: { label: '中', labelEn: 'Med', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30' },
  high: { label: '高', labelEn: 'High', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30' },
};

const categoryTabs = [
  { key: 'all', label: '全部', labelEn: 'All' },
  { key: 'node', label: '节点操作', labelEn: 'Node Ops' },
  { key: 'model', label: '模型操作', labelEn: 'Model Ops' },
  { key: 'task', label: '定时任务', labelEn: 'Tasks' },
  { key: 'system', label: '系统操作', labelEn: 'System' },
];

export function OperationCenter() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [activeTab, setActiveTab] = useState('quickActions');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filteredActions = QUICK_ACTIONS.filter(a => categoryFilter === 'all' || a.category === categoryFilter);
  const filteredTemplates = OPERATION_TEMPLATES.filter(t => categoryFilter === 'all' || t.category === categoryFilter);

  const handleExecute = (actionId: string) => {
    setExecutingAction(actionId);
    setTimeout(() => setExecutingAction(null), 2000);
  };

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Settings className="w-6 h-6" />
            {isZh ? '操作中心' : 'Operation Center'}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-300 border border-cyan-500/30">
              PHASE 1
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '集中管理所有系统操作、模板与定时任务' : 'Centralized management of all system operations, templates & tasks'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm" style={{ fontSize: '0.875rem' }}>
            <Terminal className="w-4 h-4" /> {isZh ? 'CLI模式' : 'CLI Mode'}
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 shrink-0">
        {[
          { key: 'quickActions', label: isZh ? '快速操作' : 'Quick Actions' },
          { key: 'templates', label: isZh ? '操作模板' : 'Templates' },
          { key: 'logs', label: isZh ? '操作日志' : 'Op Logs' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-xs transition-all ${
              activeTab === tab.key
                ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
            style={{ fontSize: '0.75rem' }}
          >
            {tab.label}
            {tab.key === 'logs' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] border border-cyan-500/30">
                {OPERATION_LOGS.filter(l => l.status === 'running').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      {activeTab !== 'logs' && (
        <div className="flex gap-1 shrink-0">
          {categoryTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setCategoryFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                categoryFilter === tab.key
                  ? 'bg-gray-700/50 text-white border border-gray-600'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
              style={{ fontSize: '0.7rem' }}
            >
              {isZh ? tab.label : tab.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {/* Quick Actions Grid */}
          {activeTab === 'quickActions' && (
            <motion.div
              key="quickActions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {filteredActions.map((action, idx) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <button
                    onClick={() => handleExecute(action.id)}
                    disabled={executingAction === action.id}
                    className="w-full text-left p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50 transition-all group relative overflow-hidden"
                  >
                    {/* Glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5`} />
                    </div>

                    <div className="relative z-10">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                        {executingAction === action.id ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          action.icon
                        )}
                      </div>
                      <div className="text-sm text-white" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {isZh ? action.label : action.labelEn}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1" style={{ fontSize: '0.625rem' }}>
                        {isZh ? action.description : action.descriptionEn}
                      </div>
                    </div>

                    {executingAction === action.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                      />
                    )}
                  </button>
                </motion.div>
              ))}

              {/* Add Custom Action */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: filteredActions.length * 0.04 }}
              >
                <button className="w-full h-full min-h-[120px] p-4 rounded-xl border border-dashed border-gray-700 bg-gray-900/30 hover:border-cyan-500/30 hover:bg-gray-800/30 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-cyan-400">
                  <Plus className="w-6 h-6" />
                  <span className="text-xs" style={{ fontSize: '0.75rem' }}>{isZh ? '自定义操作' : 'Custom Action'}</span>
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Templates */}
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Add Template Button */}
              <button className="w-full p-3 rounded-xl border border-dashed border-gray-700 bg-gray-900/30 hover:border-cyan-500/30 hover:bg-gray-800/30 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-cyan-400 text-sm" style={{ fontSize: '0.8rem' }}>
                <Plus className="w-4 h-4" /> {isZh ? '新建模板' : 'New Template'}
              </button>

              {filteredTemplates.map((tpl, idx) => {
                const risk = riskConfig[tpl.risk];
                const isExpanded = expandedTemplate === tpl.id;

                return (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden hover:border-gray-600 transition-colors"
                  >
                    <button
                      onClick={() => setExpandedTemplate(isExpanded ? null : tpl.id)}
                      className="w-full text-left p-4 flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {isZh ? tpl.name : tpl.nameEn}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${risk.bg} ${risk.color} border ${risk.border}`} style={{ fontSize: '0.6rem' }}>
                            {isZh ? `风险:${risk.label}` : `Risk:${risk.labelEn}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate" style={{ fontSize: '0.7rem' }}>
                          {isZh ? tpl.description : tpl.descriptionEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-[10px] text-gray-500" style={{ fontSize: '0.6rem' }}>{isZh ? '预估时间' : 'Est. Time'}</div>
                          <div className="text-xs text-gray-300 font-mono" style={{ fontSize: '0.75rem' }}>{tpl.estimatedTime}</div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="text-[10px] text-gray-500" style={{ fontSize: '0.6rem' }}>{isZh ? '使用次数' : 'Used'}</div>
                          <div className="text-xs text-cyan-400 font-mono" style={{ fontSize: '0.75rem' }}>{tpl.usageCount}</div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                            <div className="text-[10px] text-gray-500 font-mono uppercase mb-2" style={{ fontSize: '0.6rem' }}>
                              {isZh ? '执行步骤' : 'Execution Steps'} ({tpl.steps.length})
                            </div>
                            <div className="space-y-1.5">
                              {tpl.steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] text-gray-400 font-mono shrink-0" style={{ fontSize: '0.6rem' }}>
                                    {i + 1}
                                  </div>
                                  <span className="text-xs text-gray-300" style={{ fontSize: '0.75rem' }}>
                                    {isZh ? step.label : step.labelEn}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600/80 border border-cyan-500/50 text-white hover:bg-cyan-500 transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                                <Play className="w-3.5 h-3.5" /> {isZh ? '执行模板' : 'Execute'}
                              </button>
                              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                                <Copy className="w-3.5 h-3.5" /> {isZh ? '复制' : 'Clone'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Operation Logs */}
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FuturisticPanel title={isZh ? '实时操作流' : 'Live Operation Stream'} subtitle={isZh ? '今日操作记录' : "Today's operations"}>
                <div className="space-y-2">
                  {OPERATION_LOGS.map((log, idx) => {
                    const st = statusConfig[log.status];
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          log.status === 'running' ? 'bg-cyan-900/10 border-cyan-500/20' :
                          log.status === 'failed' ? 'bg-red-900/10 border-red-500/20' :
                          log.status === 'queued' ? 'bg-yellow-900/10 border-yellow-500/20' :
                          'bg-gray-800/30 border-gray-700/50'
                        }`}
                      >
                        {/* Status Dot */}
                        <div className={`w-2 h-2 rounded-full ${st.bg} shrink-0 ${st.animate ? 'animate-pulse' : ''}`} />

                        {/* Time */}
                        <span className="text-xs text-gray-500 font-mono w-16 shrink-0" style={{ fontSize: '0.7rem' }}>
                          {log.timestamp}
                        </span>

                        {/* Action */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-200 truncate block" style={{ fontSize: '0.8rem' }}>
                            {isZh ? log.action : log.actionEn}
                          </span>
                        </div>

                        {/* Operator */}
                        <span className="text-xs text-gray-400 hidden sm:block" style={{ fontSize: '0.7rem' }}>
                          {log.operator}
                        </span>

                        {/* Status */}
                        <span className={`text-xs ${st.color} font-mono whitespace-nowrap`} style={{ fontSize: '0.7rem' }}>
                          {isZh ? st.label : st.labelEn}
                        </span>

                        {/* Duration */}
                        <span className="text-xs text-gray-500 font-mono w-16 text-right shrink-0 hidden md:block" style={{ fontSize: '0.65rem' }}>
                          {log.status === 'running' ? (isZh ? '进行中' : 'Running') : 
                           log.status === 'queued' ? (isZh ? '排队中' : 'Queued') : log.duration}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </FuturisticPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
