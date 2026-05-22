import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Command, LayoutDashboard, BookOpen, Activity, Cpu, Server,
  Network, Shield, Settings, HardDrive, Monitor, FileText, Key,
  Target, Crosshair, Wrench, FlaskConical, Brain, FolderOpen,
  ArrowRight, ChevronRight, Zap, Hash, Clock, Keyboard,
  AlertTriangle, RefreshCw, Play, Download, Trash2, Sparkles
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

// ===== Types =====
interface CommandItem {
  id: string;
  label: string;
  labelEn: string;
  category: string;
  categoryEn: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
}

// ===== Component =====
export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  // Build command list
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-overview', label: '系统总览', labelEn: 'System Overview', category: '导航', categoryEn: 'Navigate', icon: <LayoutDashboard size={16} />, action: () => onNavigate('overview'), keywords: ['overview', 'dashboard', '总览', '首页'] },
    { id: 'nav-docs', label: '技术文档', labelEn: 'Tech Docs', category: '导航', categoryEn: 'Navigate', icon: <BookOpen size={16} />, action: () => onNavigate('docs'), keywords: ['docs', 'whitepaper', '文档', '白皮书'] },
    { id: 'nav-perception', label: '感知交互', labelEn: 'Perception Layer', category: '导航', categoryEn: 'Navigate', icon: <Activity size={16} />, action: () => onNavigate('perception'), keywords: ['perception', '感知'] },
    { id: 'nav-edge', label: '边缘计算', labelEn: 'Edge Computing', category: '导航', categoryEn: 'Navigate', icon: <Cpu size={16} />, action: () => onNavigate('edge'), keywords: ['edge', 'computing', '边缘', '计算'] },
    { id: 'nav-platform', label: '平台服务', labelEn: 'Platform Service', category: '导航', categoryEn: 'Navigate', icon: <Server size={16} />, action: () => onNavigate('platform'), keywords: ['platform', '平台'] },
    { id: 'nav-network', label: '网络传输', labelEn: 'Network Layer', category: '导航', categoryEn: 'Navigate', icon: <Network size={16} />, action: () => onNavigate('network'), keywords: ['network', '网络'] },
    { id: 'nav-security', label: '安全防护', labelEn: 'Security System', category: '导航', categoryEn: 'Navigate', icon: <Shield size={16} />, action: () => onNavigate('security'), keywords: ['security', '安全'] },
    { id: 'nav-settings', label: '系统设置', labelEn: 'System Settings', category: '导航', categoryEn: 'Navigate', icon: <Settings size={16} />, action: () => onNavigate('settings'), keywords: ['settings', '设置', '配置'] },
    // DevOps Navigation
    { id: 'nav-devices', label: '设备管理', labelEn: 'Device Management', category: 'DevOps', categoryEn: 'DevOps', icon: <HardDrive size={16} />, action: () => onNavigate('devices'), keywords: ['device', '设备', '服务器'] },
    { id: 'nav-monitor', label: '数据监控', labelEn: 'Monitor Dashboard', category: 'DevOps', categoryEn: 'DevOps', icon: <Monitor size={16} />, action: () => onNavigate('monitor'), keywords: ['monitor', '监控', '仪表盘'] },
    { id: 'nav-audit', label: '操作审计', labelEn: 'Audit Logs', category: 'DevOps', categoryEn: 'DevOps', icon: <FileText size={16} />, action: () => onNavigate('audit'), keywords: ['audit', '审计', '日志'] },
    { id: 'nav-permissions', label: '权限管理', labelEn: 'Permission Manager', category: 'DevOps', categoryEn: 'DevOps', icon: <Key size={16} />, action: () => onNavigate('permissions'), keywords: ['permission', '权限', 'RBAC'] },
    { id: 'nav-operations', label: '操作中心', labelEn: 'Operation Center', category: 'DevOps', categoryEn: 'DevOps', icon: <Wrench size={16} />, action: () => onNavigate('operations'), keywords: ['operation', '操作', '中心'] },
    { id: 'nav-patrol', label: '巡查模式', labelEn: 'Patrol Mode', category: 'DevOps', categoryEn: 'DevOps', icon: <Crosshair size={16} />, action: () => onNavigate('patrol'), keywords: ['patrol', '巡查', '巡检'], shortcut: '⌘⇧P' },
    { id: 'nav-followup', label: '一键跟进', labelEn: 'Follow-up System', category: 'DevOps', categoryEn: 'DevOps', icon: <Target size={16} />, action: () => onNavigate('followup'), keywords: ['followup', '跟进', '告警'] },
    { id: 'nav-ai', label: 'AI 辅助决策', labelEn: 'AI Decision Support', category: 'DevOps', categoryEn: 'DevOps', icon: <Brain size={16} />, action: () => onNavigate('ai-suggestion'), keywords: ['ai', '智能', '决策', '建议'] },
    { id: 'nav-files', label: '本地文件', labelEn: 'Local Files', category: 'DevOps', categoryEn: 'DevOps', icon: <FolderOpen size={16} />, action: () => onNavigate('local-files'), keywords: ['file', '文件', '本地', '存储'] },
    { id: 'nav-model-settings', label: 'AI 模型管理', labelEn: 'AI Model Settings', category: 'DevOps', categoryEn: 'DevOps', icon: <Sparkles size={16} />, action: () => onNavigate('model-settings'), keywords: ['model', 'ai', 'llm', 'openai', 'claude', 'ollama', '模型', '智谱', '千问'], shortcut: '⌘⇧M' },
    { id: 'nav-theme', label: '主题定制', labelEn: 'Theme Customizer', category: 'DevOps', categoryEn: 'DevOps', icon: <Settings size={16} />, action: () => onNavigate('theme-customizer'), keywords: ['theme', '主题', '定制', '颜色', 'color', 'font'] },
    { id: 'nav-tests', label: '测试用例', labelEn: 'Test Runner', category: 'DevOps', categoryEn: 'DevOps', icon: <FlaskConical size={16} />, action: () => onNavigate('tests'), keywords: ['test', '测试', '用例'] },
    // Quick Actions
    { id: 'action-alert', label: '查看告警列表', labelEn: 'View Alerts', category: '快速操作', categoryEn: 'Quick Action', icon: <AlertTriangle size={16} />, action: () => onNavigate('followup'), keywords: ['alert', '告警', '异常'], shortcut: '⌘⇧A' },
    { id: 'action-restart', label: '重启节点', labelEn: 'Restart Node', category: '快速操作', categoryEn: 'Quick Action', icon: <RefreshCw size={16} />, action: () => onNavigate('operations'), keywords: ['restart', '重启', '节点'] },
    { id: 'action-deploy', label: '部署模型', labelEn: 'Deploy Model', category: '快速操作', categoryEn: 'Quick Action', icon: <Play size={16} />, action: () => onNavigate('operations'), keywords: ['deploy', '部署', '模型'] },
    { id: 'action-export', label: '导出日志', labelEn: 'Export Logs', category: '快速操作', categoryEn: 'Quick Action', icon: <Download size={16} />, action: () => onNavigate('audit'), keywords: ['export', '导出', '日志'], shortcut: '⌘⇧L' },
    { id: 'action-cleanup', label: '清理缓存', labelEn: 'Clear Cache', category: '快速操作', categoryEn: 'Quick Action', icon: <Trash2 size={16} />, action: () => onNavigate('local-files'), keywords: ['cache', '缓存', '清理'] },
  ], [onNavigate, isZh]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.labelEn.toLowerCase().includes(q) ||
      cmd.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [query, commands]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: { [key: string]: CommandItem[] } = {};
    filteredCommands.forEach(cmd => {
      const cat = isZh ? cmd.category : cmd.categoryEn;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    });
    return groups;
  }, [filteredCommands, isZh]);

  // Flat list for keyboard nav
  const flatList = useMemo(() => {
    const items: CommandItem[] = [];
    Object.values(groupedCommands).forEach(group => {
      items.push(...group);
    });
    return items;
  }, [groupedCommands]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Execute command
  const executeCommand = useCallback((cmd: CommandItem) => {
    setRecentCommands(prev => [cmd.id, ...prev.filter(id => id !== cmd.id)].slice(0, 5));
    cmd.action();
    onClose();
  }, [onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatList[selectedIndex]) {
      e.preventDefault();
      executeCommand(flatList[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [flatList, selectedIndex, executeCommand, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let currentFlatIdx = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl mx-4 bg-[#0d1221] border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(139,92,246,0.15), 0 25px 50px rgba(0,0,0,0.5)' }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
              <Search size={18} className="text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isZh ? '搜索命令、页面、操作...' : 'Search commands, pages, actions...'}
                className="flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none"
                style={{ fontSize: '0.9375rem', fontWeight: 400 }}
              />
              <kbd className="px-2 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700" style={{ fontSize: '0.625rem' }}>ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {Object.keys(groupedCommands).length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-500" style={{ fontSize: '0.875rem' }}>
                  {isZh ? '未找到匹配的命令' : 'No matching commands found'}
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-5 py-2">
                      <span className="text-gray-600 uppercase tracking-wider" style={{ fontSize: '0.625rem', fontWeight: 600 }}>{category}</span>
                    </div>
                    {items.map(item => {
                      currentFlatIdx++;
                      const idx = currentFlatIdx;
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-selected={isSelected}
                          onClick={() => executeCommand(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all ${
                            isSelected
                              ? 'bg-purple-500/15 text-white'
                              : 'text-gray-400 hover:bg-gray-800/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800/50 text-gray-500'
                          }`}>
                            {item.icon}
                          </div>
                          <span className="flex-1 text-left truncate" style={{ fontSize: '0.875rem', fontWeight: isSelected ? 500 : 400 }}>
                            {isZh ? item.label : item.labelEn}
                          </span>
                          {item.shortcut && (
                            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-600 border border-gray-700 shrink-0" style={{ fontSize: '0.625rem' }}>
                              {item.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <ArrowRight size={14} className="text-purple-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-600" style={{ fontSize: '0.6875rem' }}>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-800 border border-gray-700" style={{ fontSize: '0.5625rem' }}>↑↓</kbd>
                  {isZh ? '选择' : 'Navigate'}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-800 border border-gray-700" style={{ fontSize: '0.5625rem' }}>↵</kbd>
                  {isZh ? '执行' : 'Execute'}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-800 border border-gray-700" style={{ fontSize: '0.5625rem' }}>esc</kbd>
                  {isZh ? '关闭' : 'Close'}
                </span>
              </div>
              <span className="text-gray-700 flex items-center gap-1" style={{ fontSize: '0.625rem' }}>
                <Command size={10} /> YYC³
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ===== Global Keyboard Hook =====
export function useGlobalShortcuts(onNavigate: (module: string) => void) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd+K -> Command Palette
      if (isMeta && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      // Cmd+Shift+A -> Alerts / Follow-up
      if (isMeta && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        onNavigate('followup');
        return;
      }

      // Cmd+Shift+P -> Patrol
      if (isMeta && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        onNavigate('patrol');
        return;
      }

      // Cmd+Shift+O -> Operation Center
      if (isMeta && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        onNavigate('operations');
        return;
      }

      // Cmd+Shift+L -> Audit Logs
      if (isMeta && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        onNavigate('audit');
        return;
      }

      // Cmd+Shift+F -> Follow-up / Favorite
      if (isMeta && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        onNavigate('followup');
        return;
      }

      // Cmd+Shift+M -> AI Model Settings
      if (isMeta && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        onNavigate('model-settings');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  return {
    commandPaletteOpen,
    setCommandPaletteOpen,
  };
}