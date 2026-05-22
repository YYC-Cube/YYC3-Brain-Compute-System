/**
 * YYC³ API — Mock 拦截器
 * 
 * TEST_MODE=true 时拦截所有 API 调用，返回 mock 数据
 * 切换至真实后端: 将 config.ts 中 TEST_MODE 设为 false
 */

import { API_CONFIG } from './config';
import type {
  ApiResponse, PaginatedResponse, Device, AuditLog, MonitorOverview,
  MonitorAlert, PatrolReport, PatrolCheck, AlertDetail, OperationChainItem,
  AIAnalysisResult, Role, User, OperationTemplate, OperationLog, FileNode,
  ScriptTemplate, ScriptExecution, IDENodeStatus, BatchJob,
} from './types';

// ===== Mock 延迟模拟 =====
function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
}

function ok<T>(data: T): ApiResponse<T> {
  return { code: 200, message: 'success', data, timestamp: Date.now() };
}

function paginated<T>(data: T[], page = 1, pageSize = 20): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  return {
    code: 200, message: 'success',
    data: data.slice(start, start + pageSize),
    pagination: { page, pageSize, total: data.length, totalPages: Math.ceil(data.length / pageSize) },
    timestamp: Date.now(),
  };
}

// ============================================================
//  Mock 数据集
// ============================================================

