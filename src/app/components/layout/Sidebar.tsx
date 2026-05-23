/**
 * @file Sidebar.tsx
 * @description YYC³ 侧边栏导航组件 - 支持自动伸缩（pin/unpin + hover 展开）
 * @author YYC³
 * @version 2.0.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Activity, Cpu, Server, Network, Shield, Settings, 
  ChevronRight, HardDrive, Monitor, FileText, Key,
  Target, Crosshair, Wrench, FlaskConical, Brain, FolderOpen,
  Terminal, Code, FileCode, Palette, Sparkles, BarChart3, History, Sliders,
  Pin, PinOff, ChevronDown
} from 'lucide-react';
import logo from 'figma:asset/e53d9619a35d8a04f00785f03278798ee0e23e49.png';
import { useLanguage } from '../LanguageContext';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (_id: string) => void;
  isOpen?: boolean;
  onTogglePin?: (_pinned: boolean) => void;
}

export function Sidebar({ activeModule, setActiveModule, isOpen = true, onTogglePin }: SidebarProps) {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';

  // Auto-collapse state
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine if sidebar should be expanded
  const isExpanded = isPinned ? isOpen : isHovered;
  const sidebarWidth = isExpanded ? 256 : 72;

  const handleMouseEnter = useCallback(() => {
    if (isPinned) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150);
  }, [isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (isPinned) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  }, [isPinned]);

  const togglePin = useCallback(() => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    if (!newPinned) {
      setIsHovered(false);
    }
    onTogglePin?.(newPinned);
  }, [isPinned, onTogglePin]);

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const brainItems = [
    { id: 'overview', label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'docs', label: t('whitepaper'), icon: <BookOpen size={18} /> },
    { id: 'perception', label: t('perception'), icon: <Activity size={18} /> },
    { id: 'edge', label: t('computing'), icon: <Cpu size={18} /> },
    { id: 'platform', label: t('platform'), icon: <Server size={18} /> },
    { id: 'network', label: t('network'), icon: <Network size={18} /> },
    { id: 'security', label: t('security'), icon: <Shield size={18} /> },
  ];

  const devopsItems = [
    { id: 'devices', label: t('deviceMgmt'), icon: <HardDrive size={18} /> },
    { id: 'monitor', label: t('monitor'), icon: <Monitor size={18} /> },
    { id: 'audit', label: t('auditLog'), icon: <FileText size={18} /> },
    { id: 'permissions', label: t('permission'), icon: <Key size={18} /> },
    { id: 'operations', label: isZh ? '操作中心' : 'Op Center', icon: <Wrench size={18} /> },
    { id: 'patrol', label: isZh ? '巡查模式' : 'Patrol', icon: <Crosshair size={18} /> },
    { id: 'followup', label: isZh ? '一键跟进' : 'Follow-up', icon: <Target size={18} /> },
    { id: 'ai-suggestion', label: isZh ? 'AI 决策' : 'AI Assist', icon: <Brain size={18} /> },
    { id: 'local-files', label: isZh ? '本地文件' : 'Local Files', icon: <FolderOpen size={18} /> },
    { id: 'cli-terminal', label: isZh ? 'CLI 终端' : 'CLI Terminal', icon: <Terminal size={18} /> },
    { id: 'ide-plugin', label: isZh ? 'IDE 视图' : 'IDE View', icon: <Code size={18} /> },
    { id: 'script-editor', label: isZh ? '脚本操作' : 'Scripts', icon: <FileCode size={18} /> },
    { id: 'model-settings', label: isZh ? 'AI 模型' : 'AI Models', icon: <Sparkles size={18} /> },
    { id: 'comparison', label: isZh ? '跨端对比' : 'Comparison', icon: <BarChart3 size={18} /> },
    { id: 'historical', label: isZh ? '历史对比' : 'Historical', icon: <History size={18} /> },
    { id: 'thresholds', label: isZh ? '告警阈值' : 'Thresholds', icon: <Sliders size={18} /> },
    { id: 'theme-customizer', label: isZh ? '主题定制' : 'Themes', icon: <Palette size={18} /> },
    { id: 'tests', label: isZh ? '测试用例' : 'Tests', icon: <FlaskConical size={18} /> },
  ];

  const bottomItems = [
    { id: 'settings', label: t('settings'), icon: <Settings size={18} /> },
  ];

  const renderNavItem = (item: { id: string; label: string; icon: React.ReactNode }) => (
    <button
      key={item.id}
      onClick={() => setActiveModule(item.id)}
      title={!isExpanded ? item.label : undefined}
      className={`
        w-full flex items-center gap-3 transition-all duration-200 group relative overflow-hidden
        ${isExpanded ? 'px-4 py-2.5' : 'px-0 py-2.5 justify-center'}
        ${activeModule === item.id 
          ? 'shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
          : 'hover:bg-white/5'}
      `}
      style={{
        borderRadius: 'var(--theme-radius-md, 12px)',
        background: activeModule === item.id
          ? 'linear-gradient(to right, color-mix(in srgb, var(--theme-sidebar-primary) 20%, transparent), color-mix(in srgb, var(--theme-sidebar-accent) 15%, transparent))'
          : 'transparent',
        color: activeModule === item.id
          ? 'var(--theme-sidebar-primary, #22d3ee)'
          : 'var(--theme-muted-fg, #9ca3af)',
        border: activeModule === item.id
          ? '1px solid color-mix(in srgb, var(--theme-sidebar-primary) 30%, transparent)'
          : '1px solid transparent',
      }}
    >
      {activeModule === item.id && (
        <motion.div 
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: 'var(--theme-sidebar-primary, #06b6d4)', boxShadow: '0 0 10px var(--theme-sidebar-primary, #06b6d4)' }}
        />
      )}
      <div className={`transition-transform duration-200 relative z-10 shrink-0 ${activeModule === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
        {item.icon}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="tracking-wide whitespace-nowrap relative z-10 overflow-hidden"
            style={{ fontSize: '0.8125rem', fontWeight: 500 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );

  const renderSectionHeader = (key: string, label: string, colorVar?: string) => {
    const isCollapsed = collapsedSections[key];
    
    if (!isExpanded) {
      return (
        <div className="flex justify-center py-2">
          <div className="w-6 h-px" style={{ background: 'color-mix(in srgb, var(--theme-sidebar-border) 80%, transparent)' }} />
        </div>
      );
    }
    
    return (
      <button
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between px-4 mb-1 py-1 hover:bg-white/5 rounded-lg transition-colors"
      >
        <span className="font-mono uppercase tracking-widest" style={{ 
          fontSize: '0.6rem', 
          color: colorVar || 'var(--theme-muted-fg, #4b5563)' 
        }}>
          {label}
        </span>
        <motion.div
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} style={{ color: 'var(--theme-muted-fg, #4b5563)' }} />
        </motion.div>
      </button>
    );
  };

  return (
    <motion.aside 
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col z-20 shadow-xl overflow-hidden shrink-0 relative"
      style={{
        background: 'var(--theme-sidebar-background, #0d1221)',
        borderRight: '1px solid var(--theme-sidebar-border, #1f2937)',
        fontFamily: 'var(--theme-font-sans)',
      }}
    >
      {/* Sidebar Logo Area */}
      <div className="shrink-0 flex items-center justify-between" style={{ 
        borderBottom: '1px solid color-mix(in srgb, var(--theme-sidebar-border) 50%, transparent)',
        height: '72px',
        padding: isExpanded ? '0 16px 0 20px' : '0 12px',
      }}>
        <div className="flex items-center gap-3 min-w-0">
          <motion.div 
            layout
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 shrink-0"
          >
            <img src={logo} alt="YYC³ Logo" className="w-full h-full object-contain p-1" />
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 overflow-hidden"
              >
                <h1 className="tracking-wider truncate" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-background-fg, white)' }}>YYC³</h1>
                <div className="font-mono tracking-widest truncate" style={{ fontSize: '0.5625rem', color: 'var(--theme-sidebar-primary, #22d3ee)' }}>NEURAL · DEVOPS</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pin/Unpin Toggle */}
        <AnimatePresence>
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={togglePin}
              title={isPinned ? (isZh ? '取消固定' : 'Unpin sidebar') : (isZh ? '固定侧栏' : 'Pin sidebar')}
              className="p-1.5 rounded-lg transition-all shrink-0 hover:bg-white/10"
              style={{
                color: isPinned ? 'var(--theme-sidebar-primary, #22d3ee)' : 'var(--theme-muted-fg, #6b7280)',
              }}
            >
              {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse indicator when not pinned */}
      {!isPinned && !isExpanded && (
        <div className="flex justify-center py-2 shrink-0">
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center"
          >
            <ChevronRight size={14} style={{ color: 'var(--theme-sidebar-primary, #22d3ee)' }} />
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto custom-scrollbar">
        {/* Brain System Section */}
        {renderSectionHeader('brain', 'Brain System')}
        <AnimatePresence>
          {!collapsedSections['brain'] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-0.5 mb-3">
                {brainItems.map(renderNavItem)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="mx-3 mb-2" style={{ borderTop: '1px solid color-mix(in srgb, var(--theme-sidebar-border) 80%, transparent)' }} />

        {/* DevOps Section */}
        {renderSectionHeader('devops', 'DevOps Dashboard', 'color-mix(in srgb, var(--theme-sidebar-primary) 60%, transparent)')}
        <AnimatePresence>
          {!collapsedSections['devops'] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-0.5 mb-3">
                {devopsItems.map(renderNavItem)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="mx-3 mb-2" style={{ borderTop: '1px solid color-mix(in srgb, var(--theme-sidebar-border) 80%, transparent)' }} />

        {/* Settings */}
        <div className="space-y-0.5">
          {bottomItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid color-mix(in srgb, var(--theme-sidebar-border) 50%, transparent)' }}>
        <div className={`flex items-center gap-3 p-2.5 ${!isExpanded && 'justify-center'}`}
          style={{
            borderRadius: 'var(--theme-radius-md, 12px)',
            background: 'color-mix(in srgb, var(--theme-sidebar-background) 80%, black)',
            border: '1px solid var(--theme-sidebar-border, #1f2937)',
          }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shrink-0" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            A
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden min-w-0"
              >
                <div className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Admin</div>
                <div className="text-gray-500 truncate" style={{ fontSize: '0.625rem' }}>super_admin</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
