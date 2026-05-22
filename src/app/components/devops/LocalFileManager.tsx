import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen, File, FileText, FileCode, Download, Trash2, RefreshCw,
  ChevronRight, ChevronDown, Home, HardDrive, Clock, Search,
  Archive, Database, Settings, Eye, Copy, ArrowLeft, ExternalLink,
  Folder, FileJson, Terminal, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Types =====
interface FileNode {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified?: string;
  icon?: React.ReactNode;
  children?: FileNode[];
  content?: string;
}

interface QuickOp {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  descriptionEn: string;
}

// ===== Mock File System =====
const FILE_TREE: FileNode[] = [
  {
    name: 'logs', type: 'folder', icon: <FileText size={14} className="text-blue-400" />, children: [
      {
        name: 'node', type: 'folder', children: [
          {
            name: 'GPU-A100-01', type: 'folder', children: [
              { name: 'inference.log', type: 'file', size: '2.3MB', modified: '2分钟前', content: '[2026-03-02 14:23:45] INFO  Model loaded: LLaMA-70B\n[2026-03-02 14:23:46] INFO  Inference started: task#12847\n[2026-03-02 14:23:48] WARN  Latency spike: 1850ms\n[2026-03-02 14:24:01] INFO  Inference completed: 1.2s\n[2026-03-02 14:24:15] ERROR Connection timeout to node GPU-A100-03\n[2026-03-02 14:24:30] INFO  Auto-reconnect successful' },
              { name: 'error.log', type: 'file', size: '456KB', modified: '5分钟前', content: '[2026-03-02 14:20:12] ERROR CUDA out of memory on device 0\n[2026-03-02 14:20:13] ERROR Failed to allocate 2.1GB tensor\n[2026-03-02 14:20:15] WARN  Falling back to CPU inference\n[2026-03-02 14:20:45] INFO  Memory recovered after GC' },
              { name: 'metrics.json', type: 'file', size: '89KB', modified: '1分钟前' },
            ]
          },
          {
            name: 'GPU-A100-02', type: 'folder', children: [
              { name: 'inference.log', type: 'file', size: '1.8MB', modified: '3分钟前' },
              { name: 'error.log', type: 'file', size: '12KB', modified: '2小时前' },
              { name: 'metrics.json', type: 'file', size: '91KB', modified: '1分钟前' },
            ]
          },
          {
            name: 'GPU-A100-03', type: 'folder', children: [
              { name: 'inference.log', type: 'file', size: '3.1MB', modified: '刚刚' },
              { name: 'error.log', type: 'file', size: '1.2MB', modified: '刚刚', content: '[2026-03-02 14:23:45] ERROR Latency exceeded threshold: 2450ms > 2000ms\n[2026-03-02 14:23:46] ERROR Memory fragmentation detected: 45%\n[2026-03-02 14:24:00] WARN  Auto-scaling triggered\n[2026-03-02 14:24:15] ERROR Latency exceeded threshold: 2680ms > 2000ms\n[2026-03-02 14:24:30] INFO  Scale-down completed' },
              { name: 'metrics.json', type: 'file', size: '95KB', modified: '刚刚' },
            ]
          },
        ]
      },
      {
        name: 'system', type: 'folder', children: [
          { name: 'app.log', type: 'file', size: '5.6MB', modified: '刚刚' },
          { name: 'performance.json', type: 'file', size: '234KB', modified: '30秒前' },
          { name: 'access.log', type: 'file', size: '12.3MB', modified: '刚刚' },
        ]
      }
    ]
  },
  {
    name: 'reports', type: 'folder', icon: <FileCode size={14} className="text-green-400" />, children: [
      {
        name: 'daily', type: 'folder', children: [
          { name: '2026-03-02.json', type: 'file', size: '156KB', modified: '1小时前' },
          { name: '2026-03-01.json', type: 'file', size: '148KB', modified: '1天前' },
          { name: '2026-02-28.json', type: 'file', size: '162KB', modified: '2天前' },
        ]
      },
      {
        name: 'weekly', type: 'folder', children: [
          { name: '2026-W09.json', type: 'file', size: '890KB', modified: '3天前' },
          { name: '2026-W08.json', type: 'file', size: '920KB', modified: '10天前' },
        ]
      },
      {
        name: 'monthly', type: 'folder', children: [
          { name: '2026-02.json', type: 'file', size: '3.4MB', modified: '2天前' },
        ]
      }
    ]
  },
  {
    name: 'backups', type: 'folder', icon: <Archive size={14} className="text-orange-400" />, children: [
      {
        name: 'nodes', type: 'folder', children: [
          { name: 'gpu-config-20260302.tar.gz', type: 'file', size: '45MB', modified: '6小时前' },
        ]
      },
      {
        name: 'models', type: 'folder', children: [
          { name: 'llama-70b-checkpoint.tar.gz', type: 'file', size: '128GB', modified: '1天前' },
        ]
      },
      {
        name: 'config', type: 'folder', children: [
          { name: 'full-backup-20260302.tar.gz', type: 'file', size: '2.3MB', modified: '6小时前' },
        ]
      }
    ]
  },
  {
    name: 'configs', type: 'folder', icon: <Settings size={14} className="text-purple-400" />, children: [
      { name: 'patrol.json', type: 'file', size: '4.2KB', modified: '3小时前', content: '{\n  "interval": 15,\n  "autoPatrol": true,\n  "checks": [\n    "node_health",\n    "storage_capacity",\n    "network_latency",\n    "security_scan"\n  ],\n  "thresholds": {\n    "cpu_warning": 80,\n    "cpu_critical": 95,\n    "memory_warning": 80,\n    "disk_warning": 85\n  }\n}' },
      { name: 'alerts.json', type: 'file', size: '3.8KB', modified: '1天前' },
      { name: 'templates.json', type: 'file', size: '12KB', modified: '2天前' },
      { name: 'network.json', type: 'file', size: '2.1KB', modified: '5天前' },
    ]
  },
  {
    name: 'cache', type: 'folder', icon: <Database size={14} className="text-cyan-400" />, children: [
      {
        name: 'queries', type: 'folder', children: [
          { name: 'cache-index.db', type: 'file', size: '890KB', modified: '刚刚' },
          { name: 'result-cache.db', type: 'file', size: '23MB', modified: '刚刚' },
        ]
      }
    ]
  }
];

