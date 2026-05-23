import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Search, Filter, Download, Calendar, User,
  CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  Clock, Shield, Settings, Database, Server, RefreshCw,
  ArrowRight, Eye, BarChart3
} from 'lucide-react';

import { useLanguage } from '../LanguageContext';

interface AuditLog {
  id: string;
  operationType: string;
  operationTypeEn: string;
  operationLevel: 'info' | 'warning' | 'critical';
  operator: string;
  operatorRole: string;
  target: string;
  targetId: string;
  action: string;
  actionEn: string;
  result: 'success' | 'failed' | 'partial';
  reason: string;
  reasonEn: string;
  timestamp: string;
  ip: string;
  duration: number;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001', operationType: '配置变更', operationTypeEn: 'Config Change', operationLevel: 'warning',
    operator: '张三', operatorRole: 'system_admin', target: 'yyc3_prod', targetId: 'DEV-006',
    action: '修改数据库最大连接数 200→500', actionEn: 'Changed DB max connections 200→500',
    result: 'success', reason: '业务高峰期需增加连接池', reasonEn: 'Peak traffic requires larger pool',
    timestamp: '2026-02-22 14:30:25', ip: '192.168.1.50', duration: 3
  },
  {
    id: 'AUD-002', operationType: '设备新增', operationTypeEn: 'Device Added', operationLevel: 'info',
    operator: '李四', operatorRole: 'system_admin', target: 'yyc3-202-ECS', targetId: 'DEV-004',
    action: '新增ECS云服务器-202测试环境', actionEn: 'Added ECS-202 test environment',
    result: 'success', reason: '新增测试环境部署', reasonEn: 'New test environment deployment',
    timestamp: '2026-02-22 15:45:10', ip: '47.xxx.xxx.125', duration: 45
  },
  {
    id: 'AUD-003', operationType: '版本升级', operationTypeEn: 'Version Upgrade', operationLevel: 'critical',
    operator: '张三', operatorRole: 'system_admin', target: 'Max-Server-Primary', targetId: 'DEV-001',
    action: 'Ubuntu 22.04→24.04 LTS 系统升级', actionEn: 'Ubuntu 22.04→24.04 LTS upgrade',
    result: 'success', reason: '安全补丁与性能优化', reasonEn: 'Security patches and performance',
    timestamp: '2026-02-21 10:20:33', ip: '192.168.1.50', duration: 1800
  },
  {
    id: 'AUD-004', operationType: '安全加固', operationTypeEn: 'Security Hardening', operationLevel: 'critical',
    operator: '王五', operatorRole: 'security_admin', target: '所有ECS', targetId: 'BATCH',
    action: '更新防火墙规则，关闭非必要端口', actionEn: 'Updated firewall rules, closed unnecessary ports',
    result: 'success', reason: '安全审计整改', reasonEn: 'Security audit remediation',
    timestamp: '2026-02-21 11:30:55', ip: '192.168.1.60', duration: 300
  },
  {
    id: 'AUD-005', operationType: '备份恢复', operationTypeEn: 'Backup Restore', operationLevel: 'critical',
    operator: '张三', operatorRole: 'system_admin', target: 'yyc3_test', targetId: 'DEV-007',
    action: '从生产环境备份恢复测试数据库', actionEn: 'Restored test DB from production backup',
    result: 'success', reason: '测试数据刷新', reasonEn: 'Test data refresh',
    timestamp: '2026-02-20 09:15:42', ip: '192.168.1.50', duration: 600
  },
  {
    id: 'AUD-006', operationType: '配置变更', operationTypeEn: 'Config Change', operationLevel: 'warning',
    operator: '李四', operatorRole: 'system_admin', target: 'Max-Redis-Master', targetId: 'DEV-009',
    action: '调整Redis内存上限 24GB→32GB', actionEn: 'Adjusted Redis memory limit 24GB→32GB',
    result: 'success', reason: '缓存命中率优化', reasonEn: 'Cache hit rate optimization',
    timestamp: '2026-02-20 14:22:18', ip: '192.168.1.50', duration: 2
  },
  {
    id: 'AUD-007', operationType: '告警处理', operationTypeEn: 'Alert Handling', operationLevel: 'warning',
    operator: '张三', operatorRole: 'system_admin', target: 'NAS-Tensor-Inference', targetId: 'DEV-012',
    action: '重启Tensor推理服务释放GPU内存', actionEn: 'Restarted Tensor inference to free GPU mem',
    result: 'partial', reason: 'GPU内存泄漏', reasonEn: 'GPU memory leak',
    timestamp: '2026-02-19 16:45:30', ip: '192.168.1.50', duration: 120
  },
  {
    id: 'AUD-008', operationType: '权限变更', operationTypeEn: 'Permission Change', operationLevel: 'info',
    operator: '管理员', operatorRole: 'super_admin', target: '王五', targetId: 'USER-003',
    action: '授予安全管理员角色', actionEn: 'Granted security_admin role',
    result: 'success', reason: '人员职责调整', reasonEn: 'Staff role adjustment',
    timestamp: '2026-02-19 10:00:00', ip: '192.168.1.10', duration: 1
  },
  {
    id: 'AUD-009', operationType: '数据迁移', operationTypeEn: 'Data Migration', operationLevel: 'critical',
    operator: '张三', operatorRole: 'system_admin', target: 'yyc3_archive', targetId: 'DEV-008',
    action: '历史日志数据迁移至NAS归档库', actionEn: 'Migrated historical logs to NAS archive',
    result: 'success', reason: '存储空间优化', reasonEn: 'Storage optimization',
    timestamp: '2026-02-18 20:30:15', ip: '192.168.1.50', duration: 3600
  },
  {
    id: 'AUD-010', operationType: 'SSL证书更新', operationTypeEn: 'SSL Cert Update', operationLevel: 'warning',
    operator: '李四', operatorRole: 'system_admin', target: 'yyc3-125-ECS', targetId: 'DEV-003',
    action: '更新SSL证书，有效期至2027-02', actionEn: 'Updated SSL cert, valid until 2027-02',
    result: 'success', reason: '证书即将过期', reasonEn: 'Certificate expiring soon',
    timestamp: '2026-02-18 11:15:45', ip: '47.xxx.xxx.125', duration: 30
  },
  {
    id: 'AUD-011', operationType: '网络配置', operationTypeEn: 'Network Config', operationLevel: 'warning',
    operator: '李四', operatorRole: 'system_admin', target: 'NAS-Server-Core', targetId: 'DEV-002',
    action: '配置NAS与Max端VPN隧道', actionEn: 'Configured VPN tunnel between NAS and Max',
    result: 'failed', reason: '网络抖动导致配置超时', reasonEn: 'Network jitter caused timeout',
    timestamp: '2026-02-17 15:00:22', ip: '192.168.1.50', duration: 180
  },
  {
    id: 'AUD-012', operationType: '模型部署', operationTypeEn: 'Model Deployment', operationLevel: 'info',
    operator: '张三', operatorRole: 'system_admin', target: 'NAS-Tensor-Inference', targetId: 'DEV-012',
    action: '部署Embedding模型v2.1至NAS推理节点', actionEn: 'Deployed Embedding model v2.1 to NAS',
    result: 'success', reason: '模型版本更新', reasonEn: 'Model version update',
    timestamp: '2026-02-17 09:30:10', ip: '192.168.1.50', duration: 240
  },
];

