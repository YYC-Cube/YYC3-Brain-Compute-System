import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu, MemoryStick,
  RefreshCw, Server,
  Wifi
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Chart Wrapper: solves the Recharts width(-1)/height(-1) problem =====
// Instead of ResponsiveContainer, we use a ref-based approach with explicit dimensions
function ChartContainer({ children, height = 220 }: { children: (width: number, height: number) => React.ReactNode; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 400, height });

  const measure = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        setDims({ width: Math.floor(rect.width), height });
      }
    }
  }, [height]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => {
      measure();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={containerRef} style={{ width: '100%', height, minHeight: height, position: 'relative' }}>
      {dims.width > 10 && children(dims.width, dims.height)}
    </div>
  );
}

// ===== Generate time series mock data =====
function generateTimeSeriesData(points: number = 30) {
  const data = [];
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 10000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu: Math.floor(50 + Math.random() * 40 + Math.sin(i / 5) * 15),
      memory: Math.floor(55 + Math.random() * 20 + Math.cos(i / 4) * 10),
      disk: Math.floor(35 + Math.random() * 10 + i * 0.1),
      networkIn: Math.floor(200 + Math.random() * 300),
      networkOut: Math.floor(100 + Math.random() * 200),
    });
  }
  return data;
}

function generateEndpointData() {
  return [
    { name: 'Max端', cpu: 72, memory: 58, disk: 41, devices: 5 },
    { name: 'NAS端', cpu: 45, memory: 62, disk: 73, devices: 4 },
    { name: 'ECS端', cpu: 25, memory: 56, disk: 51, devices: 3 },
  ];
}

// ===== Alert data =====
const MOCK_ALERTS = [
  { id: 'ALT-001', level: 'critical', message: 'NAS-Tensor-Inference CPU使用率 95%', device: 'NAS-Tensor-Inference', time: '2分钟前', messageEn: 'NAS-Tensor-Inference CPU at 95%', timeEn: '2min ago' },
  { id: 'ALT-002', level: 'warning', message: 'yyc3_prod 连接数接近上限 (450/500)', device: 'yyc3_prod', time: '8分钟前', messageEn: 'yyc3_prod connections near limit (450/500)', timeEn: '8min ago' },
  { id: 'ALT-003', level: 'warning', message: 'NAS-Server-Core 磁盘使用率 73%', device: 'NAS-Server-Core', time: '15分钟前', messageEn: 'NAS-Server-Core disk at 73%', timeEn: '15min ago' },
  { id: 'ALT-004', level: 'info', message: 'Max-Redis-Master 自动故障切换已就绪', device: 'Max-Redis-Master', time: '30分钟前', messageEn: 'Max-Redis-Master failover ready', timeEn: '30min ago' },
  { id: 'ALT-005', level: 'info', message: 'yyc3-125-ECS SSL证书将在30天后过期', device: 'yyc3-125-ECS', time: '1小时前', messageEn: 'yyc3-125-ECS SSL cert expires in 30 days', timeEn: '1h ago' },
];

