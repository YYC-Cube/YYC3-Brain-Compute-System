import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronLeft, ChevronRight,
  Database,
  Download,
  Edit3,
  Eye,
  HardDrive,
  Monitor,
  Plus,
  RefreshCw,
  Save,
  Search,
  Server,
  Tag,
  Wrench,
  X,
  XCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { FuturisticPanel } from '../FuturisticPanel';

import { useLanguage } from '../LanguageContext';

// ===== Mock Data =====
interface Device {
  id: string;
  name: string;
  type: 'server' | 'instance' | 'database';
  endpoint: 'max' | 'nas' | 'ecs';
  ip: string;
  port: number;
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  os: string;
  cpu: number;
  memory: number;
  disk: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  description: string;
}

const MOCK_DEVICES: Device[] = [
  {
    id: 'DEV-001', name: 'Max-Server-Primary', type: 'server', endpoint: 'max',
    ip: '192.168.1.100', port: 22, status: 'running', os: 'Ubuntu 24.04 LTS',
    cpu: 16, memory: 64, disk: 2048, cpuUsage: 72, memoryUsage: 58, diskUsage: 41,
    location: '本地机房-A区', createdAt: '2025-06-15', updatedAt: '2026-02-22',
    createdBy: 'admin', tags: ['生产', '核心', 'Max端'], description: 'Max端主服务器，承载PG15数据库与Redis主从'
  },
  {
    id: 'DEV-002', name: 'NAS-Server-Core', type: 'server', endpoint: 'nas',
    ip: '192.168.1.200', port: 22, status: 'running', os: 'Debian 12',
    cpu: 32, memory: 128, disk: 8192, cpuUsage: 45, memoryUsage: 62, diskUsage: 73,
    location: '本地机房-B区', createdAt: '2025-08-20', updatedAt: '2026-02-21',
    createdBy: 'admin', tags: ['生产', '存储', 'NAS端'], description: 'NAS存储与AI推理服务器'
  },
  {
    id: 'DEV-003', name: 'yyc3-125-ECS', type: 'server', endpoint: 'ecs',
    ip: '47.xxx.xxx.125', port: 22, status: 'running', os: 'Ubuntu 24.04 LTS',
    cpu: 4, memory: 8, disk: 100, cpuUsage: 35, memoryUsage: 68, diskUsage: 52,
    location: '阿里云-华北2', createdAt: '2025-09-10', updatedAt: '2026-02-22',
    createdBy: 'admin', tags: ['生产', 'ECS端', 'API网关'], description: 'ECS云服务器-125，API网关及前端部署'
  },
  {
    id: 'DEV-004', name: 'yyc3-202-ECS', type: 'server', endpoint: 'ecs',
    ip: '47.xxx.xxx.202', port: 22, status: 'maintenance', os: 'Ubuntu 24.04 LTS',
    cpu: 2, memory: 4, disk: 50, cpuUsage: 12, memoryUsage: 45, diskUsage: 38,
    location: '阿里云-华北2', createdAt: '2025-11-05', updatedAt: '2026-02-22',
    createdBy: 'admin', tags: ['测试', 'ECS端'], description: 'ECS云服务器-202，测试环境'
  },
  {
    id: 'DEV-005', name: 'yyc3-33-ECS', type: 'server', endpoint: 'ecs',
    ip: '8.xxx.xxx.33', port: 22, status: 'running', os: 'Ubuntu 24.04 LTS',
    cpu: 2, memory: 4, disk: 40, cpuUsage: 28, memoryUsage: 55, diskUsage: 62,
    location: '阿里云-华东1', createdAt: '2025-12-01', updatedAt: '2026-02-20',
    createdBy: 'admin', tags: ['生产', 'ECS端', '监控'], description: 'ECS云服务器-33，监控与日志收集'
  },
  {
    id: 'DEV-006', name: 'yyc3_prod', type: 'database', endpoint: 'max',
    ip: '192.168.1.100', port: 5432, status: 'running', os: 'PostgreSQL 15',
    cpu: 0, memory: 16, disk: 512, cpuUsage: 55, memoryUsage: 72, diskUsage: 48,
    location: 'Max端-本地', createdAt: '2025-06-20', updatedAt: '2026-02-22',
    createdBy: 'admin', tags: ['生产', '数据库', 'PG15'], description: '生产环境主数据库'
  },
  {
    id: 'DEV-007', name: 'yyc3_test', type: 'database', endpoint: 'max',
    ip: '192.168.1.100', port: 5433, status: 'running', os: 'PostgreSQL 15',
    cpu: 0, memory: 8, disk: 256, cpuUsage: 20, memoryUsage: 35, diskUsage: 22,
    location: 'Max端-本地', createdAt: '2025-07-01', updatedAt: '2026-02-18',
    createdBy: 'admin', tags: ['测试', '数据库', 'PG15'], description: '测试环境数据库'
  },
  {
    id: 'DEV-008', name: 'yyc3_archive', type: 'database', endpoint: 'nas',
    ip: '192.168.1.200', port: 5432, status: 'running', os: 'PostgreSQL 14',
    cpu: 0, memory: 8, disk: 1024, cpuUsage: 10, memoryUsage: 28, diskUsage: 65,
    location: 'NAS端-本地', createdAt: '2025-08-25', updatedAt: '2026-02-15',
    createdBy: 'admin', tags: ['归档', '数据库', 'PG14'], description: 'NAS端归档数据库'
  },
  {
    id: 'DEV-009', name: 'Max-Redis-Master', type: 'instance', endpoint: 'max',
    ip: '192.168.1.100', port: 6379, status: 'running', os: 'Redis 7.2',
    cpu: 0, memory: 32, disk: 64, cpuUsage: 15, memoryUsage: 42, diskUsage: 30,
    location: 'Max端-本地', createdAt: '2025-06-22', updatedAt: '2026-02-22',
    createdBy: 'admin', tags: ['生产', '缓存', 'Redis主'], description: 'Redis主节点-缓存与会话管理'
  },
  {
    id: 'DEV-010', name: 'Max-Redis-Slave', type: 'instance', endpoint: 'max',
    ip: '192.168.1.101', port: 6379, status: 'running', os: 'Redis 7.2',
    cpu: 0, memory: 16, disk: 64, cpuUsage: 8, memoryUsage: 38, diskUsage: 28,
    location: 'Max端-本地', createdAt: '2025-06-22', updatedAt: '2026-02-22',
    createdBy: 'admin', tags: ['生产', '缓存', 'Redis从'], description: 'Redis从节点-读写分离'
  },
  {
    id: 'DEV-011', name: 'NAS-Redis-Cache', type: 'instance', endpoint: 'nas',
    ip: '192.168.1.200', port: 6379, status: 'running', os: 'Redis 7.2',
    cpu: 0, memory: 8, disk: 32, cpuUsage: 5, memoryUsage: 25, diskUsage: 15,
    location: 'NAS端-本地', createdAt: '2025-09-01', updatedAt: '2026-02-20',
    createdBy: 'admin', tags: ['生产', '缓存', 'NAS'], description: 'NAS端Redis缓存节点'
  },
  {
    id: 'DEV-012', name: 'NAS-Tensor-Inference', type: 'instance', endpoint: 'nas',
    ip: '192.168.1.200', port: 8080, status: 'error', os: 'Python 3.11 / CUDA 12',
    cpu: 0, memory: 64, disk: 256, cpuUsage: 95, memoryUsage: 92, diskUsage: 78,
    location: 'NAS端-本地', createdAt: '2025-10-15', updatedAt: '2026-02-22',
    createdBy: 'admin', tags: ['AI推理', 'Tensor', '告警'], description: 'Tensor推理服务-资源过载'
  },
];

