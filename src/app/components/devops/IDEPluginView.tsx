import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Monitor, AlertTriangle, Wrench, FileText, ChevronRight, ChevronDown,
  Circle, Cpu, MemoryStick, Wifi, RefreshCw, ExternalLink, Search,
  Play, Settings, Eye, Bell, Code, Palette, GitBranch,
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';
import { useApi } from '../../api/hooks';
import type { IDENodeStatus } from '../../api/types';

type TabId = 'monitor' | 'alerts' | 'actions' | 'logs';

interface Tab {
  id: TabId;
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  badge?: number;
}

const statusColors = {
  online: { dot: 'bg-green-400', text: 'text-green-400', label: 'Online' },
  warning: { dot: 'bg-yellow-400', text: 'text-yellow-400', label: 'Warning' },
  offline: { dot: 'bg-red-400', text: 'text-red-400', label: 'Offline' },
};

export function IDEPluginView() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [activeTab, setActiveTab] = useState<TabId>('monitor');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: nodes } = useApi<IDENodeStatus[]>('GET', '/ide/nodes');
  const { data: summary } = useApi<any>('GET', '/ide/summary');

  const tabs: Tab[] = [
    { id: 'monitor', label: '数据监控', labelEn: 'Monitor', icon: <Monitor className="w-4 h-4" />, badge: summary?.alerts || 0 },
    { id: 'alerts', label: '告警', labelEn: 'Alerts', icon: <Bell className="w-4 h-4" />, badge: summary?.alerts || 0 },
    { id: 'actions', label: '操作', labelEn: 'Actions', icon: <Wrench className="w-4 h-4" /> },
    { id: 'logs', label: '日志', labelEn: 'Logs', icon: <FileText className="w-4 h-4" /> },
  ];

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredNodes = (nodes || []).filter(n =>
    !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulated log entries
  const logEntries = [
    { time: '14:35:12', level: 'INFO', msg: 'Model LLaMA-70B loaded on GPU-A100-01' },
    { time: '14:34:55', level: 'WARN', msg: 'NAS-Tensor-Inference CPU at 95%' },
    { time: '14:34:30', level: 'INFO', msg: 'Patrol scan completed: score 88%' },
    { time: '14:33:15', level: 'ERROR', msg: 'Connection timeout: NAS-Tensor-Inference' },
    { time: '14:32:45', level: 'INFO', msg: 'Redis cache cleared successfully' },
    { time: '14:31:00', level: 'INFO', msg: 'Daily backup started for yyc3_prod' },
    { time: '14:30:22', level: 'WARN', msg: 'SSL cert for yyc3-125-ECS expiring in 30d' },
    { time: '14:29:10', level: 'INFO', msg: 'User zhangsan logged in from 192.168.1.50' },
  ];

  const quickActions = [
    { id: 'open-browser', label: isZh ? '打开浏览器面板' : 'Open Browser Panel', icon: <ExternalLink className="w-3.5 h-3.5" />, shortcut: 'Ctrl+Shift+B' },
    { id: 'quick-status', label: isZh ? '快速状态检查' : 'Quick Status Check', icon: <Eye className="w-3.5 h-3.5" />, shortcut: 'Ctrl+Shift+S' },
    { id: 'export-data', label: isZh ? '导出数据' : 'Export Data', icon: <FileText className="w-3.5 h-3.5" />, shortcut: 'Ctrl+Shift+E' },
    { id: 'run-patrol', label: isZh ? '执行巡查' : 'Run Patrol', icon: <Play className="w-3.5 h-3.5" />, shortcut: 'Ctrl+Shift+P' },
    { id: 'open-settings', label: isZh ? '插件设置' : 'Plugin Settings', icon: <Settings className="w-3.5 h-3.5" />, shortcut: 'Ctrl+,' },
  ];

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Code className="w-6 h-6" />
            {isZh ? 'IDE 插件视图' : 'IDE Plugin View'}
            <span className="text-xs font-mono px-2 py-0.5 rounded border bg-blue-900/30 text-blue-300 border-blue-500/30" style={{ fontSize: '0.65rem' }}>
              VS CODE
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '模拟 VS Code 侧边栏面板 — 节点状态、告警、快速操作' : 'Simulated VS Code sidebar panel — nodes, alerts, quick actions'}
          </p>
        </div>
      </div>

      {/* Main Layout: VS Code Style */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        {/* Left: VS Code Activity Bar + Sidebar */}
        <div className="flex shrink-0 h-full overflow-hidden" style={{ width: 420 }}>
          {/* Activity Bar */}
          <div className="w-12 bg-[#1e1e2e] border-r border-gray-800 flex flex-col items-center py-2 gap-1 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-400 bg-cyan-500/10 border-l-2 border-cyan-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center" style={{ fontSize: '0.5rem' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
            <div className="mt-auto">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] text-white" style={{ fontSize: '0.6rem', fontWeight: 700 }}>
                YC
              </div>
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="flex-1 bg-[#161625] border-r border-gray-800 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-300 font-mono uppercase tracking-wider" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                YYC³ Matrix Dashboard
              </span>
              <button className="text-gray-500 hover:text-gray-300">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'monitor' && (
                  <motion.div key="monitor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[
                        { label: isZh ? '节点' : 'Nodes', value: `${summary?.onlineNodes || 0}/${summary?.totalNodes || 0}`, color: 'text-green-400' },
                        { label: 'CPU', value: `${summary?.cpuAvg || 0}%`, color: 'text-cyan-400' },
                        { label: 'MEM', value: `${summary?.memAvg || 0}%`, color: 'text-purple-400' },
                      ].map(s => (
                        <div key={s.label} className="px-2 py-1.5 rounded bg-gray-900/50 border border-gray-800 text-center">
                          <div className="text-[9px] text-gray-500 font-mono" style={{ fontSize: '0.55rem' }}>{s.label}</div>
                          <div className={`text-sm font-mono ${s.color}`} style={{ fontSize: '0.8rem', fontWeight: 700 }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={isZh ? '搜索节点...' : 'Search nodes...'}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded pl-7 pr-2 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-cyan-500/50"
                        style={{ fontSize: '0.7rem' }}
                      />
                    </div>

                    {/* Section: Node Status */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 px-1 py-1 text-[10px] text-gray-500 font-mono uppercase" style={{ fontSize: '0.6rem' }}>
                        {isZh ? '节点状态' : 'Node Status'} ({filteredNodes.length})
                      </div>
                      {filteredNodes.map(node => {
                        const st = statusColors[node.status];
                        const isExpanded = expandedNodes.has(node.id);
                        return (
                          <div key={node.id}>
                            <button
                              onClick={() => toggleNode(node.id)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800/50 transition-colors group"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                              <div className={`w-2 h-2 rounded-full ${st.dot} ${node.status === 'offline' ? '' : 'animate-pulse'}`} />
                              <span className="text-xs text-gray-300 truncate flex-1 text-left" style={{ fontSize: '0.7rem' }}>{node.name}</span>
                              {node.status === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-400 shrink-0" />}
                              {node.status === 'offline' && <Circle className="w-3 h-3 text-red-400 shrink-0" />}
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-7 pl-2 border-l border-gray-800 space-y-1 pb-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-gray-500" style={{ fontSize: '0.6rem' }}>CPU</span>
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${node.cpu > 80 ? 'bg-red-500' : node.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${node.cpu}%` }} />
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono w-8 text-right" style={{ fontSize: '0.6rem' }}>{node.cpu}%</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-gray-500" style={{ fontSize: '0.6rem' }}>MEM</span>
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${node.memory > 80 ? 'bg-red-500' : node.memory > 60 ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{ width: `${node.memory}%` }} />
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono w-8 text-right" style={{ fontSize: '0.6rem' }}>{node.memory}%</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-gray-500" style={{ fontSize: '0.6rem' }}>Latency</span>
                                      <span className={`text-[10px] font-mono ${node.latency > 100 ? 'text-red-400' : node.latency > 50 ? 'text-yellow-400' : 'text-green-400'}`} style={{ fontSize: '0.6rem' }}>
                                        {node.latency}ms
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'alerts' && (
                  <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2">
                    <div className="text-[10px] text-gray-500 font-mono uppercase px-1 py-1 mb-1" style={{ fontSize: '0.6rem' }}>
                      {isZh ? '活跃告警' : 'Active Alerts'} (4)
                    </div>
                    {[
                      { level: 'critical', icon: '🔴', title: 'NAS-Tensor CPU 95%', time: '14:24' },
                      { level: 'warning', icon: '🟡', title: 'DB Connections 450/500', time: '14:16' },
                      { level: 'warning', icon: '🟡', title: 'NAS Disk Usage 73%', time: '13:45' },
                      { level: 'info', icon: '🔵', title: 'SSL Cert Expiring (30d)', time: '12:00' },
                    ].map((alert, i) => (
                      <div key={i} className="flex items-start gap-2 px-2 py-2 rounded hover:bg-gray-800/30 transition-colors cursor-pointer border-b border-gray-800/50">
                        <span className="text-xs mt-0.5">{alert.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-300 truncate" style={{ fontSize: '0.7rem' }}>{alert.title}</div>
                          <div className="text-[9px] text-gray-600 font-mono" style={{ fontSize: '0.55rem' }}>{alert.time}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'actions' && (
                  <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2">
                    <div className="text-[10px] text-gray-500 font-mono uppercase px-1 py-1 mb-1" style={{ fontSize: '0.6rem' }}>
                      {isZh ? '快速操作' : 'Quick Actions'}
                    </div>
                    {quickActions.map(action => (
                      <button
                        key={action.id}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-cyan-500/10 transition-colors group"
                      >
                        <div className="text-gray-500 group-hover:text-cyan-400 transition-colors">{action.icon}</div>
                        <span className="text-xs text-gray-300 group-hover:text-white flex-1 text-left" style={{ fontSize: '0.7rem' }}>{action.label}</span>
                        {action.shortcut && (
                          <span className="text-[9px] text-gray-600 font-mono bg-gray-800 px-1.5 py-0.5 rounded" style={{ fontSize: '0.55rem' }}>
                            {action.shortcut}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'logs' && (
                  <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2">
                    <div className="text-[10px] text-gray-500 font-mono uppercase px-1 py-1 mb-1" style={{ fontSize: '0.6rem' }}>
                      {isZh ? '实时日志' : 'Live Logs'}
                    </div>
                    {logEntries.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 px-1 py-1 font-mono border-b border-gray-800/30">
                        <span className="text-[10px] text-gray-600 shrink-0" style={{ fontSize: '0.55rem' }}>{log.time}</span>
                        <span className={`text-[10px] shrink-0 ${
                          log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-gray-500'
                        }`} style={{ fontSize: '0.55rem' }}>
                          [{log.level}]
                        </span>
                        <span className="text-[10px] text-gray-400 truncate" style={{ fontSize: '0.6rem' }}>{log.msg}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Panel Footer */}
            <div className="px-3 py-2 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.55rem' }}>
                  192.168.3.100:3118
                </span>
              </div>
              <span className="text-[10px] text-gray-600 font-mono" style={{ fontSize: '0.55rem' }}>v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Right: Editor Preview Area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <FuturisticPanel className="flex-1 !p-0 overflow-hidden">
            {/* Editor Tabs */}
            <div className="flex items-center gap-0 bg-gray-900/60 border-b border-gray-800">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-[#161625] border-r border-gray-800 text-xs text-cyan-400" style={{ fontSize: '0.7rem' }}>
                <Palette className="w-3.5 h-3.5" />
                dashboard.tsx
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 border-r border-gray-800 text-xs text-gray-500 hover:text-gray-300 cursor-pointer" style={{ fontSize: '0.7rem' }}>
                <GitBranch className="w-3.5 h-3.5" />
                config.ts
              </div>
            </div>

            {/* Editor Content Preview */}
            <div className="flex-1 overflow-auto bg-[#0d1117] p-4 font-mono text-xs" style={{ fontSize: '0.7rem' }}>
              <div className="space-y-0.5 text-gray-400">
                <div><span className="text-gray-600 mr-4 select-none"> 1</span><span className="text-purple-400">import</span> {'{'} <span className="text-cyan-300">useState</span>, <span className="text-cyan-300">useEffect</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;</div>
                <div><span className="text-gray-600 mr-4 select-none"> 2</span><span className="text-purple-400">import</span> {'{'} <span className="text-cyan-300">wsManager</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'./api/websocket'</span>;</div>
                <div><span className="text-gray-600 mr-4 select-none"> 3</span><span className="text-purple-400">import</span> {'{'} <span className="text-cyan-300">API_CONFIG</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'./api/config'</span>;</div>
                <div><span className="text-gray-600 mr-4 select-none"> 4</span></div>
                <div><span className="text-gray-600 mr-4 select-none"> 5</span><span className="text-gray-500">{'// YYC³ Dashboard — IDE Integration Module'}</span></div>
                <div><span className="text-gray-600 mr-4 select-none"> 6</span><span className="text-purple-400">const</span> <span className="text-cyan-300">BASE_URL</span> = <span className="text-green-400">'http://192.168.3.100:3118/api/v1'</span>;</div>
                <div><span className="text-gray-600 mr-4 select-none"> 7</span><span className="text-purple-400">const</span> <span className="text-cyan-300">WS_URL</span> = <span className="text-green-400">'ws://192.168.3.100:3118/api/v1/ws'</span>;</div>
                <div><span className="text-gray-600 mr-4 select-none"> 8</span></div>
                <div><span className="text-gray-600 mr-4 select-none"> 9</span><span className="text-purple-400">export function</span> <span className="text-yellow-300">connectDashboard</span>() {'{'}</div>
                <div><span className="text-gray-600 mr-4 select-none">10</span>  <span className="text-cyan-300">wsManager</span>.<span className="text-yellow-300">connect</span>([</div>
                <div><span className="text-gray-600 mr-4 select-none">11</span>    {'{'} <span className="text-cyan-300">type</span>: <span className="text-green-400">'monitor'</span> {'}'},</div>
                <div><span className="text-gray-600 mr-4 select-none">12</span>    {'{'} <span className="text-cyan-300">type</span>: <span className="text-green-400">'alert'</span> {'}'},</div>
                <div><span className="text-gray-600 mr-4 select-none">13</span>    {'{'} <span className="text-cyan-300">type</span>: <span className="text-green-400">'patrol'</span> {'}'},</div>
                <div><span className="text-gray-600 mr-4 select-none">14</span>  ]);</div>
                <div><span className="text-gray-600 mr-4 select-none">15</span>{'}'}</div>
                <div><span className="text-gray-600 mr-4 select-none">16</span></div>
                <div className="bg-cyan-500/5 border-l-2 border-cyan-400">
                  <span className="text-gray-600 mr-4 select-none">17</span>
                  <span className="text-gray-500">{'// '}</span>
                  <span className="text-cyan-400">{'TODO: Implement real-time node status sync'}</span>
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-[10px]" style={{ fontSize: '0.6rem' }}>
              <div className="flex items-center gap-3">
                <span><GitBranch className="w-3 h-3 inline mr-1" />main</span>
                <span>0 errors, 2 warnings</span>
              </div>
              <div className="flex items-center gap-3">
                <span>TypeScript React</span>
                <span>UTF-8</span>
                <span>LF</span>
              </div>
            </div>
          </FuturisticPanel>
        </div>
      </div>
    </div>
  );
}