const QUICK_OPS: QuickOp[] = [
  { id: 'download-logs', label: '下载日志', labelEn: 'Download Logs', icon: <Download size={16} />, color: 'text-blue-400', description: '打包下载最近24h节点日志', descriptionEn: 'Package and download last 24h node logs' },
  { id: 'gen-report', label: '生成报告', labelEn: 'Generate Report', icon: <FileCode size={16} />, color: 'text-green-400', description: '生成当日系统性能报告', descriptionEn: 'Generate daily system performance report' },
  { id: 'backup', label: '执行备份', labelEn: 'Run Backup', icon: <Archive size={16} />, color: 'text-orange-400', description: '备份所有配置文件和节点状态', descriptionEn: 'Backup all configs and node states' },
  { id: 'clear-cache', label: '清理缓存', labelEn: 'Clear Cache', icon: <Trash2 size={16} />, color: 'text-red-400', description: '清理查询缓存释放存储空间', descriptionEn: 'Clear query cache to free storage' },
];

// ===== Component =====
export function LocalFileManager() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['logs', 'configs']));
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'preview'>('tree');
  const [operationLog, setOperationLog] = useState<{ msg: string; type: 'info' | 'success' | 'error'; time: string }[]>([
    { msg: isZh ? '文件管理器已就绪' : 'File Manager ready', type: 'info', time: new Date().toLocaleTimeString() },
  ]);

  // Get storage stats
  const storageStats = [
    { label: isZh ? '日志' : 'Logs', size: '28.4MB', color: 'bg-blue-500' },
    { label: isZh ? '报告' : 'Reports', size: '5.8MB', color: 'bg-green-500' },
    { label: isZh ? '备份' : 'Backups', size: '175.3MB', color: 'bg-orange-500' },
    { label: isZh ? '配置' : 'Configs', size: '22.1KB', color: 'bg-purple-500' },
    { label: isZh ? '缓存' : 'Cache', size: '23.9MB', color: 'bg-cyan-500' },
  ];

  const totalStorage = 233.4; // MB
  const totalQuota = 512; // MB
  const usagePercent = Math.round((totalStorage / totalQuota) * 100);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleQuickOp = useCallback((op: QuickOp) => {
    const time = new Date().toLocaleTimeString();
    setOperationLog(prev => [
      { msg: isZh ? `正在执行: ${op.label}...` : `Executing: ${op.labelEn}...`, type: 'info', time },
      ...prev,
    ]);
    setTimeout(() => {
      setOperationLog(prev => [
        { msg: isZh ? `${op.label} 完成` : `${op.labelEn} completed`, type: 'success', time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    }, 1500);
  }, [isZh]);

  const renderFileTree = (nodes: FileNode[], path: string = '', depth: number = 0) => {
    return nodes
      .filter(node => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        if (node.name.toLowerCase().includes(q)) return true;
        if (node.children) return node.children.some(c => c.name.toLowerCase().includes(q));
        return false;
      })
      .map(node => {
        const fullPath = path ? `${path}/${node.name}` : node.name;
        const isExpanded = expandedFolders.has(fullPath);
        const isSelected = selectedFile?.name === node.name && viewMode === 'preview';

        if (node.type === 'folder') {
          return (
            <div key={fullPath}>
              <button
                onClick={() => toggleFolder(fullPath)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-800/50 group ${isExpanded ? 'text-cyan-400' : 'text-gray-400'}`}
                style={{ paddingLeft: `${12 + depth * 16}px`, fontSize: '0.8125rem', fontWeight: 500 }}
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {node.icon || <Folder size={14} className="text-yellow-500" />}
                <span>{node.name}/</span>
                {node.children && (
                  <span className="text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '0.625rem' }}>
                    {node.children.length} {isZh ? '项' : 'items'}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {isExpanded && node.children && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {renderFileTree(node.children, fullPath, depth + 1)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        // File node
        const ext = node.name.split('.').pop();
        const fileIcon = ext === 'json' ? <FileJson size={14} className="text-yellow-400" />
          : ext === 'log' ? <FileText size={14} className="text-blue-400" />
          : ext === 'gz' ? <Archive size={14} className="text-orange-400" />
          : ext === 'db' ? <Database size={14} className="text-cyan-400" />
          : <File size={14} className="text-gray-400" />;

        return (
          <button
            key={fullPath}
            onClick={() => { setSelectedFile(node); setViewMode('preview'); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
              isSelected ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800/50'
            }`}
            style={{ paddingLeft: `${28 + depth * 16}px`, fontSize: '0.8125rem', fontWeight: 400 }}
          >
            {fileIcon}
            <span className="truncate">{node.name}</span>
            <span className="text-gray-600 ml-auto shrink-0" style={{ fontSize: '0.625rem' }}>{node.size}</span>
            {node.modified && (
              <span className="text-gray-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '0.625rem' }}>{node.modified}</span>
            )}
          </button>
        );
      });
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pb-6" style={{ fontSize: '0.875rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30 flex items-center justify-center">
            <FolderOpen size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isZh ? '本地文件管理' : 'Local File Manager'}
            </h2>
            <p className="text-gray-400 font-mono" style={{ fontSize: '0.75rem' }}>
              ~/.yyc3-matrix/
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-300 transition-all" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
            <RefreshCw size={12} /> {isZh ? '刷新' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{isZh ? '存储使用' : 'Storage Usage'}</span>
          <span className="text-gray-400" style={{ fontSize: '0.75rem' }}>{totalStorage.toFixed(1)}MB / {totalQuota}MB ({usagePercent}%)</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
          {storageStats.map((stat, i) => (
            <div key={i} className={`${stat.color} h-full`} style={{ width: `${(parseFloat(stat.size) / totalQuota) * 100}%` }} />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {storageStats.map((stat, i) => (
            <span key={i} className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: '0.6875rem' }}>
              <div className={`w-2 h-2 rounded-full ${stat.color}`} />
              {stat.label} ({stat.size})
            </span>
          ))}
        </div>
      </div>

      {/* Quick Operations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_OPS.map((op, i) => (
          <motion.button
            key={op.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleQuickOp(op)}
            className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all text-left group"
          >
            <div className={`${op.color} mb-2 group-hover:scale-110 transition-transform`}>{op.icon}</div>
            <div className="text-white" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{isZh ? op.label : op.labelEn}</div>
            <div className="text-gray-500 mt-0.5" style={{ fontSize: '0.6875rem' }}>{isZh ? op.description : op.descriptionEn}</div>
          </motion.button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* File Tree */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <FuturisticPanel title={isZh ? '文件浏览器' : 'File Browser'} icon={<Folder size={14} className="text-white" />}>
            {/* Search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isZh ? '搜索文件...' : 'Search files...'}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-gray-300 placeholder:text-gray-600 outline-none focus:border-cyan-500/50 transition-colors"
                style={{ fontSize: '0.75rem' }}
              />
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 mb-3 text-gray-500" style={{ fontSize: '0.6875rem' }}>
              <Home size={12} />
              <span className="text-cyan-400 font-mono">~/.yyc3-matrix</span>
            </div>

            {/* Tree */}
            <div className="max-h-[50vh] overflow-y-auto space-y-0.5 custom-scrollbar">
              {renderFileTree(FILE_TREE)}
            </div>
          </FuturisticPanel>
        </div>

        {/* Preview / Log Panel */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* File Preview */}
          {selectedFile && viewMode === 'preview' ? (
            <FuturisticPanel
              title={selectedFile.name}
              subtitle={`${selectedFile.size || '—'} · ${isZh ? '最后修改' : 'Modified'}: ${selectedFile.modified || '—'}`}
              icon={<Eye size={14} className="text-white" />}
              variant="primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => { setSelectedFile(null); setViewMode('tree'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-300 transition-all"
                  style={{ fontSize: '0.75rem', fontWeight: 500 }}
                >
                  <ArrowLeft size={12} /> {isZh ? '返回' : 'Back'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-300 transition-all" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  <Download size={12} /> {isZh ? '下载' : 'Download'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-300 transition-all" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  <Copy size={12} /> {isZh ? '复制路径' : 'Copy Path'}
                </button>
              </div>
              {selectedFile.content ? (
                <pre className="bg-[#0a0f1c] rounded-lg p-4 overflow-auto max-h-[40vh] font-mono text-gray-300 border border-gray-800" style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
                  {selectedFile.content.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-gray-700 select-none w-8 shrink-0 text-right mr-4" style={{ fontSize: '0.6875rem' }}>{i + 1}</span>
                      <span className={
                        line.includes('ERROR') ? 'text-red-400' :
                        line.includes('WARN') ? 'text-yellow-400' :
                        line.includes('INFO') ? 'text-green-400' :
                        'text-gray-400'
                      }>{line}</span>
                    </div>
                  ))}
                </pre>
              ) : (
                <div className="bg-[#0a0f1c] rounded-lg p-8 text-center text-gray-600 border border-gray-800">
                  <FileText size={32} className="mx-auto mb-2 text-gray-700" />
                  <p style={{ fontSize: '0.8125rem' }}>{isZh ? '暂无预览内容' : 'No preview available'}</p>
                  <p className="mt-1" style={{ fontSize: '0.6875rem' }}>{isZh ? '二进制文件或未加载内容' : 'Binary file or content not loaded'}</p>
                </div>
              )}
            </FuturisticPanel>
          ) : (
            <div className="flex items-center justify-center h-40 rounded-xl bg-gray-900/20 border border-gray-800/50 text-gray-600">
              <div className="text-center">
                <Eye size={24} className="mx-auto mb-2 text-gray-700" />
                <p style={{ fontSize: '0.8125rem' }}>{isZh ? '选择文件查看预览' : 'Select a file to preview'}</p>
              </div>
            </div>
          )}

          {/* Operation Log */}
          <FuturisticPanel title={isZh ? '操作日志' : 'Operation Log'} icon={<Terminal size={14} className="text-white" />}>
            <div className="max-h-[20vh] overflow-y-auto space-y-1.5 custom-scrollbar">
              {operationLog.map((log, i) => (
                <motion.div
                  key={`${log.time}-${i}`}
                  initial={i === 0 ? { opacity: 0, x: -10 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/30"
                  style={{ fontSize: '0.75rem' }}
                >
                  {log.type === 'success' ? <CheckCircle size={12} className="text-green-400 shrink-0" /> :
                   log.type === 'error' ? <AlertTriangle size={12} className="text-red-400 shrink-0" /> :
                   <Info size={12} className="text-blue-400 shrink-0" />}
                  <span className="text-gray-500 font-mono shrink-0" style={{ fontSize: '0.6875rem' }}>{log.time}</span>
                  <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-400'}`}>
                    {log.msg}
                  </span>
                </motion.div>
              ))}
            </div>
          </FuturisticPanel>
        </div>
      </div>
    </div>
  );
}