const statusMap = {
  running: { label: '运行中', labelEn: 'Running', color: 'text-green-400', bg: 'bg-green-500', icon: CheckCircle },
  stopped: { label: '已停止', labelEn: 'Stopped', color: 'text-gray-400', bg: 'bg-gray-500', icon: XCircle },
  error: { label: '异常', labelEn: 'Error', color: 'text-red-400', bg: 'bg-red-500', icon: AlertTriangle },
  maintenance: { label: '维护中', labelEn: 'Maintenance', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: Wrench },
};

const typeMap = {
  server: { label: '服务器', labelEn: 'Server', icon: Server },
  instance: { label: '实例', labelEn: 'Instance', icon: Monitor },
  database: { label: '数据库', labelEn: 'Database', icon: Database },
};

const endpointMap = {
  max: { label: 'Max端', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-900/20' },
  nas: { label: 'NAS端', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-900/20' },
  ecs: { label: 'ECS端', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-900/20' },
};

export function DeviceManagement() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEndpoint, setFilterEndpoint] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [viewDevice, setViewDevice] = useState<Device | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const pageSize = 10;

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return MOCK_DEVICES.filter(d => {
      const matchSearch = !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.ip.includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEndpoint = filterEndpoint === 'all' || d.endpoint === filterEndpoint;
      const matchType = filterType === 'all' || d.type === filterType;
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchSearch && matchEndpoint && matchType && matchStatus;
    });
  }, [searchTerm, filterEndpoint, filterType, filterStatus]);

  const totalPages = Math.ceil(filteredDevices.length / pageSize);
  const pagedDevices = filteredDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => ({
    total: MOCK_DEVICES.length,
    running: MOCK_DEVICES.filter(d => d.status === 'running').length,
    error: MOCK_DEVICES.filter(d => d.status === 'error').length,
    maintenance: MOCK_DEVICES.filter(d => d.status === 'maintenance').length,
  }), []);

  const toggleSelect = (id: string) => {
    setSelectedDevices(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selectedDevices.length === pagedDevices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(pagedDevices.map(d => d.id));
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-400';
    if (usage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };
  const getUsageBarColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // ===== Detail View =====
  if (viewDevice) {
    return (
      <DeviceDetailView
        device={viewDevice}
        onBack={() => setViewDevice(null)}
        isZh={isZh}
        editingField={editingField}
        setEditingField={setEditingField}
        editValue={editValue}
        setEditValue={setEditValue}
        getUsageColor={getUsageColor}
        getUsageBarColor={getUsageBarColor}
      />
    );
  }

  // ===== List View =====
  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Server className="w-6 h-6" />
            {isZh ? '设备管理' : 'Device Management'}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-300 border border-cyan-500/30">
              {stats.total} {isZh ? '台' : 'DEVICES'}
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>{isZh ? '管理所有服务器、实例与数据库设备' : 'Manage all servers, instances and database devices'}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm" style={{ fontSize: '0.875rem' }}>
            <RefreshCw className="w-4 h-4" /> {isZh ? '刷新' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600/80 border border-cyan-500/50 text-white hover:bg-cyan-500 transition-colors text-sm" style={{ fontSize: '0.875rem' }}>
            <Plus className="w-4 h-4" /> {isZh ? '新增设备' : 'Add Device'}
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: isZh ? '全部设备' : 'All Devices', value: stats.total, color: 'cyan', dotColor: 'bg-cyan-500' },
          { label: isZh ? '运行中' : 'Running', value: stats.running, color: 'green', dotColor: 'bg-green-500' },
          { label: isZh ? '异常' : 'Error', value: stats.error, color: 'red', dotColor: 'bg-red-500' },
          { label: isZh ? '维护中' : 'Maintenance', value: stats.maintenance, color: 'yellow', dotColor: 'bg-yellow-500' },
        ].map((item, i) => (
          <div key={i} className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${item.dotColor} animate-pulse`} />
              <span className="text-xs text-gray-400 font-mono uppercase" style={{ fontSize: '0.75rem' }}>{item.label}</span>
            </div>
            <div className="text-xl text-white font-bold" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Endpoint Tabs + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        {/* Endpoint Tabs */}
        <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
          {[
            { key: 'all', label: isZh ? '全部' : 'All' },
            { key: 'max', label: 'Max端' },
            { key: 'nas', label: 'NAS端' },
            { key: 'ecs', label: 'ECS端' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setFilterEndpoint(tab.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${filterEndpoint === tab.key
                ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              style={{ fontSize: '0.75rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={isZh ? '搜索设备名称、IP、描述...' : 'Search name, IP, description...'}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
          className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
          style={{ fontSize: '0.875rem' }}
        >
          <option value="all">{isZh ? '全部类型' : 'All Types'}</option>
          <option value="server">{isZh ? '服务器' : 'Server'}</option>
          <option value="instance">{isZh ? '实例' : 'Instance'}</option>
          <option value="database">{isZh ? '数据库' : 'Database'}</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
          style={{ fontSize: '0.875rem' }}
        >
          <option value="all">{isZh ? '全部状态' : 'All Status'}</option>
          <option value="running">{isZh ? '运行中' : 'Running'}</option>
          <option value="stopped">{isZh ? '已停止' : 'Stopped'}</option>
          <option value="error">{isZh ? '异常' : 'Error'}</option>
          <option value="maintenance">{isZh ? '维护中' : 'Maintenance'}</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-gray-800 bg-gray-900/30">
        <table className="w-full text-sm" style={{ fontSize: '0.875rem' }}>
          <thead className="sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
            <tr className="border-b border-gray-700/50">
              <th className="py-3 px-4 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedDevices.length === pagedDevices.length && pagedDevices.length > 0}
                  onChange={toggleSelectAll}
                  className="accent-cyan-500"
                />
              </th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '设备名称' : 'Device Name'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden md:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '类型' : 'Type'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden lg:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '端点' : 'Endpoint'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '状态' : 'Status'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden xl:table-cell" style={{ fontSize: '0.7rem' }}>CPU</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden xl:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '内存' : 'MEM'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden xl:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '磁盘' : 'DISK'}</th>
              <th className="py-3 px-4 text-right text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '操作' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {pagedDevices.map((device, idx) => {
                const statusInfo = statusMap[device.status];
                const _StatusIcon = statusInfo.icon;
                const typeInfo = typeMap[device.type];
                const TypeIcon = typeInfo.icon;
                const epInfo = endpointMap[device.endpoint];

                return (
                  <motion.tr
                    key={device.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer ${device.status === 'error' ? 'bg-red-900/5' : ''
                      }`}
                    onClick={() => setViewDevice(device)}
                  >
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedDevices.includes(device.id)}
                        onChange={() => toggleSelect(device.id)}
                        className="accent-cyan-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                          <TypeIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate" style={{ fontWeight: 500 }}>{device.name}</div>
                          <div className="text-xs text-gray-500 font-mono truncate" style={{ fontSize: '0.7rem' }}>{device.ip}:{device.port}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-xs text-gray-300 px-2 py-0.5 rounded bg-gray-800 border border-gray-700" style={{ fontSize: '0.75rem' }}>
                        {isZh ? typeInfo.label : typeInfo.labelEn}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded ${epInfo.bg} ${epInfo.color} border ${epInfo.border}`} style={{ fontSize: '0.75rem' }}>
                        {epInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${statusInfo.bg} ${device.status === 'running' ? 'animate-pulse' : ''}`} />
                        <span className={`text-xs ${statusInfo.color}`} style={{ fontSize: '0.75rem' }}>
                          {isZh ? statusInfo.label : statusInfo.labelEn}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getUsageBarColor(device.cpuUsage)}`} style={{ width: `${device.cpuUsage}%` }} />
                        </div>
                        <span className={`text-xs font-mono ${getUsageColor(device.cpuUsage)}`} style={{ fontSize: '0.7rem' }}>{device.cpuUsage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getUsageBarColor(device.memoryUsage)}`} style={{ width: `${device.memoryUsage}%` }} />
                        </div>
                        <span className={`text-xs font-mono ${getUsageColor(device.memoryUsage)}`} style={{ fontSize: '0.7rem' }}>{device.memoryUsage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getUsageBarColor(device.diskUsage)}`} style={{ width: `${device.diskUsage}%` }} />
                        </div>
                        <span className={`text-xs font-mono ${getUsageColor(device.diskUsage)}`} style={{ fontSize: '0.7rem' }}>{device.diskUsage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewDevice(device)} className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-800 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {pagedDevices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Server className="w-12 h-12 mb-3 opacity-30" />
            <p style={{ fontSize: '0.875rem' }}>{isZh ? '未找到匹配的设备' : 'No devices found'}</p>
          </div>
        )}
      </div>

      {/* Pagination + Batch Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        {/* Batch Actions */}
        <div className="flex items-center gap-2">
          {selectedDevices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-gray-400" style={{ fontSize: '0.75rem' }}>
                {isZh ? `已选 ${selectedDevices.length} 台` : `${selectedDevices.length} selected`}
              </span>
              <button className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors" style={{ fontSize: '0.75rem' }}>
                {isZh ? '批量编辑' : 'Batch Edit'}
              </button>
              <button className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors" style={{ fontSize: '0.75rem' }}>
                <Download className="w-3 h-3 inline mr-1" />{isZh ? '导出' : 'Export'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono" style={{ fontSize: '0.7rem' }}>
            {isZh
              ? `显示 ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredDevices.length)} / 共 ${filteredDevices.length} 条`
              : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredDevices.length)} of ${filteredDevices.length}`
            }
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs transition-colors ${currentPage === page
                ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'
                }`}
              style={{ fontSize: '0.75rem' }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Device Detail View =====
function DeviceDetailView({
  device, onBack, isZh, editingField, setEditingField, editValue, setEditValue, getUsageColor, getUsageBarColor
}: {
  device: Device;
  onBack: () => void;
  isZh: boolean;
  editingField: string | null;
  setEditingField: (_f: string | null) => void;
  editValue: string;
  setEditValue: (_v: string) => void;
  getUsageColor: (_u: number) => string;
  getUsageBarColor: (_u: number) => string;
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const statusInfo = statusMap[device.status];
  const typeInfo = typeMap[device.type];
  const epInfo = endpointMap[device.endpoint];

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    // In real app, save to backend
    setEditingField(null);
  };

  const tabs = [
    { key: 'basic', label: isZh ? '基本信息' : 'Basic Info' },
    { key: 'config', label: isZh ? '配置信息' : 'Configuration' },
    { key: 'monitor', label: isZh ? '监控数据' : 'Monitoring' },
    { key: 'audit', label: isZh ? '操作记录' : 'Audit Log' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5 h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl text-white font-bold truncate" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{device.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded ${epInfo.bg} ${epInfo.color} border ${epInfo.border}`} style={{ fontSize: '0.75rem' }}>
              {epInfo.label}
            </span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${statusInfo.bg} ${device.status === 'running' ? 'animate-pulse' : ''}`} />
              <span className={`text-xs ${statusInfo.color}`} style={{ fontSize: '0.75rem' }}>{isZh ? statusInfo.label : statusInfo.labelEn}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-mono truncate" style={{ fontSize: '0.75rem' }}>{device.id} · {device.ip}:{device.port}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 shrink-0 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-xs whitespace-nowrap transition-all ${activeTab === tab.key
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
      <div className="flex-1 min-h-0 overflow-auto space-y-4">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Basic Info */}
            <FuturisticPanel title={isZh ? '基本信息' : 'Basic Info'}>
              <div className="space-y-3">
                <DetailRow label={isZh ? '设备名称' : 'Name'} value={device.name} editable onEdit={() => startEdit('name', device.name)} editingField={editingField} fieldKey="name" editValue={editValue} setEditValue={setEditValue} onSave={saveEdit} />
                <DetailRow label={isZh ? '设备类型' : 'Type'} value={isZh ? typeInfo.label : typeInfo.labelEn} />
                <DetailRow label={isZh ? '所属端点' : 'Endpoint'} value={epInfo.label} />
                <DetailRow label={isZh ? 'IP地址' : 'IP'} value={device.ip} locked />
                <DetailRow label={isZh ? '端口' : 'Port'} value={String(device.port)} locked />
                <DetailRow label={isZh ? '操作系统' : 'OS'} value={device.os} />
                <DetailRow label={isZh ? '部署位置' : 'Location'} value={device.location} />
                <DetailRow label={isZh ? '描述' : 'Description'} value={device.description} editable onEdit={() => startEdit('description', device.description)} editingField={editingField} fieldKey="description" editValue={editValue} setEditValue={setEditValue} onSave={saveEdit} />
              </div>
            </FuturisticPanel>

            {/* Hardware */}
            <FuturisticPanel title={isZh ? '硬件配置' : 'Hardware'}>
              <div className="space-y-3">
                {device.cpu > 0 && <DetailRow label="CPU" value={`${device.cpu} ${isZh ? '核' : 'Cores'}`} locked />}
                <DetailRow label={isZh ? '内存' : 'Memory'} value={`${device.memory} GB`} locked />
                <DetailRow label={isZh ? '磁盘' : 'Disk'} value={`${device.disk} GB`} locked />
              </div>
              <div className="mt-4 space-y-3">
                <div className="text-xs text-gray-400 font-mono uppercase" style={{ fontSize: '0.7rem' }}>{isZh ? '实时负载' : 'Live Usage'}</div>
                <UsageBar label="CPU" usage={device.cpuUsage} getColor={getUsageColor} getBarColor={getUsageBarColor} />
                <UsageBar label={isZh ? '内存' : 'MEM'} usage={device.memoryUsage} getColor={getUsageColor} getBarColor={getUsageBarColor} />
                <UsageBar label={isZh ? '磁盘' : 'DISK'} usage={device.diskUsage} getColor={getUsageColor} getBarColor={getUsageBarColor} />
              </div>
            </FuturisticPanel>

            {/* Tags */}
            <FuturisticPanel title={isZh ? '标签' : 'Tags'} className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                {device.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300" style={{ fontSize: '0.75rem' }}>
                    <Tag className="w-3 h-3 text-cyan-400" /> {tag}
                  </span>
                ))}
                <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-800/50 border border-dashed border-gray-600 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors" style={{ fontSize: '0.75rem' }}>
                  <Plus className="w-3 h-3" /> {isZh ? '添加标签' : 'Add Tag'}
                </button>
              </div>
            </FuturisticPanel>

            {/* Audit Info */}
            <FuturisticPanel title={isZh ? '审计信息' : 'Audit Info'} className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500" style={{ fontSize: '0.7rem' }}>{isZh ? '创建时间' : 'Created'}</div>
                  <div className="text-sm text-gray-300 font-mono" style={{ fontSize: '0.8rem' }}>{device.createdAt}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500" style={{ fontSize: '0.7rem' }}>{isZh ? '更新时间' : 'Updated'}</div>
                  <div className="text-sm text-gray-300 font-mono" style={{ fontSize: '0.8rem' }}>{device.updatedAt}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500" style={{ fontSize: '0.7rem' }}>{isZh ? '创建人' : 'Created By'}</div>
                  <div className="text-sm text-gray-300" style={{ fontSize: '0.8rem' }}>{device.createdBy}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500" style={{ fontSize: '0.7rem' }}>{isZh ? '设备ID' : 'Device ID'}</div>
                  <div className="text-sm text-gray-300 font-mono" style={{ fontSize: '0.8rem' }}>{device.id}</div>
                </div>
              </div>
            </FuturisticPanel>
          </div>
        )}

        {activeTab === 'config' && (
          <FuturisticPanel title={isZh ? '配置信息' : 'Configuration'}>
            <pre className="text-xs text-gray-300 bg-black/30 p-4 rounded-lg overflow-auto font-mono" style={{ fontSize: '0.75rem' }}>
              {JSON.stringify({
                name: device.name,
                type: device.type,
                endpoint: device.endpoint,
                os: device.os,
                hardware: { cpu: `${device.cpu} cores`, memory: `${device.memory} GB`, disk: `${device.disk} GB` },
                network: { ip: device.ip, port: device.port },
                location: device.location,
                tags: device.tags,
              }, null, 2)}
            </pre>
          </FuturisticPanel>
        )}

        {activeTab === 'monitor' && (
          <div className="text-center py-16 text-gray-500">
            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p style={{ fontSize: '0.875rem' }}>{isZh ? '请前往「数据监控」模块查看详细监控数据' : 'Visit Monitor Dashboard for detailed metrics'}</p>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="text-center py-16 text-gray-500">
            <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p style={{ fontSize: '0.875rem' }}>{isZh ? '请前往「操作审计」模块查看操作记录' : 'Visit Audit Logs for operation history'}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ===== Helper Components =====
function DetailRow({
  label, value, editable, locked, onEdit, editingField, fieldKey, editValue, setEditValue, onSave
}: {
  label: string;
  value: string;
  editable?: boolean;
  locked?: boolean;
  onEdit?: () => void;
  editingField?: string | null;
  fieldKey?: string;
  editValue?: string;
  setEditValue?: (_v: string) => void;
  onSave?: () => void;
}) {
  const isEditing = editingField === fieldKey;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-b-0">
      <span className="text-xs text-gray-400 shrink-0 w-24" style={{ fontSize: '0.75rem' }}>{label}</span>
      <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
        {isEditing && setEditValue && onSave ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="bg-gray-800 border border-cyan-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none w-48"
              style={{ fontSize: '0.8rem' }}
              autoFocus
            />
            <button onClick={onSave} className="p-1 text-cyan-400 hover:text-cyan-300"><Save className="w-4 h-4" /></button>
            <button onClick={() => { if (editingField !== undefined) { /* parent will handle */ } }} className="p-1 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <>
            <span className="text-sm text-gray-200 truncate" style={{ fontSize: '0.8rem' }}>{value}</span>
            {locked && <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-gray-800/50 border border-gray-700/50 shrink-0">🔒</span>}
            {editable && !locked && (
              <button onClick={onEdit} className="p-1 text-gray-500 hover:text-cyan-400 transition-colors shrink-0">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UsageBar({
  label, usage, getColor, getBarColor
}: {
  label: string;
  usage: number;
  getColor: (_u: number) => string;
  getBarColor: (_u: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-10 shrink-0 font-mono" style={{ fontSize: '0.7rem' }}>{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${usage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${getBarColor(usage)}`}
        />
      </div>
      <span className={`text-xs font-mono w-10 text-right ${getColor(usage)}`} style={{ fontSize: '0.7rem' }}>{usage}%</span>
    </div>
  );
}
