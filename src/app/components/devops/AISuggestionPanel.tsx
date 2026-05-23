import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Lightbulb,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis, Radar,
  RadarChart,
  Tooltip as RechartsTooltip,
  XAxis, YAxis
} from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Types =====
interface AnomalyPattern {
  id: string;
  device: string;
  metric: string;
  metricEn: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  descriptionEn: string;
  detectedAt: string;
  occurrences: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
}

interface Suggestion {
  id: string;
  patternId: string;
  action: string;
  actionEn: string;
  description: string;
  descriptionEn: string;
  impact: 'high' | 'medium' | 'low';
  risk: 'low' | 'medium' | 'high';
  estimatedTime: string;
  estimatedTimeEn: string;
  status: 'pending' | 'applied' | 'dismissed' | 'scheduled';
  confidence: number;
}

interface HealthScore {
  category: string;
  categoryEn: string;
  score: number;
  fullMark: 100;
}

// ===== Mock Data =====
const ANOMALY_PATTERNS: AnomalyPattern[] = [
  {
    id: 'AP-001', device: 'GPU-A100-03', metric: '推理延迟', metricEn: 'Inference Latency',
    severity: 'critical',
    description: '过去1小时内连续3次延迟 > 2000ms，模式周期性出现',
    descriptionEn: '3 consecutive latency spikes > 2000ms in past hour, periodic pattern',
    detectedAt: '2026-03-02 14:23:45', occurrences: 7, trend: 'increasing', confidence: 94,
  },
  {
    id: 'AP-002', device: 'NAS-Storage-01', metric: '存储容量', metricEn: 'Storage Capacity',
    severity: 'warning',
    description: '存储使用率达85%，按当前增速预计3天内达到阈值',
    descriptionEn: 'Storage at 85%, projected to hit threshold in 3 days at current rate',
    detectedAt: '2026-03-02 13:15:00', occurrences: 1, trend: 'increasing', confidence: 88,
  },
  {
    id: 'AP-003', device: 'ECS-Node-05,06,07', metric: '网络延迟', metricEn: 'Network Latency',
    severity: 'warning',
    description: '3个ECS节点间网络延迟 > 100ms，可能存在网络瓶颈',
    descriptionEn: '3 ECS nodes with inter-node latency > 100ms, possible network bottleneck',
    detectedAt: '2026-03-02 14:00:12', occurrences: 5, trend: 'stable', confidence: 76,
  },
  {
    id: 'AP-004', device: 'Max-Server-01', metric: '内存使用', metricEn: 'Memory Usage',
    severity: 'info',
    description: '内存使用率波动较大(60%-85%)，建议优化内存分配策略',
    descriptionEn: 'Memory usage fluctuating (60%-85%), recommend optimizing allocation',
    detectedAt: '2026-03-02 12:30:00', occurrences: 12, trend: 'stable', confidence: 65,
  },
];

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'SG-001', patternId: 'AP-001',
    action: '迁移模型至GPU-A100-07', actionEn: 'Migrate model to GPU-A100-07',
    description: 'GPU-A100-07当前负载15%，迁移后预计延迟降至<500ms',
    descriptionEn: 'GPU-A100-07 at 15% load, migration should reduce latency to <500ms',
    impact: 'high', risk: 'low', estimatedTime: '约5分钟', estimatedTimeEn: '~5 min',
    status: 'pending', confidence: 92,
  },
  {
    id: 'SG-002', patternId: 'AP-001',
    action: '重启推理服务清理内存', actionEn: 'Restart inference service to clear memory',
    description: '推理服务运行72小时，内存碎片可能导致性能下降',
    descriptionEn: 'Service running 72h, memory fragmentation may cause degradation',
    impact: 'medium', risk: 'medium', estimatedTime: '约2分钟', estimatedTimeEn: '~2 min',
    status: 'pending', confidence: 85,
  },
  {
    id: 'SG-003', patternId: 'AP-001',
    action: '启用动态负载均衡', actionEn: 'Enable dynamic load balancing',
    description: '自动分配推理任务到低负载节点，减少单点过载',
    descriptionEn: 'Auto-distribute inference tasks to low-load nodes, reduce overload',
    impact: 'high', risk: 'low', estimatedTime: '即时生效', estimatedTimeEn: 'Instant',
    status: 'pending', confidence: 90,
  },
  {
    id: 'SG-004', patternId: 'AP-002',
    action: '启动存储清理任务', actionEn: 'Start storage cleanup task',
    description: '清理30天前的推理缓存和临时文件，预计释放120GB',
    descriptionEn: 'Clean inference cache and temp files older than 30d, ~120GB freed',
    impact: 'medium', risk: 'low', estimatedTime: '约10分钟', estimatedTimeEn: '~10 min',
    status: 'pending', confidence: 95,
  },
  {
    id: 'SG-005', patternId: 'AP-003',
    action: '检查交换机配置', actionEn: 'Check switch configuration',
    description: '建议检查核心交换机QoS策略，可能存在带宽分配不合理',
    descriptionEn: 'Check core switch QoS policy, bandwidth allocation may be suboptimal',
    impact: 'high', risk: 'low', estimatedTime: '约15分钟', estimatedTimeEn: '~15 min',
    status: 'pending', confidence: 72,
  },
];