export function MonitorDashboard() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [endpointData] = useState(generateEndpointData());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSeriesData(prev => {
        const now = new Date();
        const newPoint = {
          time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: Math.floor(50 + Math.random() * 40 + Math.sin(Date.now() / 5000) * 15),
          memory: Math.floor(55 + Math.random() * 20),
          disk: Math.floor(35 + Math.random() * 10),
          networkIn: Math.floor(200 + Math.random() * 300),
          networkOut: Math.floor(100 + Math.random() * 200),
        };
        return [...prev.slice(1), newPoint];
      });
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const latestData = timeSeriesData[timeSeriesData.length - 1];

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Activity className="w-6 h-6" />
            {isZh ? '数据监控' : 'Monitor Dashboard'}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-green-900/30 text-green-300 border border-green-500/30 animate-pulse">
              LIVE
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '实时性能监控与告警管理' : 'Real-time performance monitoring & alerts'}
            <span className="text-gray-600 ml-2 font-mono text-xs" style={{ fontSize: '0.7rem' }}>
              {isZh ? '最后更新: ' : 'Last: '}{lastUpdate.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm" style={{ fontSize: '0.875rem' }}>
            <RefreshCw className="w-4 h-4" /> {isZh ? '刷新' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 shrink-0">
        {[
          { key: 'overview', label: isZh ? '总览' : 'Overview' },
          { key: 'server', label: isZh ? '服务器' : 'Servers' },
          { key: 'database', label: isZh ? '数据库' : 'Databases' },
          { key: 'alerts', label: isZh ? '告警' : 'Alerts' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs transition-all ${activeTab === tab.key
                ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            style={{ fontSize: '0.75rem' }}
          >
            {tab.label}
            {tab.key === 'alerts' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] border border-red-500/30">
                {MOCK_ALERTS.filter(a => a.level === 'critical' || a.level === 'warning').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 min-h-0 overflow-auto space-y-5">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard
            icon={<Server className="w-4 h-4" />}
            label={isZh ? '运行设备' : 'Active Devices'}
            value="10/12"
            subtext={isZh ? '2台异常/维护' : '2 error/maintenance'}
            color="green"
          />
          <StatusCard
            icon={<Cpu className="w-4 h-4" />}
            label={isZh ? '平均CPU' : 'Avg CPU'}
            value={`${latestData?.cpu || 0}%`}
            subtext={latestData?.cpu > 70 ? (isZh ? '负载偏高' : 'High load') : (isZh ? '负载正常' : 'Normal')}
            color={latestData?.cpu > 80 ? 'red' : latestData?.cpu > 60 ? 'yellow' : 'green'}
          />
          <StatusCard
            icon={<MemoryStick className="w-4 h-4" />}
            label={isZh ? '平均内存' : 'Avg Memory'}
            value={`${latestData?.memory || 0}%`}
            subtext={`${Math.round((latestData?.memory || 0) * 3.36)} / 336 GB`}
            color={latestData?.memory > 80 ? 'red' : 'cyan'}
          />
          <StatusCard
            icon={<Wifi className="w-4 h-4" />}
            label={isZh ? '网络流量' : 'Network'}
            value={`↑${((latestData?.networkOut || 0) / 1000).toFixed(1)}G`}
            subtext={`↓${((latestData?.networkIn || 0) / 1000).toFixed(1)}G`}
            color="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CPU & Memory Trend */}
          <FuturisticPanel title={isZh ? 'CPU / 内存趋势' : 'CPU / Memory Trend'} subtitle={isZh ? '近5分钟' : 'Last 5 min'}>
            <ChartContainer height={240}>
              {(w, h) => (
                <AreaChart width={w} height={h} data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 8, fontSize: 12, color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fill="url(#cpuGrad)" strokeWidth={2} name="CPU" dot={false} />
                  <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fill="url(#memGrad)" strokeWidth={2} name={isZh ? '内存' : 'Memory'} dot={false} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
                    iconType="line"
                  />
                </AreaChart>
              )}
            </ChartContainer>
          </FuturisticPanel>

          {/* Network Traffic */}
          <FuturisticPanel title={isZh ? '网络流量' : 'Network Traffic'} subtitle={isZh ? '入/出流量 (MB)' : 'In/Out (MB)'}>
            <ChartContainer height={240}>
              {(w, h) => (
                <AreaChart width={w} height={h} data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 12, color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="networkIn" stroke="#10b981" fill="url(#inGrad)" strokeWidth={2} name={isZh ? '入流量' : 'Inbound'} dot={false} />
                  <Area type="monotone" dataKey="networkOut" stroke="#f59e0b" fill="url(#outGrad)" strokeWidth={2} name={isZh ? '出流量' : 'Outbound'} dot={false} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} iconType="line" />
                </AreaChart>
              )}
            </ChartContainer>
          </FuturisticPanel>
        </div>

        {/* Endpoint Comparison + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Endpoint Comparison */}
          <FuturisticPanel title={isZh ? '端点资源对比' : 'Endpoint Resources'} className="lg:col-span-1">
            <ChartContainer height={240}>
              {(w, h) => (
                <BarChart width={w} height={h} data={endpointData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 8, fontSize: 12, color: '#e5e7eb' }}
                  />
                  <Bar dataKey="cpu" fill="#06b6d4" radius={[4, 4, 0, 0]} name="CPU" />
                  <Bar dataKey="memory" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={isZh ? '内存' : 'Memory'} />
                  <Bar dataKey="disk" fill="#f59e0b" radius={[4, 4, 0, 0]} name={isZh ? '磁盘' : 'Disk'} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                </BarChart>
              )}
            </ChartContainer>
          </FuturisticPanel>

          {/* Alerts Panel */}
          <FuturisticPanel
            title={isZh ? '告警列表' : 'Alerts'}
            subtitle={isZh ? '实时更新' : 'Real-time'}
            className="lg:col-span-2"
          >
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {MOCK_ALERTS.map((alert, idx) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${alert.level === 'critical'
                      ? 'bg-red-900/10 border-red-500/30 hover:bg-red-900/20'
                      : alert.level === 'warning'
                        ? 'bg-yellow-900/10 border-yellow-500/30 hover:bg-yellow-900/20'
                        : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                    }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {alert.level === 'critical' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : alert.level === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 truncate" style={{ fontSize: '0.8rem' }}>
                      {isZh ? alert.message : alert.messageEn}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2" style={{ fontSize: '0.7rem' }}>
                      <span className="font-mono">{alert.device}</span>
                      <span>·</span>
                      <span>{isZh ? alert.time : alert.timeEn}</span>
                    </div>
                  </div>
                  <button className="text-xs text-gray-500 hover:text-cyan-400 transition-colors px-2 py-1 rounded border border-transparent hover:border-cyan-500/30 shrink-0" style={{ fontSize: '0.7rem' }}>
                    {isZh ? '处理' : 'Handle'}
                  </button>
                </motion.div>
              ))}
            </div>
          </FuturisticPanel>
        </div>

        {/* Disk Usage Overview */}
        <FuturisticPanel title={isZh ? '磁盘使用率趋势' : 'Disk Usage Trend'} subtitle={isZh ? '全端点磁盘使用情况' : 'All endpoints disk usage'}>
          <ChartContainer height={200}>
            {(w, h) => (
              <LineChart width={w} height={h} data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, fontSize: 12, color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                />
                <Line type="monotone" dataKey="disk" stroke="#f59e0b" strokeWidth={2} name={isZh ? '磁盘使用率' : 'Disk Usage'} dot={false} />
              </LineChart>
            )}
          </ChartContainer>
        </FuturisticPanel>
      </div>
    </div>
  );
}

// ===== Status Card =====
function StatusCard({ icon, label, value, subtext, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  const colorMap: Record<string, { text: string; dot: string; border: string }> = {
    green: { text: 'text-green-400', dot: 'bg-green-500', border: 'border-green-500/20' },
    red: { text: 'text-red-400', dot: 'bg-red-500', border: 'border-red-500/20' },
    yellow: { text: 'text-yellow-400', dot: 'bg-yellow-500', border: 'border-yellow-500/20' },
    cyan: { text: 'text-cyan-400', dot: 'bg-cyan-500', border: 'border-cyan-500/20' },
    blue: { text: 'text-blue-400', dot: 'bg-blue-500', border: 'border-blue-500/20' },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:${c.border} transition-colors`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={c.text}>{icon}</div>
        <span className="text-xs text-gray-400 font-mono uppercase" style={{ fontSize: '0.7rem' }}>{label}</span>
      </div>
      <div className={`text-xl font-bold ${c.text}`} style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5" style={{ fontSize: '0.625rem' }}>{subtext}</div>
    </div>
  );
}
