/**
 * @file AlertThresholdConfig.tsx
 * @description Phase 6.2 自定义告警阈值配置 — 每端点独立设置 CPU/内存/磁盘阈值，支持全局/独立模式切换
 * @author YYC3 Team <admin@0379.email>
 * @version 1.0.0
 * @created 2026-03-13
 * @updated 2026-03-13
 * @status published
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags [Phase6.2],[告警阈值],[配置管理],[端点独立]
 * @depends FuturisticPanel, motion/react, LanguageContext
 * @see /docs/phase-6.1-kickoff.md
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Save, RotateCcw, Cpu, HardDrive,
  MonitorSpeaker, Shield, Server, Bell, CheckCircle, Info,
  ChevronDown, Zap, Sliders, Globe, Lock, Unlock, RefreshCw
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';
import { useApi } from '../../api/hooks';

// ===== Types =====
interface EndpointThreshold {
  cpu: number;
  memory: number;
  disk: number;
  alertCount: number;
}

interface ThresholdConfig {
  mode: 'global' | 'independent';
  global: EndpointThreshold;
  endpoints: {
    max: EndpointThreshold;
    nas: EndpointThreshold;
    ecs: EndpointThreshold;
  };
  notifications: {
    email: boolean;
    webhook: boolean;
    dashboard: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}

type MetricKey = 'cpu' | 'memory' | 'disk' | 'alertCount';

// ===== Constants =====
const ENDPOINT_COLORS = {
  max: '#22d3ee',
  nas: '#a78bfa',
  ecs: '#fb7185',
} as const;

const ENDPOINT_LABELS = {
  max: { zh: 'Max端', en: 'Max Endpoint' },
  nas: { zh: 'NAS端', en: 'NAS Endpoint' },
  ecs: { zh: 'ECS端', en: 'ECS Endpoint' },
} as const;

const METRIC_INFO: Record<MetricKey, {
  zh: string; en: string; icon: React.ReactNode; unit: string; min: number; max: number; step: number; color: string;
  descZh: string; descEn: string;
}> = {
  cpu: {
    zh: 'CPU 使用率', en: 'CPU Usage', icon: <Cpu size={16} />, unit: '%', min: 50, max: 99, step: 1, color: '#22d3ee',
    descZh: '超过此阈值将触发 CPU 高负载告警', descEn: 'Triggers high CPU load alert when exceeded',
  },
  memory: {
    zh: '内存使用率', en: 'Memory Usage', icon: <MonitorSpeaker size={16} />, unit: '%', min: 50, max: 99, step: 1, color: '#a78bfa',
    descZh: '超过此阈值将触发内存不足告警', descEn: 'Triggers low memory alert when exceeded',
  },
  disk: {
    zh: '磁盘使用率', en: 'Disk Usage', icon: <HardDrive size={16} />, unit: '%', min: 50, max: 99, step: 1, color: '#fb7185',
    descZh: '超过此阈值将触发磁盘空间告警', descEn: 'Triggers disk space alert when exceeded',
  },
  alertCount: {
    zh: '告警数上限', en: 'Alert Count Limit', icon: <Bell size={16} />, unit: '', min: 1, max: 50, step: 1, color: '#fbbf24',
    descZh: '超过此数量将触发告警聚合通知', descEn: 'Triggers alert aggregation when exceeded',
  },
};

const DEFAULT_THRESHOLD: EndpointThreshold = { cpu: 85, memory: 85, disk: 80, alertCount: 5 };

// ===== Sub-components =====

/** ThresholdSlider — 阈值滑块 */
function ThresholdSlider({
  metric, value, onChange, disabled, isZh
}: {
  metric: MetricKey; value: number; onChange: (_v: number) => void; disabled?: boolean; isZh: boolean;
}) {
  const info = METRIC_INFO[metric];
  const pct = ((value - info.min) / (info.max - info.min)) * 100;
  const isHigh = metric !== 'alertCount' ? value >= 90 : value >= 20;

  return (
    <div className={`p-4 rounded-xl transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color: info.color }}>{info.icon}</span>
          <span className="text-gray-300 text-[13px]">{isZh ? info.zh : info.en}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={e => {
              const v = Math.max(info.min, Math.min(info.max, Number(e.target.value) || info.min));
              onChange(v);
            }}
            className="w-16 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-center text-[13px] focus:outline-none focus:border-cyan-500/50"
            style={{ fontVariantNumeric: 'tabular-nums' }}
            min={info.min}
            max={info.max}
          />
          {info.unit && <span className="text-gray-500 text-[12px]">{info.unit}</span>}
        </div>
      </div>

      {/* Slider */}
      <div className="relative mt-3 mb-1">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: isHigh
                ? `linear-gradient(90deg, ${info.color}, #ef4444)`
                : `linear-gradient(90deg, ${info.color}60, ${info.color})`,
            }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <input
          type="range"
          min={info.min}
          max={info.max}
          step={info.step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-lg pointer-events-none"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: 'rgba(15,23,42,0.9)',
            borderColor: info.color,
            boxShadow: `0 0 8px ${info.color}40`,
          }}
          animate={{ left: `calc(${pct}% - 8px)` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
        <span>{info.min}{info.unit}</span>
        <span className="text-gray-500">{isZh ? info.descZh : info.descEn}</span>
        <span>{info.max}{info.unit}</span>
      </div>
    </div>
  );
}

/** EndpointThresholdCard — 端点阈值配置卡片 */
function EndpointThresholdCard({
  endpointKey, threshold, onChange, isZh, isGlobal
}: {
  endpointKey: 'max' | 'nas' | 'ecs';
  threshold: EndpointThreshold;
  onChange: (_key: MetricKey, _value: number) => void;
  isZh: boolean;
  isGlobal: boolean;
}) {
  const color = ENDPOINT_COLORS[endpointKey];
  const label = isZh ? ENDPOINT_LABELS[endpointKey].zh : ENDPOINT_LABELS[endpointKey].en;
  const metrics: MetricKey[] = ['cpu', 'memory', 'disk', 'alertCount'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%)',
        border: `1px solid ${color}25`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}60` }} />
            <span className="text-white text-[14px]">{label}</span>
          </div>
          {isGlobal && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400 border border-white/10">
              <Lock size={10} className="inline mr-1" />
              {isZh ? '全局同步' : 'Global Sync'}
            </span>
          )}
        </div>
      </div>

      {/* Sliders */}
      <div className="p-4 space-y-3">
        {metrics.map(metric => (
          <ThresholdSlider
            key={metric}
            metric={metric}
            value={threshold[metric]}
            onChange={v => onChange(metric, v)}
            disabled={isGlobal}
            isZh={isZh}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ===== Main Component =====
export function AlertThresholdConfig() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [config, setConfig] = useState<ThresholdConfig>({
    mode: 'independent',
    global: { ...DEFAULT_THRESHOLD },
    endpoints: {
      max: { cpu: 85, memory: 85, disk: 80, alertCount: 5 },
      nas: { cpu: 80, memory: 80, disk: 70, alertCount: 5 },
      ecs: { cpu: 80, memory: 80, disk: 75, alertCount: 3 },
    },
    notifications: { email: true, webhook: false, dashboard: true },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load config from API
  const { data: apiConfig } = useApi<ThresholdConfig>(
    'GET',
    '/monitor/thresholds',
    {},
    { immediate: true }
  );

  useEffect(() => {
    if (apiConfig) setConfig(apiConfig);
  }, [apiConfig]);

  const handleModeToggle = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      mode: prev.mode === 'global' ? 'independent' : 'global',
    }));
    setHasChanges(true);
  }, []);

  const handleGlobalChange = useCallback((metric: MetricKey, value: number) => {
    setConfig(prev => ({
      ...prev,
      global: { ...prev.global, [metric]: value },
      endpoints: {
        max: { ...prev.endpoints.max, [metric]: value },
        nas: { ...prev.endpoints.nas, [metric]: value },
        ecs: { ...prev.endpoints.ecs, [metric]: value },
      },
    }));
    setHasChanges(true);
  }, []);

  const handleEndpointChange = useCallback((endpoint: 'max' | 'nas' | 'ecs', metric: MetricKey, value: number) => {
    setConfig(prev => ({
      ...prev,
      endpoints: {
        ...prev.endpoints,
        [endpoint]: { ...prev.endpoints[endpoint], [metric]: value },
      },
    }));
    setHasChanges(true);
  }, []);

  const handleNotificationToggle = useCallback((key: keyof ThresholdConfig['notifications']) => {
    setConfig(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    // Simulate API save
    await new Promise(r => setTimeout(r, 1000));
    setConfig(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
    setSaving(false);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleReset = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      mode: 'independent',
      global: { ...DEFAULT_THRESHOLD },
      endpoints: {
        max: { cpu: 85, memory: 85, disk: 80, alertCount: 5 },
        nas: { cpu: 80, memory: 80, disk: 70, alertCount: 5 },
        ecs: { cpu: 80, memory: 80, disk: 75, alertCount: 3 },
      },
    }));
    setHasChanges(true);
  }, []);

  const endpointKeys = ['max', 'nas', 'ecs'] as const;
  const isGlobalMode = config.mode === 'global';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <FuturisticPanel
        title={isZh ? '告警阈值配置' : 'Alert Threshold Config'}
        subtitle={isZh ? '自定义每端点独立的 CPU/内存/磁盘告警阈值' : 'Customize per-endpoint CPU/Memory/Disk alert thresholds'}
        icon={<Sliders size={16} className="text-white" />}
        glowEffect
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleModeToggle}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all border"
              style={{
                background: isGlobalMode ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.05)',
                borderColor: isGlobalMode ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.1)',
                color: isGlobalMode ? '#22d3ee' : '#9ca3af',
              }}
            >
              {isGlobalMode ? <Globe size={14} /> : <Unlock size={14} />}
              {isGlobalMode
                ? (isZh ? '全局模式 (统一阈值)' : 'Global Mode (Unified)')
                : (isZh ? '独立模式 (分端点)' : 'Independent Mode (Per-endpoint)')
              }
            </button>

            <div className="text-gray-500 text-[12px] flex items-center gap-1">
              <Info size={11} />
              {isGlobalMode
                ? (isZh ? '所有端点使用相同阈值' : 'All endpoints share same thresholds')
                : (isZh ? '每个端点可独立配置' : 'Each endpoint has its own thresholds')
              }
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <RotateCcw size={13} />
              {isZh ? '重置默认' : 'Reset'}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] transition-all border disabled:opacity-40 ${
                saved
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : hasChanges
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              {saving ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : saved ? (
                <CheckCircle size={13} />
              ) : (
                <Save size={13} />
              )}
              {saving ? (isZh ? '保存中...' : 'Saving...') : saved ? (isZh ? '已保存' : 'Saved!') : (isZh ? '保存配置' : 'Save Config')}
            </button>
          </div>
        </div>
      </FuturisticPanel>

      {/* Global thresholds (shown when in global mode) */}
      <AnimatePresence>
        {isGlobalMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FuturisticPanel
              title={isZh ? '全局阈值设置' : 'Global Threshold Settings'}
              subtitle={isZh ? '此配置将同步应用到所有端点' : 'These settings apply to all endpoints'}
              icon={<Globe size={16} className="text-white" />}
              variant="primary"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['cpu', 'memory', 'disk', 'alertCount'] as MetricKey[]).map(metric => (
                  <ThresholdSlider
                    key={metric}
                    metric={metric}
                    value={config.global[metric]}
                    onChange={v => handleGlobalChange(metric, v)}
                    isZh={isZh}
                  />
                ))}
              </div>
            </FuturisticPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-endpoint configuration */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {endpointKeys.map(ep => (
          <EndpointThresholdCard
            key={ep}
            endpointKey={ep}
            threshold={isGlobalMode ? config.global : config.endpoints[ep]}
            onChange={(metric, value) => {
              if (isGlobalMode) {
                handleGlobalChange(metric, value);
              } else {
                handleEndpointChange(ep, metric, value);
              }
            }}
            isZh={isZh}
            isGlobal={isGlobalMode}
          />
        ))}
      </div>

      {/* Notification settings */}
      <FuturisticPanel
        title={isZh ? '通知设置' : 'Notification Settings'}
        subtitle={isZh ? '配置告警触发后的通知方式' : 'Configure notification channels when alerts trigger'}
        icon={<Bell size={16} className="text-white" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'email' as const, zh: '邮件通知', en: 'Email Notification', descZh: '发送告警邮件到管理员', descEn: 'Send alert email to admins', icon: <AlertTriangle size={16} /> },
            { key: 'webhook' as const, zh: 'Webhook 推送', en: 'Webhook Push', descZh: '推送到第三方服务 (钉钉/飞书)', descEn: 'Push to third-party services', icon: <Zap size={16} /> },
            { key: 'dashboard' as const, zh: '看板弹窗', en: 'Dashboard Popup', descZh: '在仪表盘显示告警弹窗', descEn: 'Show alert popup on dashboard', icon: <Shield size={16} /> },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => handleNotificationToggle(item.key)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: config.notifications[item.key]
                  ? 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(30,41,59,0.4) 100%)'
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${config.notifications[item.key] ? 'rgba(34,211,238,0.2)' : 'rgba(148,163,184,0.08)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={config.notifications[item.key] ? 'text-cyan-400' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span className={`text-[13px] ${config.notifications[item.key] ? 'text-white' : 'text-gray-400'}`}>
                    {isZh ? item.zh : item.en}
                  </span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${
                  config.notifications[item.key] ? 'bg-cyan-500/30' : 'bg-white/10'
                }`}>
                  <motion.div
                    className={`w-4 h-4 rounded-full ${config.notifications[item.key] ? 'bg-cyan-400' : 'bg-gray-500'}`}
                    animate={{ x: config.notifications[item.key] ? 18 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
              <p className="text-gray-500 text-[11px]">
                {isZh ? item.descZh : item.descEn}
              </p>
            </button>
          ))}
        </div>
      </FuturisticPanel>

      {/* Last updated info */}
      <div className="flex items-center justify-center gap-2 text-gray-600 text-[11px]">
        <Info size={11} />
        <span>
          {isZh ? '最后更新' : 'Last updated'}: {new Date(config.updatedAt).toLocaleString()}
          {' · '}
          {isZh ? '操作人' : 'By'}: {config.updatedBy}
        </span>
      </div>
    </div>
  );
}