const HEALTH_SCORES: HealthScore[] = [
  { category: '计算', categoryEn: 'Compute', score: 78, fullMark: 100 },
  { category: '存储', categoryEn: 'Storage', score: 65, fullMark: 100 },
  { category: '网络', categoryEn: 'Network', score: 72, fullMark: 100 },
  { category: '安全', categoryEn: 'Security', score: 92, fullMark: 100 },
  { category: '可用性', categoryEn: 'Availability', score: 96, fullMark: 100 },
  { category: '性能', categoryEn: 'Performance', score: 70, fullMark: 100 },
];

// Generate trend data
function generateTrendData() {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 3600000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      anomalies: Math.floor(Math.random() * 5) + (i < 6 ? 3 : 0),
      resolved: Math.floor(Math.random() * 3),
      score: Math.floor(75 + Math.random() * 20 - (i < 6 ? 10 : 0)),
    });
  }
  return data;
}

// ===== Component =====
export function AISuggestionPanel() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [patterns, _setPatterns] = useState(ANOMALY_PATTERNS);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [selectedPattern, setSelectedPattern] = useState<string | null>('AP-001');
  const [activeTab, setActiveTab] = useState<'patterns' | 'suggestions' | 'health'>('patterns');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trendData] = useState(generateTrendData);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  const filteredSuggestions = selectedPattern
    ? suggestions.filter(s => s.patternId === selectedPattern)
    : suggestions;

  const handleApplySuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s =>
      s.id === id ? { ...s, status: 'applied' as const } : s
    ));
  }, []);

  const handleDismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s =>
      s.id === id ? { ...s, status: 'dismissed' as const } : s
    ));
  }, []);

  const handleReanalyze = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2500);
  }, []);

  const severityConfig = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: isZh ? '严重' : 'Critical' },
    warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: isZh ? '警告' : 'Warning' },
    info: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', label: isZh ? '信息' : 'Info' },
  };

  const impactConfig = {
    high: { color: 'text-green-400', label: isZh ? '高影响' : 'High Impact' },
    medium: { color: 'text-yellow-400', label: isZh ? '中影响' : 'Medium' },
    low: { color: 'text-gray-400', label: isZh ? '低影响' : 'Low' },
  };

  const riskConfig = {
    low: { color: 'text-green-400', label: isZh ? '低风险' : 'Low Risk' },
    medium: { color: 'text-yellow-400', label: isZh ? '中风险' : 'Med Risk' },
    high: { color: 'text-red-400', label: isZh ? '高风险' : 'High Risk' },
  };

  const tabs = [
    { id: 'patterns' as const, label: isZh ? '异常模式' : 'Patterns', icon: <AlertTriangle size={14} /> },
    { id: 'suggestions' as const, label: isZh ? '操作建议' : 'Suggestions', icon: <Lightbulb size={14} /> },
    { id: 'health' as const, label: isZh ? '健康评估' : 'Health', icon: <Activity size={14} /> },
  ];

  const overallScore = Math.round(HEALTH_SCORES.reduce((sum, h) => sum + h.score, 0) / HEALTH_SCORES.length);

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pb-6" style={{ fontSize: '0.875rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center">
            <Brain size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-white flex items-center gap-2" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isZh ? 'AI 辅助决策' : 'AI Decision Support'}
              <Sparkles size={16} className="text-purple-400 animate-pulse" />
            </h2>
            <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>
              {isZh ? '基于历史数据和当前状态，AI 提供智能操作建议' : 'AI provides smart recommendations based on historical data and current state'}
            </p>
          </div>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50"
          style={{ fontSize: '0.8125rem', fontWeight: 500 }}
        >
          <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
          {isAnalyzing ? (isZh ? '分析中...' : 'Analyzing...') : (isZh ? '重新分析' : 'Re-analyze')}
        </button>
      </div>

      {/* Analyzing Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Brain size={20} className="text-purple-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-purple-300" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {isZh ? 'AI 正在分析系统状态...' : 'AI analyzing system state...'}
              </div>
              <div className="text-purple-400/60 mt-1" style={{ fontSize: '0.75rem' }}>
                {isZh ? '扫描异常模式 → 关联历史数据 → 生成操作建议' : 'Scanning patterns → Correlating history → Generating suggestions'}
              </div>
              <div className="mt-2 h-1 bg-purple-900/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isZh ? '检测异常' : 'Anomalies', value: patterns.length, icon: <AlertTriangle size={16} />, color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20' },
          { label: isZh ? '操作建议' : 'Suggestions', value: suggestions.filter(s => s.status === 'pending').length, icon: <Lightbulb size={16} />, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/20' },
          { label: isZh ? '已执行' : 'Applied', value: suggestions.filter(s => s.status === 'applied').length, icon: <CheckCircle size={16} />, color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20' },
          { label: isZh ? '健康评分' : 'Health Score', value: `${overallScore}%`, icon: <Activity size={16} />, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${stat.bg} border border-white/5`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
            <div className="text-gray-400 mt-0.5" style={{ fontSize: '0.75rem' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all ${activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-500 hover:text-gray-300'
              }`}
            style={{ fontSize: '0.8125rem', fontWeight: activeTab === tab.id ? 600 : 400 }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'patterns' && (
          <motion.div key="patterns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {/* Trend Chart */}
            <FuturisticPanel title={isZh ? '异常趋势 (24h)' : 'Anomaly Trend (24h)'} icon={<TrendingUp size={14} className="text-white" />}>
              <ChartContainer height={180}>
                {(w, h) => (
                  <AreaChart width={w} height={h} data={trendData}>
                    <defs>
                      <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area type="monotone" dataKey="anomalies" stroke="#ef4444" fill="url(#anomalyGrad)" strokeWidth={2} name={isZh ? '异常数' : 'Anomalies'} />
                    <Area type="monotone" dataKey="score" stroke="#a855f7" fill="url(#scoreGrad)" strokeWidth={2} name={isZh ? '健康分' : 'Health'} />
                  </AreaChart>
                )}
              </ChartContainer>
            </FuturisticPanel>

            {/* Pattern Cards */}
            <div className="space-y-3">
              {patterns.map((pattern, idx) => {
                const sev = severityConfig[pattern.severity];
                const isSelected = selectedPattern === pattern.id;
                return (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedPattern(isSelected ? null : pattern.id);
                      if (!isSelected) setActiveTab('suggestions');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                        ? `${sev.bg} ${sev.border} shadow-lg`
                        : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`mt-0.5 w-8 h-8 rounded-lg ${sev.bg} flex items-center justify-center shrink-0`}>
                          <AlertTriangle size={14} className={sev.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${sev.bg} ${sev.color}`} style={{ fontSize: '0.625rem', fontWeight: 600 }}>
                              {sev.label}
                            </span>
                            <span className="text-white" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                              {pattern.device}
                            </span>
                            <span className="text-gray-500" style={{ fontSize: '0.75rem' }}>
                              {isZh ? pattern.metric : pattern.metricEn}
                            </span>
                          </div>
                          <p className="text-gray-400 mt-1 truncate" style={{ fontSize: '0.75rem' }}>
                            {isZh ? pattern.description : pattern.descriptionEn}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-gray-500" style={{ fontSize: '0.6875rem' }}>
                            <span className="flex items-center gap-1"><Clock size={10} /> {pattern.detectedAt}</span>
                            <span>{isZh ? `出现${pattern.occurrences}次` : `${pattern.occurrences} times`}</span>
                            <span className={`flex items-center gap-1 ${pattern.trend === 'increasing' ? 'text-red-400' : pattern.trend === 'decreasing' ? 'text-green-400' : 'text-gray-400'}`}>
                              <TrendingUp size={10} />
                              {pattern.trend === 'increasing' ? (isZh ? '上升' : 'Rising') : pattern.trend === 'decreasing' ? (isZh ? '下降' : 'Falling') : (isZh ? '稳定' : 'Stable')}
                            </span>
                            <span className="text-purple-400">{isZh ? `置信度${pattern.confidence}%` : `${pattern.confidence}% conf.`}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`text-gray-600 transition-transform ${isSelected ? 'rotate-90 text-purple-400' : ''}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {selectedPattern && (
              <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between" style={{ fontSize: '0.75rem' }}>
                <span className="text-purple-300">
                  {isZh ? '筛选:' : 'Filter:'} {patterns.find(p => p.id === selectedPattern)?.device}
                </span>
                <button onClick={() => setSelectedPattern(null)} className="text-purple-400 hover:text-purple-300" style={{ fontSize: '0.6875rem' }}>
                  {isZh ? '查看全部' : 'Show All'}
                </button>
              </div>
            )}
            {filteredSuggestions.map((suggestion, idx) => {
              const imp = impactConfig[suggestion.impact];
              const rsk = riskConfig[suggestion.risk];
              const isExpanded = expandedSuggestion === suggestion.id;
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl border transition-all overflow-hidden ${suggestion.status === 'applied'
                      ? 'bg-green-900/10 border-green-500/20 opacity-70'
                      : suggestion.status === 'dismissed'
                        ? 'bg-gray-900/20 border-gray-800 opacity-50'
                        : 'bg-gray-900/40 border-gray-800 hover:border-purple-500/30'
                    }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                          <Lightbulb size={14} className="text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                              {isZh ? suggestion.action : suggestion.actionEn}
                            </span>
                            {suggestion.status === 'applied' && (
                              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400" style={{ fontSize: '0.625rem', fontWeight: 600 }}>
                                {isZh ? '已执行' : 'Applied'}
                              </span>
                            )}
                            {suggestion.status === 'dismissed' && (
                              <span className="px-2 py-0.5 rounded bg-gray-500/20 text-gray-400" style={{ fontSize: '0.625rem', fontWeight: 600 }}>
                                {isZh ? '已忽略' : 'Dismissed'}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 mt-1" style={{ fontSize: '0.75rem' }}>
                            {isZh ? suggestion.description : suggestion.descriptionEn}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap" style={{ fontSize: '0.6875rem' }}>
                            <span className={imp.color}>{imp.label}</span>
                            <span className={rsk.color}>{rsk.label}</span>
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock size={10} /> {isZh ? suggestion.estimatedTime : suggestion.estimatedTimeEn}
                            </span>
                            <span className="text-purple-400">{isZh ? `置信度${suggestion.confidence}%` : `${suggestion.confidence}% conf.`}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                        className="text-gray-600 hover:text-gray-400"
                      >
                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    {suggestion.status === 'pending' && (
                      <div className="flex items-center gap-2 mt-3 ml-11">
                        <button
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                          style={{ fontSize: '0.75rem', fontWeight: 500 }}
                        >
                          <Play size={12} /> {isZh ? '应用建议' : 'Apply'}
                        </button>
                        <button
                          onClick={() => handleDismissSuggestion(suggestion.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-300 transition-all"
                          style={{ fontSize: '0.75rem', fontWeight: 500 }}
                        >
                          <XCircle size={12} /> {isZh ? '忽略' : 'Dismiss'}
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-all" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          <Eye size={12} /> {isZh ? '详情' : 'Details'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-800 overflow-hidden"
                      >
                        <div className="p-4 bg-gray-900/30 space-y-2" style={{ fontSize: '0.75rem' }}>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Target size={12} className="text-purple-400" />
                            <span className="text-gray-500">{isZh ? '关联异常:' : 'Related:'}</span>
                            {patterns.find(p => p.id === suggestion.patternId)?.device} — {isZh ? patterns.find(p => p.id === suggestion.patternId)?.metric : patterns.find(p => p.id === suggestion.patternId)?.metricEn}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <BarChart3 size={12} className="text-cyan-400" />
                            <span className="text-gray-500">{isZh ? '预期效果:' : 'Expected:'}</span>
                            {isZh ? '异常率预计降低60%' : 'Anomaly rate expected to drop 60%'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Shield size={12} className="text-green-400" />
                            <span className="text-gray-500">{isZh ? '回滚方案:' : 'Rollback:'}</span>
                            {isZh ? '支持一键回滚至操作前状态' : 'One-click rollback to pre-operation state'}
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

        {activeTab === 'health' && (
          <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {/* Overall Score */}
            <div className="flex items-center justify-center py-6">
              <div className="relative">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="8" />
                  <circle
                    cx="80" cy="80" r="70" fill="none" stroke="url(#healthGrad)" strokeWidth="8"
                    strokeDasharray={`${overallScore * 4.4} ${440 - overallScore * 4.4}`}
                    strokeDashoffset="110" strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white" style={{ fontSize: '2rem', fontWeight: 700 }}>{overallScore}</span>
                  <span className="text-gray-400" style={{ fontSize: '0.75rem' }}>{isZh ? '综合评分' : 'Overall'}</span>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <FuturisticPanel title={isZh ? '多维健康评估' : 'Multi-Dimensional Health'} icon={<Activity size={14} className="text-white" />} variant="secondary">
              <ChartContainer height={260}>
                {(w, h) => (
                  <RadarChart cx={w / 2} cy={h / 2} outerRadius={Math.min(w, h) / 2 - 30} width={w} height={h} data={HEALTH_SCORES.map(s => ({ ...s, subject: isZh ? s.category : s.categoryEn }))}>
                    <PolarGrid stroke="rgba(139,92,246,0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar name={isZh ? '评分' : 'Score'} dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                )}
              </ChartContainer>
            </FuturisticPanel>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HEALTH_SCORES.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-xl bg-gray-900/40 border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400" style={{ fontSize: '0.75rem' }}>{isZh ? item.category : item.categoryEn}</span>
                    <span className={`${item.score >= 80 ? 'text-green-400' : item.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`} style={{ fontSize: '1.125rem', fontWeight: 700 }}>{item.score}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${item.score >= 80 ? 'bg-green-500' : item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