const resultMap = {
  success: { label: '成功', labelEn: 'Success', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/20', icon: CheckCircle },
  failed: { label: '失败', labelEn: 'Failed', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/20', icon: XCircle },
  partial: { label: '部分成功', labelEn: 'Partial', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/20', icon: AlertTriangle },
};

const levelMap = {
  info: { color: 'text-blue-400', bg: 'bg-blue-500' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500' },
  critical: { color: 'text-red-400', bg: 'bg-red-500' },
};

export function AuditLogs() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterTime, setFilterTime] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const pageSize = 8;

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => {
      const matchSearch = !searchTerm ||
        log.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionEn.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || log.operationType === filterType || log.operationTypeEn === filterType;
      const matchResult = filterResult === 'all' || log.result === filterResult;
      return matchSearch && matchType && matchResult;
    });
  }, [searchTerm, filterType, filterResult]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const pagedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: MOCK_AUDIT_LOGS.length,
    success: MOCK_AUDIT_LOGS.filter(l => l.result === 'success').length,
    failed: MOCK_AUDIT_LOGS.filter(l => l.result === 'failed').length,
    critical: MOCK_AUDIT_LOGS.filter(l => l.operationLevel === 'critical').length,
  }), []);

  const _operationTypes = useMemo(() => {
    const types = new Set(MOCK_AUDIT_LOGS.map(l => isZh ? l.operationType : l.operationTypeEn));
    return Array.from(types);
  }, [isZh]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <FileText className="w-6 h-6" />
            {isZh ? '操作审计' : 'Audit Logs'}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-300 border border-cyan-500/30">
              {stats.total} {isZh ? '条记录' : 'RECORDS'}
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>{isZh ? '完整的操作审计追踪与合规检查' : 'Complete operation audit trail & compliance'}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm" style={{ fontSize: '0.875rem' }}>
            <BarChart3 className="w-4 h-4" /> {isZh ? '统计分析' : 'Analytics'}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600/80 border border-cyan-500/50 text-white hover:bg-cyan-500 transition-colors text-sm" style={{ fontSize: '0.875rem' }}>
            <Download className="w-4 h-4" /> {isZh ? '导出报告' : 'Export'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-xs text-gray-400 font-mono" style={{ fontSize: '0.7rem' }}>{isZh ? '总操作数' : 'Total Ops'}</div>
          <div className="text-xl text-white font-bold" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-xs text-gray-400 font-mono" style={{ fontSize: '0.7rem' }}>{isZh ? '成功' : 'Success'}</div>
          <div className="text-xl text-green-400 font-bold" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.success}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-xs text-gray-400 font-mono" style={{ fontSize: '0.7rem' }}>{isZh ? '失败' : 'Failed'}</div>
          <div className="text-xl text-red-400 font-bold" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.failed}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-xs text-gray-400 font-mono" style={{ fontSize: '0.7rem' }}>{isZh ? '高危操作' : 'Critical'}</div>
          <div className="text-xl text-yellow-400 font-bold" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.critical}</div>
        </div>
      </div>

      {/* Category Tabs + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
          {[
            { key: 'all', label: isZh ? '全部' : 'All' },
            { key: isZh ? '配置变更' : 'Config Change', label: isZh ? '配置变更' : 'Config' },
            { key: isZh ? '设备新增' : 'Device Added', label: isZh ? '设备管理' : 'Devices' },
            { key: isZh ? '安全加固' : 'Security Hardening', label: isZh ? '安全操作' : 'Security' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setFilterType(tab.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                filterType === tab.key
                  ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={isZh ? '搜索操作人、对象、操作内容...' : 'Search operator, target, action...'}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        <select
          value={filterTime}
          onChange={e => setFilterTime(e.target.value)}
          className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
          style={{ fontSize: '0.875rem' }}
        >
          <option value="1d">{isZh ? '近1天' : 'Last 1 day'}</option>
          <option value="7d">{isZh ? '近7天' : 'Last 7 days'}</option>
          <option value="30d">{isZh ? '近30天' : 'Last 30 days'}</option>
          <option value="all">{isZh ? '全部' : 'All time'}</option>
        </select>

        <select
          value={filterResult}
          onChange={e => { setFilterResult(e.target.value); setCurrentPage(1); }}
          className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
          style={{ fontSize: '0.875rem' }}
        >
          <option value="all">{isZh ? '全部结果' : 'All Results'}</option>
          <option value="success">{isZh ? '成功' : 'Success'}</option>
          <option value="failed">{isZh ? '失败' : 'Failed'}</option>
          <option value="partial">{isZh ? '部分成功' : 'Partial'}</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-gray-800 bg-gray-900/30">
        <table className="w-full text-sm" style={{ fontSize: '0.875rem' }}>
          <thead className="sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
            <tr className="border-b border-gray-700/50">
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '时间' : 'Time'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '操作人' : 'Operator'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden md:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '操作类型' : 'Type'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '操作对象' : 'Target'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden lg:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '操作内容' : 'Action'}</th>
              <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '结果' : 'Result'}</th>
              <th className="py-3 px-4 text-right text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '详情' : 'Detail'}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {pagedLogs.map((log, idx) => {
                const resInfo = resultMap[log.result];
                const ResIcon = resInfo.icon;
                const lvlInfo = levelMap[log.operationLevel];

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                      log.result === 'failed' ? 'bg-red-900/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-300 font-mono whitespace-nowrap" style={{ fontSize: '0.75rem' }}>
                        {log.timestamp.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.625rem' }}>
                        {log.timestamp.split(' ')[1]}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0" style={{ fontSize: '0.625rem' }}>
                          {log.operator[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-gray-200 truncate" style={{ fontSize: '0.8rem' }}>{log.operator}</div>
                          <div className="text-[10px] text-gray-500" style={{ fontSize: '0.6rem' }}>{log.operatorRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${lvlInfo.bg}`} />
                        <span className="text-xs text-gray-300" style={{ fontSize: '0.75rem' }}>
                          {isZh ? log.operationType : log.operationTypeEn}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-cyan-400 font-mono" style={{ fontSize: '0.75rem' }}>{log.target}</span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-300 truncate block max-w-[300px]" style={{ fontSize: '0.75rem' }}>
                        {isZh ? log.action : log.actionEn}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${resInfo.bg} ${resInfo.color} border ${resInfo.border}`} style={{ fontSize: '0.7rem' }}>
                        <ResIcon className="w-3 h-3" />
                        {isZh ? resInfo.label : resInfo.labelEn}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {pagedLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p style={{ fontSize: '0.875rem' }}>{isZh ? '未找到匹配的审计记录' : 'No audit logs found'}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs text-gray-500 font-mono" style={{ fontSize: '0.7rem' }}>
          {isZh
            ? `显示 ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredLogs.length)} / 共 ${filteredLogs.length} 条`
            : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredLogs.length)} of ${filteredLogs.length}`
          }
        </span>
        <div className="flex items-center gap-2">
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
              className={`w-8 h-8 rounded-lg text-xs transition-colors ${
                currentPage === page
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold" style={{ fontWeight: 700 }}>{isZh ? '审计详情' : 'Audit Detail'}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1" style={{ fontSize: '0.7rem' }}>{selectedLog.id}</p>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <DetailItem label={isZh ? '操作时间' : 'Timestamp'} value={selectedLog.timestamp} />
                <DetailItem label={isZh ? '操作人' : 'Operator'} value={`${selectedLog.operator} (${selectedLog.operatorRole})`} />
                <DetailItem label={isZh ? '操作类型' : 'Type'} value={isZh ? selectedLog.operationType : selectedLog.operationTypeEn} />
                <DetailItem label={isZh ? '操作对象' : 'Target'} value={`${selectedLog.target} (${selectedLog.targetId})`} />
                <DetailItem label={isZh ? '操作内容' : 'Action'} value={isZh ? selectedLog.action : selectedLog.actionEn} />
                <DetailItem label={isZh ? '变更原因' : 'Reason'} value={isZh ? selectedLog.reason : selectedLog.reasonEn} />
                <DetailItem label={isZh ? '操作结果' : 'Result'} value={isZh ? resultMap[selectedLog.result].label : resultMap[selectedLog.result].labelEn} highlight={selectedLog.result} />
                <DetailItem label={isZh ? '操作时长' : 'Duration'} value={formatDuration(selectedLog.duration)} />
                <DetailItem label={isZh ? '操作IP' : 'IP Address'} value={selectedLog.ip} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  const getHighlightColor = () => {
    switch (highlight) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'partial': return 'text-yellow-400';
      default: return 'text-gray-200';
    }
  };

  return (
    <div className="flex items-start gap-4">
      <span className="text-xs text-gray-500 w-20 shrink-0 pt-0.5" style={{ fontSize: '0.75rem' }}>{label}</span>
      <span className={`text-sm ${highlight ? getHighlightColor() : 'text-gray-200'}`} style={{ fontSize: '0.8rem' }}>{value}</span>
    </div>
  );
}