// --- Devices ---
const DEVICES: Device[] = [
  { id: 'DEV-001', name: 'Max-Server-Primary', type: 'server', endpoint: 'max', ip: '192.168.1.100', port: 22, status: 'running', os: 'Ubuntu 24.04 LTS', cpu: 16, memory: 64, disk: 2048, cpuUsage: 72, memoryUsage: 58, diskUsage: 41, location: '本地机房-A区', createdAt: '2025-06-15', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', '核心', 'Max端'], description: 'Max端主服务器' },
  { id: 'DEV-002', name: 'NAS-Server-Core', type: 'server', endpoint: 'nas', ip: '192.168.1.200', port: 22, status: 'running', os: 'Debian 12', cpu: 32, memory: 128, disk: 8192, cpuUsage: 45, memoryUsage: 62, diskUsage: 73, location: '本地机房-B区', createdAt: '2025-08-20', updatedAt: '2026-02-21', createdBy: 'admin', tags: ['生产', '存储', 'NAS端'], description: 'NAS存储与AI推理服务器' },
  { id: 'DEV-003', name: 'yyc3-125-ECS', type: 'server', endpoint: 'ecs', ip: '47.xxx.xxx.125', port: 22, status: 'running', os: 'Ubuntu 24.04 LTS', cpu: 4, memory: 8, disk: 100, cpuUsage: 35, memoryUsage: 68, diskUsage: 52, location: '阿里云-华北2', createdAt: '2025-09-10', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', 'ECS端'], description: 'ECS-125 API网关' },
  { id: 'DEV-004', name: 'yyc3-202-ECS', type: 'server', endpoint: 'ecs', ip: '47.xxx.xxx.202', port: 22, status: 'maintenance', os: 'Ubuntu 24.04 LTS', cpu: 2, memory: 4, disk: 50, cpuUsage: 12, memoryUsage: 45, diskUsage: 38, location: '阿里云-华北2', createdAt: '2025-11-05', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['测试', 'ECS端'], description: 'ECS-202 测试环境' },
  { id: 'DEV-005', name: 'yyc3-33-ECS', type: 'server', endpoint: 'ecs', ip: '8.xxx.xxx.33', port: 22, status: 'running', os: 'Ubuntu 24.04 LTS', cpu: 2, memory: 4, disk: 40, cpuUsage: 28, memoryUsage: 55, diskUsage: 62, location: '阿里云-华东1', createdAt: '2025-12-01', updatedAt: '2026-02-20', createdBy: 'admin', tags: ['生产', 'ECS端'], description: 'ECS-33 监控节点' },
  { id: 'DEV-006', name: 'yyc3_prod', type: 'database', endpoint: 'max', ip: '192.168.1.100', port: 5432, status: 'running', os: 'PostgreSQL 15', cpu: 0, memory: 16, disk: 512, cpuUsage: 55, memoryUsage: 72, diskUsage: 48, location: 'Max端-本地', createdAt: '2025-06-20', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', '数据库'], description: '生产主数据库' },
  { id: 'DEV-007', name: 'yyc3_analytics', type: 'database', endpoint: 'nas', ip: '192.168.1.200', port: 5432, status: 'running', os: 'PostgreSQL 15', cpu: 0, memory: 32, disk: 1024, cpuUsage: 38, memoryUsage: 55, diskUsage: 62, location: 'NAS端-本地', createdAt: '2025-09-01', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', '分析库'], description: '分析数据库' },
  { id: 'DEV-008', name: 'Max-Redis-Master', type: 'instance', endpoint: 'max', ip: '192.168.1.100', port: 6379, status: 'running', os: 'Redis 7.2', cpu: 0, memory: 8, disk: 32, cpuUsage: 22, memoryUsage: 45, diskUsage: 28, location: 'Max端-本地', createdAt: '2025-06-20', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', '缓存'], description: 'Redis主节点' },
  { id: 'DEV-009', name: 'Max-Redis-Slave', type: 'instance', endpoint: 'max', ip: '192.168.1.101', port: 6380, status: 'running', os: 'Redis 7.2', cpu: 0, memory: 8, disk: 32, cpuUsage: 15, memoryUsage: 38, diskUsage: 25, location: 'Max端-本地', createdAt: '2025-06-20', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', '缓存'], description: 'Redis从节点' },
  { id: 'DEV-010', name: 'NAS-Ollama-Service', type: 'instance', endpoint: 'nas', ip: '192.168.1.200', port: 11434, status: 'running', os: 'Ollama 0.3', cpu: 0, memory: 48, disk: 256, cpuUsage: 68, memoryUsage: 78, diskUsage: 55, location: 'NAS端-本地', createdAt: '2025-10-15', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', 'AI推理'], description: 'Ollama本地推理服务' },
  { id: 'DEV-011', name: 'NAS-MinIO', type: 'instance', endpoint: 'nas', ip: '192.168.1.200', port: 9000, status: 'running', os: 'MinIO 2024', cpu: 0, memory: 16, disk: 4096, cpuUsage: 12, memoryUsage: 25, diskUsage: 68, location: 'NAS端-本地', createdAt: '2025-11-10', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', '对象存储'], description: 'MinIO对象存储' },
  { id: 'DEV-012', name: 'NAS-Tensor-Inference', type: 'instance', endpoint: 'nas', ip: '192.168.1.200', port: 8080, status: 'error', os: 'TensorRT 9.2', cpu: 0, memory: 32, disk: 128, cpuUsage: 95, memoryUsage: 92, diskUsage: 45, location: 'NAS端-本地', createdAt: '2025-12-20', updatedAt: '2026-02-22', createdBy: 'admin', tags: ['生产', 'AI推理'], description: 'TensorRT推理引擎' },
];

// --- Audit Logs ---
const AUDIT_LOGS: AuditLog[] = [
  { id: 'AUD-001', operationType: '配置变更', operationTypeEn: 'Config Change', operationLevel: 'warning', operator: '张三', operatorId: 'U-002', operatorRole: 'system_admin', target: 'yyc3_prod', targetId: 'DEV-006', action: '修改数据库最大连接数 200→500', actionEn: 'Changed DB max connections 200→500', result: 'success', reason: '业务高峰期需增加连接池', reasonEn: 'Peak traffic requires larger pool', timestamp: '2026-02-22 14:30:25', ip: '192.168.1.50', duration: 3 },
  { id: 'AUD-002', operationType: '设备新增', operationTypeEn: 'Device Added', operationLevel: 'info', operator: '李四', operatorId: 'U-004', operatorRole: 'system_admin', target: 'yyc3-202-ECS', targetId: 'DEV-004', action: '新增ECS云服务器-202测试环境', actionEn: 'Added ECS-202 test env', result: 'success', reason: '新增测试环境', reasonEn: 'New test env', timestamp: '2026-02-22 15:45:10', ip: '47.xxx.xxx.125', duration: 45 },
  { id: 'AUD-003', operationType: '版本升级', operationTypeEn: 'Version Upgrade', operationLevel: 'critical', operator: '张三', operatorId: 'U-002', operatorRole: 'system_admin', target: 'Max-Server-Primary', targetId: 'DEV-001', action: 'Ubuntu 22.04→24.04 LTS升级', actionEn: 'Ubuntu 22.04→24.04 LTS upgrade', result: 'success', reason: '安全补丁', reasonEn: 'Security patch', timestamp: '2026-02-21 10:20:33', ip: '192.168.1.50', duration: 1800 },
  { id: 'AUD-004', operationType: '安全加固', operationTypeEn: 'Security Hardening', operationLevel: 'critical', operator: '王五', operatorId: 'U-003', operatorRole: 'security_admin', target: '所有ECS', targetId: 'BATCH', action: '更新防火墙规则', actionEn: 'Updated firewall rules', result: 'success', reason: '安全审计整改', reasonEn: 'Security audit', timestamp: '2026-02-21 11:30:55', ip: '192.168.1.60', duration: 300 },
  { id: 'AUD-005', operationType: '数据备份', operationTypeEn: 'Data Backup', operationLevel: 'info', operator: '系统', operatorId: 'SYSTEM', operatorRole: 'system', target: 'yyc3_prod', targetId: 'DEV-006', action: '每日全量备份', actionEn: 'Daily full backup', result: 'success', reason: '定时任务', reasonEn: 'Scheduled task', timestamp: '2026-02-22 02:00:00', ip: '192.168.1.100', duration: 600 },
  { id: 'AUD-006', operationType: '用户管理', operationTypeEn: 'User Management', operationLevel: 'info', operator: '管理员', operatorId: 'U-001', operatorRole: 'super_admin', target: '孙八', targetId: 'U-007', action: '新增普通用户账号', actionEn: 'Created new user account', result: 'success', reason: '团队扩充', reasonEn: 'Team expansion', timestamp: '2026-02-20 09:15:00', ip: '192.168.1.50', duration: 2 },
];

// --- Users & Roles ---
const USERS: User[] = [
  { id: 'U-001', name: '管理员', email: 'admin@yyc3.local', role: 'super_admin', status: 'active', lastLogin: '2026-02-22 14:30', avatar: 'A' },
  { id: 'U-002', name: '张三', email: 'zhangsan@yyc3.local', role: 'system_admin', status: 'active', lastLogin: '2026-02-22 15:45', avatar: 'Z' },
  { id: 'U-003', name: '王五', email: 'wangwu@yyc3.local', role: 'security_admin', status: 'active', lastLogin: '2026-02-21 11:30', avatar: 'W' },
  { id: 'U-004', name: '李四', email: 'lisi@yyc3.local', role: 'system_admin', status: 'active', lastLogin: '2026-02-22 15:45', avatar: 'L' },
  { id: 'U-005', name: '赵六', email: 'zhaoliu@yyc3.local', role: 'auditor', status: 'active', lastLogin: '2026-02-20 09:15', avatar: 'ZL' },
  { id: 'U-006', name: '钱七', email: 'qianqi@yyc3.local', role: 'business_owner', status: 'inactive', lastLogin: '2026-02-15 16:00', avatar: 'Q' },
  { id: 'U-007', name: '孙八', email: 'sunba@yyc3.local', role: 'user', status: 'active', lastLogin: '2026-02-22 10:00', avatar: 'S' },
];

const ROLES: Role[] = [
  { id: 'super_admin', name: '超级管理员', nameEn: 'Super Admin', description: '系统最高权限', descriptionEn: 'Highest system authority', userCount: 1, permissions: ['*'], color: 'from-red-500 to-orange-500' },
  { id: 'system_admin', name: '系统管理员', nameEn: 'System Admin', description: '日常运维管理', descriptionEn: 'Daily operations', userCount: 2, permissions: ['device:read','device:write','device:create','device:delete','config:read','config:write','monitor:read','audit:read'], color: 'from-blue-500 to-cyan-500' },
  { id: 'security_admin', name: '安全管理员', nameEn: 'Security Admin', description: '安全策略管理', descriptionEn: 'Security policy', userCount: 1, permissions: ['device:read','config:read','config:write:security','monitor:read','audit:read','audit:export'], color: 'from-purple-500 to-pink-500' },
  { id: 'auditor', name: '审计人员', nameEn: 'Auditor', description: '操作审计', descriptionEn: 'Operation audit', userCount: 1, permissions: ['device:read','monitor:read','audit:read','audit:export'], color: 'from-green-500 to-emerald-500' },
  { id: 'business_owner', name: '业务负责人', nameEn: 'Business Owner', description: '业务需求管理', descriptionEn: 'Business management', userCount: 1, permissions: ['device:read','monitor:read','change:request','change:approve'], color: 'from-amber-500 to-yellow-500' },
  { id: 'user', name: '普通用户', nameEn: 'User', description: '基础查看', descriptionEn: 'Basic view', userCount: 1, permissions: ['device:read','monitor:read'], color: 'from-gray-400 to-gray-500' },
];

// --- Alerts ---
const ALERTS: AlertDetail[] = [
  { id: 'ALT-001', level: 'critical', title: 'GPU推理延迟异常', titleEn: 'GPU Inference Latency Anomaly', device: 'NAS-Tensor-Inference', deviceId: 'DEV-012', metric: 'CPU Usage', value: '95%', threshold: '>90%', timestamp: '2026-02-25 14:24:15', status: 'active', assignee: '张三', chain: [
    { time: '14:20:00', event: '模型加载 Embedding v2.2', eventEn: 'Model loaded Embedding v2.2', type: 'action' },
    { time: '14:22:30', event: '推理任务 #12847 启动', eventEn: 'Inference task #12847 started', type: 'action' },
    { time: '14:24:15', event: 'CPU使用率突增至95%', eventEn: 'CPU spiked to 95%', type: 'trigger', highlight: true },
    { time: '14:24:30', event: '系统自动降低并发', eventEn: 'Auto-reduced concurrency', type: 'auto' },
  ]},
  { id: 'ALT-002', level: 'warning', title: '数据库连接数接近上限', titleEn: 'DB connections near limit', device: 'yyc3_prod', deviceId: 'DEV-006', metric: 'Connections', value: '450/500', threshold: '>400', timestamp: '2026-02-25 14:16:00', status: 'acknowledged', assignee: '张三', chain: [
    { time: '14:10:00', event: '连接数开始上升', eventEn: 'Connections rising', type: 'trigger' },
    { time: '14:16:00', event: '连接数达450', eventEn: 'Connections at 450', type: 'trigger', highlight: true },
  ]},
  { id: 'ALT-003', level: 'warning', title: 'NAS磁盘使用率过高', titleEn: 'NAS disk usage high', device: 'NAS-Server-Core', deviceId: 'DEV-002', metric: 'Disk Usage', value: '73%', threshold: '>70%', timestamp: '2026-02-25 13:45:00', status: 'acknowledged', assignee: '李四', chain: [
    { time: '13:45:00', event: '磁盘使用率突破阈值', eventEn: 'Disk usage exceeded threshold', type: 'trigger', highlight: true },
  ]},
  { id: 'ALT-004', level: 'info', title: 'SSL证书即将过期', titleEn: 'SSL cert expiring', device: 'yyc3-125-ECS', deviceId: 'DEV-003', metric: 'SSL Expiry', value: '30天', threshold: '<30天', timestamp: '2026-02-25 12:00:00', status: 'resolved', assignee: '系统', chain: [
    { time: '12:00:00', event: 'SSL证书检查', eventEn: 'SSL cert check', type: 'trigger', highlight: true },
  ]},
];

// --- Operation Logs ---
const OP_LOGS: OperationLog[] = [
  { id: 'OL-001', action: '重启 NAS-Tensor-Inference', actionEn: 'Restart NAS-Tensor-Inference', operator: '张三', target: 'DEV-012', status: 'running', timestamp: '14:32:15', duration: '进行中' },
  { id: 'OL-002', action: '数据库备份 yyc3_prod', actionEn: 'DB Backup yyc3_prod', operator: '系统', target: 'DEV-006', status: 'success', timestamp: '14:30:00', duration: '23m 45s' },
  { id: 'OL-003', action: '清理Redis缓存', actionEn: 'Clear Redis Cache', operator: '李四', target: 'DEV-009', status: 'success', timestamp: '14:15:22', duration: '2s' },
  { id: 'OL-004', action: '安全扫描 全ECS端', actionEn: 'Security Scan All ECS', operator: '王五', target: 'BATCH', status: 'queued', timestamp: '14:35:00', duration: '排队中' },
];

// ============================================================
//  Mock API 实现
// ============================================================

export const mockApi = {
  // --- Devices ---
  'GET /devices': async (params: Record<string, string> = {}) => {
    await delay();
    let filtered = [...DEVICES];
    if (params.endpoint && params.endpoint !== 'all') filtered = filtered.filter(d => d.endpoint === params.endpoint);
    if (params.type) filtered = filtered.filter(d => d.type === params.type);
    if (params.status) filtered = filtered.filter(d => d.status === params.status);
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(d => d.name.toLowerCase().includes(kw) || d.ip.includes(kw) || d.description.toLowerCase().includes(kw));
    }
    return paginated(filtered, Number(params.page) || 1, Number(params.pageSize) || 20);
  },

  'GET /devices/:id': async (id: string) => {
    await delay();
    const device = DEVICES.find(d => d.id === id);
    if (!device) throw { status: 404, message: 'Device not found' };
    return ok(device);
  },

  'GET /devices/stats': async () => {
    await delay();
    return ok({
      total: DEVICES.length,
      running: DEVICES.filter(d => d.status === 'running').length,
      stopped: DEVICES.filter(d => d.status === 'stopped').length,
      error: DEVICES.filter(d => d.status === 'error').length,
      maintenance: DEVICES.filter(d => d.status === 'maintenance').length,
      byEndpoint: { max: 5, nas: 4, ecs: 3 },
      byType: { server: 5, database: 2, instance: 5 },
    });
  },

  'PUT /devices/:id': async (id: string, data: Record<string, unknown>) => {
    await delay();
    const device = DEVICES.find(d => d.id === id);
    if (!device) throw { status: 404 };
    Object.assign(device, data, { updatedAt: new Date().toISOString().slice(0, 10) });
    return ok(device);
  },

  // --- Monitor ---
  'GET /monitor/overview': async () => {
    await delay();
    return ok({
      totalDevices: 12, runningDevices: 10, stoppedDevices: 0, errorDevices: 1, maintenanceDevices: 1,
      avgCpu: 42, avgMemory: 58, avgDisk: 50,
      alerts: ALERTS.map(a => ({ id: a.id, level: a.level, message: a.title, messageEn: a.titleEn, device: a.device, deviceId: a.deviceId, metric: a.metric, value: a.value, threshold: a.threshold, time: a.timestamp, status: a.status })),
      endpoints: [
        { name: 'Max端', cpu: 72, memory: 58, disk: 41, devices: 5 },
        { name: 'NAS端', cpu: 45, memory: 62, disk: 73, devices: 4 },
        { name: 'ECS端', cpu: 25, memory: 56, disk: 51, devices: 3 },
      ],
    } as MonitorOverview);
  },

  'GET /monitor/realtime': async () => {
    await delay(100);
    const now = Date.now();
    const data = [];
    for (let i = 30; i >= 0; i--) {
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
    return ok(data);
  },

  // --- Audit ---
  'GET /audit/logs': async (params: Record<string, string> = {}) => {
    await delay();
    let filtered = [...AUDIT_LOGS];
    if (params.operationType) filtered = filtered.filter(a => a.operationType === params.operationType);
    if (params.result) filtered = filtered.filter(a => a.result === params.result);
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(a => a.action.toLowerCase().includes(kw) || a.target.toLowerCase().includes(kw));
    }
    return paginated(filtered, Number(params.page) || 1, Number(params.pageSize) || 20);
  },

  'GET /audit/stats': async () => {
    await delay();
    return ok({ total: 6, success: 6, failed: 0, critical: 2, byType: { '配置变更': 1, '设备新增': 1, '版本升级': 1, '安全加固': 1, '数据备份': 1, '用户管理': 1 }, byOperator: { '张三': 2, '李四': 1, '王五': 1, '系统': 1, '管理员': 1 } });
  },

  // --- Permissions ---
  'GET /permissions/roles': async () => { await delay(); return ok(ROLES); },
  'GET /permissions/users': async () => { await delay(); return ok(USERS); },
  'GET /permissions/matrix': async () => {
    await delay();
    const features = ['设备信息查看','设备信息编辑','设备新增','设备退役','配置变更','实时监控查看','告警处理','操作审计查看','审计报告导出','用户管理'];
    const roles = ROLES.map(r => r.id);
    const matrix: Record<string, Record<string, boolean>> = {};
    features.forEach(f => {
      matrix[f] = {};
      roles.forEach(r => { matrix[f][r] = r === 'super_admin' ? true : Math.random() > 0.4; });
    });
    return ok({ features, roles, matrix });
  },

  // --- Operations ---
  'GET /operations/logs': async () => { await delay(); return ok(OP_LOGS); },
  'POST /operations/execute': async () => { await delay(500); return ok({ taskId: `TASK-${Date.now()}`, status: 'running' }); },

  // --- Patrol ---
  'GET /patrol/latest': async () => {
    await delay();
    const checks: PatrolCheck[] = [
      { id: 'PC-001', category: '节点', categoryEn: 'Node', name: 'Max-Server 连通性', nameEn: 'Max-Server connectivity', status: 'pass', value: '正常', threshold: '可达', detail: 'Ping 2ms', detailEn: 'Ping 2ms' },
      { id: 'PC-002', category: '节点', categoryEn: 'Node', name: 'NAS-Server 连通性', nameEn: 'NAS-Server connectivity', status: 'pass', value: '正常', threshold: '可达', detail: 'Ping 3ms', detailEn: 'Ping 3ms' },
      { id: 'PC-003', category: '存储', categoryEn: 'Storage', name: 'NAS 磁盘容量', nameEn: 'NAS disk capacity', status: 'warning', value: '73%', threshold: '<70%', detail: '接近阈值', detailEn: 'Near threshold' },
      { id: 'PC-004', category: '网络', categoryEn: 'Network', name: 'ECS 节点延迟', nameEn: 'ECS node latency', status: 'fail', value: '120ms', threshold: '<100ms', detail: '超过阈值', detailEn: 'Exceeded' },
      { id: 'PC-005', category: '安全', categoryEn: 'Security', name: 'SSL 证书有效期', nameEn: 'SSL cert validity', status: 'warning', value: '30天', threshold: '>60天', detail: '即将过期', detailEn: 'Expiring soon' },
    ];
    return ok({ id: 'PR-001', timestamp: new Date().toISOString(), type: 'auto', healthScore: 88, totalChecks: 12, passed: 9, warnings: 2, failures: 1, checks } as PatrolReport);
  },

  'POST /patrol/run': async () => { await delay(2000); return ok({ taskId: `PATROL-${Date.now()}`, status: 'completed' }); },

  // --- Alerts ---
  'GET /alerts': async (params: Record<string, string> = {}) => {
    await delay();
    let filtered = [...ALERTS];
    if (params.level) filtered = filtered.filter(a => a.level === params.level);
    if (params.status) filtered = filtered.filter(a => a.status === params.status);
    return ok(filtered);
  },

  'GET /alerts/stats': async () => {
    await delay();
    return ok({ total: 4, active: 1, acknowledged: 2, resolved: 1, critical: 1, warning: 2, info: 1 });
  },

  // --- AI ---
  'GET /ai/analysis': async () => {
    await delay();
    return ok({
      patterns: [
        { id: 'AP-001', device: 'GPU-A100-03', metric: '推理延迟', metricEn: 'Inference Latency', severity: 'critical', description: '过去1小时连续3次延迟>2000ms', descriptionEn: '3 spikes >2000ms in past hour', detectedAt: '2026-03-02 14:23:45', occurrences: 7, trend: 'increasing', confidence: 94 },
        { id: 'AP-002', device: 'NAS-Storage-01', metric: '存储容量', metricEn: 'Storage Capacity', severity: 'warning', description: '存储使用率85%', descriptionEn: 'Storage at 85%', detectedAt: '2026-03-02 13:15:00', occurrences: 1, trend: 'increasing', confidence: 88 },
      ],
      suggestions: [
        { id: 'SG-001', patternId: 'AP-001', action: '迁移模型至GPU-A100-07', actionEn: 'Migrate to GPU-A100-07', description: '当前负载15%', descriptionEn: '15% load', impact: 'high', risk: 'low', estimatedTime: '约5分钟', estimatedTimeEn: '~5min', status: 'pending', confidence: 92 },
        { id: 'SG-002', patternId: 'AP-001', action: '重启推理服务', actionEn: 'Restart inference', description: '运行72小时', descriptionEn: 'Running 72h', impact: 'medium', risk: 'medium', estimatedTime: '约2分钟', estimatedTimeEn: '~2min', status: 'pending', confidence: 85 },
      ],
      healthScores: [
        { category: '计算', categoryEn: 'Compute', score: 78 },
        { category: '存储', categoryEn: 'Storage', score: 65 },
        { category: '网络', categoryEn: 'Network', score: 72 },
        { category: '安全', categoryEn: 'Security', score: 92 },
        { category: '可用性', categoryEn: 'Availability', score: 96 },
        { category: '性能', categoryEn: 'Performance', score: 70 },
      ],
      overallScore: 79,
      analyzedAt: new Date().toISOString(),
    } as AIAnalysisResult);
  },

  'POST /ai/analyze': async () => { await delay(2500); return ok({ taskId: `AI-${Date.now()}`, status: 'completed' }); },

  // --- Files ---
  'GET /files/tree': async () => {
    await delay();
    return ok([
      { name: 'logs', path: '/logs', type: 'folder', children: [
        { name: 'node', path: '/logs/node', type: 'folder', children: [
          { name: 'GPU-A100-01', path: '/logs/node/GPU-A100-01', type: 'folder', children: [
            { name: 'inference.log', path: '/logs/node/GPU-A100-01/inference.log', type: 'file', size: 2400000, sizeFormatted: '2.3MB', modified: '2分钟前' },
            { name: 'error.log', path: '/logs/node/GPU-A100-01/error.log', type: 'file', size: 467000, sizeFormatted: '456KB', modified: '5分钟前' },
          ]},
        ]},
      ]},
      { name: 'configs', path: '/configs', type: 'folder', children: [
        { name: 'patrol.json', path: '/configs/patrol.json', type: 'file', size: 4300, sizeFormatted: '4.2KB', modified: '3小时前' },
        { name: 'alerts.json', path: '/configs/alerts.json', type: 'file', size: 3900, sizeFormatted: '3.8KB', modified: '1天前' },
      ]},
      { name: 'cache', path: '/cache', type: 'folder', children: [
        { name: 'queries', path: '/cache/queries', type: 'folder', children: [
          { name: 'result-cache.db', path: '/cache/queries/result-cache.db', type: 'file', size: 24000000, sizeFormatted: '23MB', modified: '刚刚' },
        ]},
      ]},
    ] as FileNode[]);
  },

  'GET /files/storage': async () => {
    await delay();
    return ok({
      total: 536870912, used: 244690534, free: 292180378,
      breakdown: [
        { category: 'logs', size: 29780582, formatted: '28.4MB' },
        { category: 'reports', size: 6082355, formatted: '5.8MB' },
        { category: 'backups', size: 183803084, formatted: '175.3MB' },
        { category: 'configs', size: 22630, formatted: '22.1KB' },
        { category: 'cache', size: 25061883, formatted: '23.9MB' },
      ],
    });
  },

  'POST /files/operation': async () => { await delay(1500); return ok({ taskId: `FILE-${Date.now()}`, status: 'completed', message: '操作完成' }); },

  // ============================================================
  //  Phase 3: CLI Terminal Mock
  // ============================================================
  'POST /cli/execute': async (_: any, data: { command: string }) => {
    await delay(200);
    const cmd = (data?.command || '').trim();
    if (!cmd) return ok({ output: '', outputType: 'text', exitCode: 0, duration: 1 });

    const parts = cmd.split(/\s+/);
    const base = parts[0];
    const sub = parts[1];

    if (base !== 'yyc3') {
      return ok({ output: `yyc3: command not found: ${base}\nUsage: yyc3 <command> [options]`, outputType: 'error', exitCode: 127, duration: 5 });
    }

    const handlers: Record<string, () => { output: string; outputType: string }> = {
      'status': () => ({
        output: `YYC³ Matrix Dashboard v1.0.0\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  Nodes:       12 total (10 running, 1 maintenance, 1 error)\n  CPU Avg:     42%\n  Memory Avg:  58%\n  Disk Avg:    50%\n  Alerts:      4 (1 critical, 2 warning, 1 info)\n  Uptime:      127d 14h 32m\n  Last Patrol: ${new Date().toLocaleTimeString()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        outputType: 'success'
      }),
      'node': () => {
        const target = parts[2];
        if (!target) return { output: 'DEVICE          TYPE      ENDPOINT  STATUS       CPU   MEM   DISK\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMax-Server      server    max       ● running    72%   58%   41%\nNAS-Server      server    nas       ● running    45%   62%   73%\nyyc3-125-ECS    server    ecs       ● running    35%   68%   52%\nyyc3-202-ECS    server    ecs       ◐ maintenance 12%  45%   38%\nyyc3-33-ECS     server    ecs       ● running    28%   55%   62%\nyyc3_prod       database  max       ● running    55%   72%   48%\nyyc3_analytics  database  nas       ● running    38%   55%   62%\nRedis-Master    instance  max       ● running    22%   45%   28%\nRedis-Slave     instance  max       ● running    15%   38%   25%\nOllama-Service  instance  nas       ● running    68%   78%   55%\nMinIO           instance  nas       ● running    12%   25%   68%\nTensor-Infer    instance  nas       ✗ error      95%   92%   45%', outputType: 'text' };
        const dev = DEVICES.find(d => d.name.toLowerCase().includes(target.toLowerCase()));
        if (!dev) return { output: `Error: Device "${target}" not found`, outputType: 'error' };
        return { output: `Device: ${dev.name}\n  ID:       ${dev.id}\n  Type:     ${dev.type}\n  Endpoint: ${dev.endpoint}\n  IP:       ${dev.ip}:${dev.port}\n  Status:   ${dev.status}\n  OS:       ${dev.os}\n  CPU:      ${dev.cpu} cores (${dev.cpuUsage}% used)\n  Memory:   ${dev.memory}GB (${dev.memoryUsage}% used)\n  Disk:     ${dev.disk}GB (${dev.diskUsage}% used)\n  Location: ${dev.location}\n  Tags:     ${dev.tags.join(', ')}`, outputType: 'success' };
      },
      'alerts': () => ({
        output: `ID        LEVEL     DEVICE              METRIC         STATUS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nALT-001   critical  NAS-Tensor-Infer    CPU Usage      active\nALT-002   warning   yyc3_prod           Connections    acknowledged\nALT-003   warning   NAS-Server-Core     Disk Usage     acknowledged\nALT-004   info      yyc3-125-ECS        SSL Expiry     resolved\n\nTotal: 4 alerts (1 active, 2 acknowledged, 1 resolved)`,
        outputType: 'warning'
      }),
      'patrol': () => ({
        output: `Running full patrol scan...\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  ✅ Max-Server connectivity    OK (2ms)\n  ✅ NAS-Server connectivity    OK (3ms)\n  ⚠️  NAS disk capacity         73% (threshold: 70%)\n  ❌ ECS node latency           120ms (threshold: 100ms)\n  ⚠️  SSL cert validity          30 days remaining\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  Health Score: 88%  |  Passed: 9/12  |  Warnings: 2  |  Failures: 1`,
        outputType: 'warning'
      }),
      'config': () => {
        const action = parts[2];
        const key = parts[3];
        if (action === 'get' && key) return { output: `${key} = ${key === 'patrol.interval' ? '15' : 'admin@yyc3.local'}`, outputType: 'text' };
        if (action === 'set') return { output: `Config updated: ${key} = ${parts[4] || ''}`, outputType: 'success' };
        return { output: 'patrol.interval = 15\nnotification.email = admin@yyc3.local\nalert.threshold.cpu = 80\nalert.threshold.memory = 80\nalert.threshold.disk = 70\nmonitor.interval = 5000\nws.reconnect.max = 5', outputType: 'text' };
      },
      'report': () => ({
        output: `Generating performance report...\n  Period:   Last 24 hours\n  Format:   JSON\n  Metrics:  CPU, Memory, Disk, Network\n  Devices:  12\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  Report saved to: ./reports/perf-${new Date().toISOString().slice(0,10)}.json\n  Size: 245KB`,
        outputType: 'success'
      }),
      'help': () => ({
        output: `YYC³ Dashboard CLI v1.0.0\n\nUsage: yyc3 <command> [options]\n\nCommands:\n  status              Show system overview\n  node [name]         List nodes or show node detail\n  node restart <name> Restart a specific node\n  alerts              List all alerts\n  patrol run          Execute full patrol scan\n  config              View/set configuration\n  config get <key>    Get config value\n  config set <k> <v>  Set config value\n  report              Generate performance report\n  version             Show version info\n  help                Show this help message\n\nExamples:\n  yyc3 status\n  yyc3 node Max-Server\n  yyc3 alerts --critical\n  yyc3 patrol run --full\n  yyc3 config set patrol.interval 15`,
        outputType: 'text'
      }),
      'version': () => ({
        output: 'YYC³ Dashboard CLI v1.0.0\nBuild: 2026-03-02\nRuntime: Node.js v20.11\nPlatform: darwin arm64',
        outputType: 'text'
      }),
    };

    const handler = handlers[sub || 'help'];
    if (!handler) return ok({ output: `Unknown command: yyc3 ${sub}\nRun "yyc3 help" for usage.`, outputType: 'error', exitCode: 1, duration: 3 });
    const result = handler();
    return ok({ ...result, exitCode: 0, duration: Math.floor(50 + Math.random() * 200) });
  },

  'GET /cli/autocomplete': async () => {
    await delay(50);
    return ok({
      commands: ['yyc3'],
      subcommands: {
        'yyc3': ['status', 'node', 'alerts', 'patrol', 'config', 'report', 'version', 'help'],
        'yyc3 node': ['restart', 'Max-Server', 'NAS-Server', 'yyc3-125-ECS', 'yyc3-202-ECS', 'yyc3-33-ECS'],
        'yyc3 patrol': ['run', 'history', 'schedule'],
        'yyc3 config': ['get', 'set', 'list'],
        'yyc3 report': ['--type', '--format', '--output'],
      },
      flags: {
        'yyc3 alerts': ['--unresolved', '--critical', '--warning', '--info'],
        'yyc3 node restart': ['--all', '--force', '--dry-run'],
        'yyc3 patrol run': ['--full', '--quick'],
        'yyc3 report': ['--type performance', '--type security', '--format json', '--format pdf'],
      },
    });
  },

  'GET /cli/history': async () => {
    await delay(100);
    return ok([
      { command: 'yyc3 status', timestamp: '2026-03-02 14:30:00', exitCode: 0 },
      { command: 'yyc3 node Max-Server', timestamp: '2026-03-02 14:28:00', exitCode: 0 },
      { command: 'yyc3 alerts', timestamp: '2026-03-02 14:25:00', exitCode: 0 },
      { command: 'yyc3 patrol run', timestamp: '2026-03-02 14:20:00', exitCode: 0 },
    ]);
  },

  // ============================================================
  //  Phase 3: Script Templates Mock
  // ============================================================
  'GET /scripts/templates': async () => {
    await delay();
    return ok([
      {
        id: 'SCR-001', name: '节点健康检查', nameEn: 'Node Health Check',
        description: '检查所有节点连通性、CPU/内存/磁盘使用率', descriptionEn: 'Check all node connectivity, CPU/memory/disk usage',
        language: 'bash', category: 'monitoring',
        content: '#!/bin/bash\n# YYC³ Node Health Check\necho "=== Node Health Check ==="\nfor node in ${NODES}; do\n  echo "Checking $node..."\n  ping -c 1 $node > /dev/null 2>&1\n  if [ $? -eq 0 ]; then\n    echo "  ✅ $node is reachable"\n  else\n    echo "  ❌ $node is unreachable"\n  fi\ndone\necho "=== Check Complete ==="',
        variables: [
          { name: 'NODES', label: '目标节点', labelEn: 'Target Nodes', type: 'string', default: '192.168.1.100 192.168.1.200', required: true },
        ],
        estimatedTime: '30s', risk: 'low', createdAt: '2026-01-15', updatedAt: '2026-02-20', usageCount: 45,
      },
      {
        id: 'SCR-002', name: '数据库全量备份', nameEn: 'Full Database Backup',
        description: '执行PostgreSQL全量备份并上传至NAS', descriptionEn: 'Full PostgreSQL backup and upload to NAS',
        language: 'bash', category: 'backup',
        content: '#!/bin/bash\n# YYC³ Database Backup\nBACKUP_DIR="${BACKUP_PATH}/${DB_NAME}_$(date +%Y%m%d_%H%M%S)"\nmkdir -p $BACKUP_DIR\necho "Starting backup of ${DB_NAME}..."\npg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME} > $BACKUP_DIR/dump.sql\necho "Compressing..."\ntar -czf $BACKUP_DIR.tar.gz -C $BACKUP_DIR .\nrm -rf $BACKUP_DIR\necho "Backup complete: $BACKUP_DIR.tar.gz"',
        variables: [
          { name: 'DB_NAME', label: '数据库名', labelEn: 'Database Name', type: 'select', default: 'yyc3_prod', options: ['yyc3_prod', 'yyc3_analytics'], required: true },
          { name: 'DB_HOST', label: '数据库主机', labelEn: 'DB Host', type: 'string', default: '192.168.1.100', required: true },
          { name: 'DB_PORT', label: '端口', labelEn: 'Port', type: 'number', default: '5432', required: true },
          { name: 'DB_USER', label: '用户名', labelEn: 'Username', type: 'string', default: 'yyc3_admin', required: true },
          { name: 'BACKUP_PATH', label: '备份路径', labelEn: 'Backup Path', type: 'string', default: '/backups/database', required: true },
        ],
        estimatedTime: '10-30min', risk: 'medium', createdAt: '2026-01-20', updatedAt: '2026-02-22', usageCount: 32,
      },
      {
        id: 'SCR-003', name: '模型部署流程', nameEn: 'Model Deployment Pipeline',
        description: '拉取模型→校验→部署→健康检查→切换流量', descriptionEn: 'Pull model → validate → deploy → health check → switch traffic',
        language: 'bash', category: 'deployment',
        content: '#!/bin/bash\n# YYC³ Model Deployment\necho "=== Model Deployment Pipeline ==="\necho "[1/5] Pulling model ${MODEL_NAME}..."\nsleep 2\necho "[2/5] Validating model checksum..."\nsleep 1\necho "[3/5] Deploying to ${TARGET_NODE}..."\nsleep 3\necho "[4/5] Running health check..."\nsleep 1\necho "[5/5] Switching traffic..."\nsleep 1\necho "=== Deployment Complete ==="',
        variables: [
          { name: 'MODEL_NAME', label: '模型名称', labelEn: 'Model Name', type: 'select', default: 'LLaMA-70B', options: ['LLaMA-70B', 'Embedding-v2.2', 'Whisper-Large', 'SDXL-1.0'], required: true },
          { name: 'TARGET_NODE', label: '目标节点', labelEn: 'Target Node', type: 'select', default: 'GPU-A100-01', options: ['GPU-A100-01', 'GPU-A100-02', 'GPU-A100-03'], required: true },
          { name: 'ROLLBACK', label: '失败回滚', labelEn: 'Rollback on Fail', type: 'boolean', default: 'true', required: false },
        ],
        estimatedTime: '5-15min', risk: 'high', createdAt: '2026-02-01', updatedAt: '2026-02-25', usageCount: 18,
      },
      {
        id: 'SCR-004', name: '缓存清理与预热', nameEn: 'Cache Flush & Warm-up',
        description: '清理Redis缓存并执行预热查询', descriptionEn: 'Flush Redis cache and run warm-up queries',
        language: 'python', category: 'maintenance',
        content: '#!/usr/bin/env python3\n"""YYC³ Cache Flush & Warm-up"""\nimport redis\nimport time\n\nr = redis.Redis(host="${REDIS_HOST}", port=${REDIS_PORT}, db=${REDIS_DB})\n\nprint("Flushing cache...")\nr.flushdb()\nprint(f"Cache flushed. Keys remaining: {r.dbsize()}")\n\nprint("\\nRunning warm-up queries...")\nqueries = ["user:session", "device:list", "monitor:latest"]\nfor q in queries:\n    r.set(q, f"warm_{time.time()}")\n    print(f"  Warmed: {q}")\n\nprint(f"\\nWarm-up complete. Keys: {r.dbsize()}")',
        variables: [
          { name: 'REDIS_HOST', label: 'Redis主机', labelEn: 'Redis Host', type: 'string', default: '192.168.1.100', required: true },
          { name: 'REDIS_PORT', label: 'Redis端口', labelEn: 'Redis Port', type: 'number', default: '6379', required: true },
          { name: 'REDIS_DB', label: 'DB编号', labelEn: 'DB Number', type: 'number', default: '0', required: true },
        ],
        estimatedTime: '15s', risk: 'medium', createdAt: '2026-02-10', updatedAt: '2026-02-22', usageCount: 28,
      },
      {
        id: 'SCR-005', name: '安全扫描全端点', nameEn: 'Full Endpoint Security Scan',
        description: '对所有端点执行安全扫描（端口/SSL/漏洞）', descriptionEn: 'Security scan all endpoints (ports/SSL/vulnerabilities)',
        language: 'bash', category: 'security',
        content: '#!/bin/bash\n# YYC³ Security Scan\necho "=== Full Security Scan ==="\nfor endpoint in ${ENDPOINTS}; do\n  echo "\\nScanning $endpoint..."\n  echo "  [Port Scan] checking common ports..."\n  echo "  [SSL Check] verifying certificates..."\n  echo "  [Vuln Scan] checking known CVEs..."\ndone\necho "\\n=== Scan Complete ==="',
        variables: [
          { name: 'ENDPOINTS', label: '扫描端点', labelEn: 'Scan Endpoints', type: 'string', default: '192.168.1.100 192.168.1.200 47.xxx.xxx.125', required: true },
          { name: 'SCAN_DEPTH', label: '扫描深度', labelEn: 'Scan Depth', type: 'select', default: 'standard', options: ['quick', 'standard', 'deep'], required: true },
        ],
        estimatedTime: '5-20min', risk: 'low', createdAt: '2026-02-15', updatedAt: '2026-02-28', usageCount: 12,
      },
    ] as ScriptTemplate[]);
  },

  'POST /scripts/execute': async () => {
    await delay(500);
    return ok({
      id: `EXEC-${Date.now()}`,
      scriptId: 'SCR-001',
      scriptName: '节点健康检查',
      status: 'running',
      startedAt: new Date().toISOString(),
      output: ['Starting execution...', 'Checking nodes...'],
      progress: 30,
      operator: 'admin',
    } as ScriptExecution);
  },

  'GET /scripts/executions': async () => {
    await delay();
    return ok([
      { id: 'EXEC-001', scriptId: 'SCR-001', scriptName: '节点健康检查', status: 'success', startedAt: '2026-03-02 14:00:00', completedAt: '2026-03-02 14:00:32', output: ['All 12 nodes checked', '11 healthy, 1 error'], progress: 100, operator: 'admin' },
      { id: 'EXEC-002', scriptId: 'SCR-002', scriptName: '数据库全量备份', status: 'success', startedAt: '2026-03-02 02:00:00', completedAt: '2026-03-02 02:23:45', output: ['Backup complete: 245MB'], progress: 100, operator: 'system' },
      { id: 'EXEC-003', scriptId: 'SCR-004', scriptName: '缓存清理与预热', status: 'failed', startedAt: '2026-03-01 16:30:00', completedAt: '2026-03-01 16:30:05', output: ['Connection refused: Redis not available'], progress: 10, operator: '张三' },
      { id: 'EXEC-004', scriptId: 'SCR-003', scriptName: '模型部署流程', status: 'running', startedAt: '2026-03-02 14:35:00', output: ['[1/5] Pulling model...', '[2/5] Validating...'], progress: 40, operator: 'admin' },
    ] as ScriptExecution[]);
  },

  'POST /scripts/batch': async () => {
    await delay(300);
    return ok({
      id: `BATCH-${Date.now()}`,
      name: '日常维护',
      nameEn: 'Daily Maintenance',
      scripts: ['SCR-001', 'SCR-004', 'SCR-005'],
      mode: 'sequential',
      status: 'running',
      progress: 0,
      results: [],
    } as BatchJob);
  },

  // ============================================================
  //  Phase 3: IDE Plugin View Mock
  // ============================================================
  'GET /ide/nodes': async () => {
    await delay(150);
    return ok([
      { id: 'DEV-001', name: 'Max-Server-Primary', status: 'online', cpu: 72, memory: 58, latency: 2 },
      { id: 'DEV-002', name: 'NAS-Server-Core', status: 'online', cpu: 45, memory: 62, latency: 3 },
      { id: 'DEV-003', name: 'yyc3-125-ECS', status: 'online', cpu: 35, memory: 68, latency: 45 },
      { id: 'DEV-004', name: 'yyc3-202-ECS', status: 'warning', cpu: 12, memory: 45, latency: 55 },
      { id: 'DEV-005', name: 'yyc3-33-ECS', status: 'online', cpu: 28, memory: 55, latency: 38 },
      { id: 'DEV-010', name: 'NAS-Ollama-Service', status: 'online', cpu: 68, memory: 78, latency: 5 },
      { id: 'DEV-012', name: 'NAS-Tensor-Inference', status: 'offline', cpu: 95, memory: 92, latency: 999 },
    ] as IDENodeStatus[]);
  },

  'GET /ide/summary': async () => {
    await delay(100);
    return ok({
      totalNodes: 12, onlineNodes: 10, alerts: 4,
      cpuAvg: 42, memAvg: 58, latencyAvg: 21,
    });
  },

  'POST /ide/action': async () => {
    await delay(300);
    return ok({ status: 'success', message: 'Action executed' });
  },

  // ============================================================
  //  Phase 5: Theme Customizer Mock
  // ============================================================
  'GET /theme/presets': async () => {
    await delay(100);
    return ok([
      { id: 'cyberpunk-default', name: '赛博朋克 (默认)', nameEn: 'Cyberpunk (Default)', type: 'dark' },
      { id: 'base-light', name: '基础色调', nameEn: 'Base Light', type: 'light' },
      { id: 'cosmic-night', name: '宇宙之夜', nameEn: 'Cosmic Night', type: 'dark' },
      { id: 'soft-pop', name: '柔和流行', nameEn: 'Soft Pop', type: 'light' },
      { id: 'modern-minimal', name: '现代极简', nameEn: 'Modern Minimal', type: 'light' },
      { id: 'future-tech', name: '未来科技', nameEn: 'Future Tech', type: 'dark' },
    ]);
  },

  'GET /theme/current': async () => {
    await delay(50);
    return ok({ id: 'cyberpunk-default', name: '赛博朋克 (默认)', type: 'dark', version: '2.0.0' });
  },

  'PUT /theme/apply': async () => {
    await delay(200);
    return ok({ status: 'success', message: '主题已应用' });
  },

  'POST /theme/export': async () => {
    await delay(100);
    return ok({ format: 'json', size: '2.4KB', exportedAt: new Date().toISOString() });
  },

  'POST /theme/import': async () => {
    await delay(300);
    return ok({ status: 'success', message: '主题导入成功', themeId: `custom-${Date.now()}` });
  },

  // ============================================================
  //  Phase 6.1: Cross-endpoint Comparison Mock
  // ============================================================
  'GET /monitor/comparison': async (params: Record<string, string> = {}) => {
    await delay(400);
    const range = params.range || '1h';
    const pointCount = range === 'realtime' ? 12 : range === '1h' ? 12 : range === '24h' ? 24 : 7;
    const generateTrend = (base: number, variance: number) => {
      const points = [];
      const now = Date.now();
      for (let i = pointCount; i >= 0; i--) {
        const interval = range === 'realtime' ? 5000 : range === '1h' ? 300000 : range === '24h' ? 3600000 : 86400000;
        const t = new Date(now - i * interval);
        const timeLabel = range === '7d'
          ? t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : t.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        points.push({
          time: timeLabel,
          value: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance + Math.sin(i / 3) * (variance / 3))),
        });
      }
      return points;
    };
    return ok({
      timestamp: new Date().toISOString(),
      range,
      data: {
        max: {
          endpoint: 'max', devices: 5,
          cpuAvg: 42 + Math.random() * 12, memoryAvg: 55 + Math.random() * 10, diskAvg: 40 + Math.random() * 8,
          alerts: Math.floor(Math.random() * 3),
          trend: { cpu: generateTrend(45, 15), memory: generateTrend(58, 10), disk: generateTrend(42, 6) },
        },
        nas: {
          endpoint: 'nas', devices: 4,
          cpuAvg: 58 + Math.random() * 15, memoryAvg: 65 + Math.random() * 12, diskAvg: 70 + Math.random() * 8,
          alerts: 2 + Math.floor(Math.random() * 3),
          trend: { cpu: generateTrend(62, 18), memory: generateTrend(68, 12), disk: generateTrend(72, 8) },
        },
        ecs: {
          endpoint: 'ecs', devices: 3,
          cpuAvg: 82 + Math.random() * 14, memoryAvg: 88 + Math.random() * 10, diskAvg: 55 + Math.random() * 12,
          alerts: 5 + Math.floor(Math.random() * 5),
          trend: { cpu: generateTrend(88, 10), memory: generateTrend(91, 8), disk: generateTrend(58, 14) },
        },
      },
      analysis: {
        hotspot: 'ecs',
        reason: 'ECS端 CPU/内存使用率持续超过 85%，建议关注扩容',
        reasonEn: 'ECS endpoint CPU/memory usage consistently above 85%, consider scaling',
        suggestions: [
          { zh: '建议扩容 ECS-202 实例 (当前 CPU 89%，内存 92%)', en: 'Scale up ECS-202 instance (CPU 89%, Memory 92%)' },
          { zh: '检查 ECS-205 异常进程，存在内存泄漏风险', en: 'Check ECS-205 anomalous processes, potential memory leak' },
          { zh: 'NAS端磁盘使用率 73%，建议清理过期日志和缓存', en: 'NAS disk at 73%, recommend clearing expired logs and cache' },
          { zh: 'Max端运行平稳，无需干预', en: 'Max endpoint running stable, no action needed' },
        ],
      },
    });
  },

  'POST /monitor/comparison/export': async (_: any, data: { format: string }) => {
    await delay(1500);
    const format = data?.format || 'pdf';
    return ok({
      downloadUrl: `https://cdn.yanyucloud.com/reports/comparison-${new Date().toISOString().slice(0, 10)}.${format}`,
      expires: new Date(Date.now() + 86400000).toISOString(),
      fileSize: format === 'pdf' ? '2.4MB' : '1.8MB',
    });
  },

  // ============================================================
  //  Phase 6.2: Historical Comparison & Alert Threshold Mock
  // ============================================================
  'GET /monitor/historical': async (params: Record<string, string> = {}) => {
    await delay(400);
    const period = params.period || 'week';
    const days = period === 'week' ? 7 : 30;
    const dayLabels = period === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

    const generatePeriodData = (base: { cpu: number; mem: number; disk: number; alerts: number }, variance: number) => {
      return dayLabels.slice(0, days).map((day, i) => ({
        day,
        cpu: Math.max(5, Math.min(99, base.cpu + (Math.random() - 0.5) * variance + Math.sin(i / 2) * (variance / 4))),
        memory: Math.max(5, Math.min(99, base.mem + (Math.random() - 0.5) * variance + Math.cos(i / 2) * (variance / 4))),
        disk: Math.max(5, Math.min(99, base.disk + (Math.random() - 0.3) * (variance / 2))),
        alerts: Math.max(0, Math.floor(base.alerts + (Math.random() - 0.5) * 4)),
      }));
    };

    const computeSummary = (thisW: any[], lastW: any[]) => {
      const avg = (arr: any[], key: string) => arr.reduce((s: number, d: any) => s + d[key], 0) / arr.length;
      const sum = (arr: any[], key: string) => arr.reduce((s: number, d: any) => s + d[key], 0);
      return {
        cpuAvgThis: avg(thisW, 'cpu'), cpuAvgLast: avg(lastW, 'cpu'),
        memoryAvgThis: avg(thisW, 'memory'), memoryAvgLast: avg(lastW, 'memory'),
        diskAvgThis: avg(thisW, 'disk'), diskAvgLast: avg(lastW, 'disk'),
        alertsThis: sum(thisW, 'alerts'), alertsLast: sum(lastW, 'alerts'),
      };
    };

    const maxThis = generatePeriodData({ cpu: 45, mem: 58, disk: 42, alerts: 1 }, 12);
    const maxLast = generatePeriodData({ cpu: 42, mem: 55, disk: 40, alerts: 1 }, 10);
    const nasThis = generatePeriodData({ cpu: 62, mem: 68, disk: 72, alerts: 3 }, 15);
    const nasLast = generatePeriodData({ cpu: 58, mem: 64, disk: 68, alerts: 2 }, 12);
    const ecsThis = generatePeriodData({ cpu: 88, mem: 91, disk: 58, alerts: 7 }, 8);
    const ecsLast = generatePeriodData({ cpu: 78, mem: 82, disk: 55, alerts: 4 }, 10);

    const maxSummary = computeSummary(maxThis, maxLast);
    const nasSummary = computeSummary(nasThis, nasLast);
    const ecsSummary = computeSummary(ecsThis, ecsLast);

    const getTrend = (thisVal: number, lastVal: number): 'up' | 'down' | 'stable' => {
      const diff = ((thisVal - lastVal) / lastVal) * 100;
      return Math.abs(diff) < 2 ? 'stable' : diff > 0 ? 'up' : 'down';
    };

    return ok({
      timestamp: new Date().toISOString(),
      period,
      endpoints: {
        max: { endpoint: 'max', thisWeek: maxThis, lastWeek: maxLast, summary: maxSummary },
        nas: { endpoint: 'nas', thisWeek: nasThis, lastWeek: nasLast, summary: nasSummary },
        ecs: { endpoint: 'ecs', thisWeek: ecsThis, lastWeek: ecsLast, summary: ecsSummary },
      },
      overallTrend: {
        cpu: getTrend((maxSummary.cpuAvgThis + nasSummary.cpuAvgThis + ecsSummary.cpuAvgThis) / 3,
                      (maxSummary.cpuAvgLast + nasSummary.cpuAvgLast + ecsSummary.cpuAvgLast) / 3),
        memory: getTrend((maxSummary.memoryAvgThis + nasSummary.memoryAvgThis + ecsSummary.memoryAvgThis) / 3,
                         (maxSummary.memoryAvgLast + nasSummary.memoryAvgLast + ecsSummary.memoryAvgLast) / 3),
        disk: getTrend((maxSummary.diskAvgThis + nasSummary.diskAvgThis + ecsSummary.diskAvgThis) / 3,
                       (maxSummary.diskAvgLast + nasSummary.diskAvgLast + ecsSummary.diskAvgLast) / 3),
        alerts: getTrend((maxSummary.alertsThis + nasSummary.alertsThis + ecsSummary.alertsThis) / 3,
                         (maxSummary.alertsLast + nasSummary.alertsLast + ecsSummary.alertsLast) / 3),
      },
      insights: [
        { zh: 'ECS端 CPU/内存使用率周环比分别上升 12.8% 和 11.0%，建议本周内完成扩容评估', en: 'ECS CPU/memory WoW increase 12.8%/11.0%, recommend scaling assessment this week' },
        { zh: 'NAS端磁盘使用率持续攀升 (68%→72%)，按当前趋势预计 3 周后达到 80% 告警线', en: 'NAS disk usage rising (68%→72%), projected to hit 80% alert threshold in ~3 weeks' },
        { zh: 'Max端各项指标稳定，CPU/内存波动在 5% 以内，运行状态良好', en: 'Max endpoint metrics stable, CPU/memory fluctuation within 5%, healthy status' },
        { zh: 'ECS端告警数从上周 4 次增至本周 7 次，主要集中在 CPU 高负载类型', en: 'ECS alerts increased from 4 to 7, mainly CPU high-load type' },
      ],
    });
  },

  'GET /monitor/thresholds': async () => {
    await delay(200);
    return ok({
      mode: 'independent',
      global: { cpu: 85, memory: 85, disk: 80, alertCount: 5 },
      endpoints: {
        max: { cpu: 85, memory: 85, disk: 80, alertCount: 5 },
        nas: { cpu: 80, memory: 80, disk: 70, alertCount: 5 },
        ecs: { cpu: 80, memory: 80, disk: 75, alertCount: 3 },
      },
      notifications: { email: true, webhook: false, dashboard: true },
      updatedAt: '2026-03-12T10:30:00Z',
      updatedBy: 'admin',
    });
  },

  'PUT /monitor/thresholds': async (_: any, data: any) => {
    await delay(500);
    return ok({ ...data, updatedAt: new Date().toISOString(), updatedBy: 'admin' });
  },
};

// ===== 导出工具函数 =====
export function isMockMode(): boolean {
  return API_CONFIG.TEST_MODE;
}

export function getMockHandler(method: string, path: string): ((params?: any, body?: any) => Promise<any>) | null {
  // Direct match
  const key = `${method} ${path}`;
  if ((mockApi as any)[key]) return (mockApi as any)[key];

  // Pattern match for :id style routes
  for (const routeKey of Object.keys(mockApi)) {
    const [routeMethod, routePath] = routeKey.split(' ');
    if (routeMethod !== method) continue;

    const routeParts = routePath.split('/');
    const pathParts = path.split('/');
    if (routeParts.length !== pathParts.length) continue;

    let match = true;
    const params: Record<string, string> = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      const handler = (mockApi as any)[routeKey];
      // For :id routes, pass the id as first argument
      const idParam = params['id'];
      if (idParam) {
        return (reqParams?: any, body?: any) => handler(idParam, body || reqParams);
      }
      return handler;
    }
  }

  return null;
}