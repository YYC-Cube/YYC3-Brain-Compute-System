/**
 * YYC³ API — 全模块端点定义
 *
 * RESTful 路由映射，覆盖 9 个 DevOps 模块 + 认证
 * 每个端点对应后端 Controller 的一个路由
 */

import { apiClient } from './client';
import { API_CONFIG } from './config';
import type {
    // AI
    AIAnalysisResult,
    AISuggestion,
    AlertActionRequest,
    // Alert / Follow-up
    AlertDetail,
    ApiResponse,
    ApplySuggestionRequest,
    AuditExportRequest,
    AuditListParams,
    // Audit
    AuditLog,
    BatchExecuteRequest,
    BatchJob,
    CLIAutoComplete,
    // Phase 3
    CLIExecuteRequest,
    CLIExecuteResponse,
    // Device
    Device,
    DeviceBatchRequest,
    DeviceCreateRequest,
    DeviceListParams,
    DeviceUpdateRequest,
    ExecuteOperationRequest,
    ExecuteTemplateRequest,
    FileContentResponse,
    // Files
    FileNode,
    FileOperationRequest,
    IDENodeStatus,
    // Auth
    LoginRequest,
    LoginResponse,
    MonitorAlert,
    // Monitor
    MonitorData,
    MonitorHistoryParams,
    MonitorOverview,
    MonitorRealtimeParams,
    OperationLog,
    // Operation
    OperationTemplate,
    PaginatedResponse,
    // Patrol
    PatrolReport,
    PatrolSchedule,
    // Permission
    Role,
    RoleAssignRequest,
    ScriptExecuteRequest,
    ScriptExecution,
    ScriptTemplate,
    User,
    UserCreateRequest,
} from './types';

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_CONFIG.BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

// ============================================================
//  1. 认证 Auth
// ============================================================
export const authApi = {
  /** POST /auth/login — 用户登录 */
  login: (data: LoginRequest) => apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data),

  /** POST /auth/logout — 登出 */
  logout: () => apiClient.post<ApiResponse<void>>('/auth/logout'),

  /** POST /auth/refresh — 刷新 Token */
  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

  /** GET /auth/profile — 获取当前用户信息 */
  getProfile: () => apiClient.get<ApiResponse<User>>('/auth/profile'),
};

// ============================================================
//  2. 设备管理 Devices
// ============================================================
export const deviceApi = {
  /** GET /devices — 设备列表（分页、筛选） */
  list: (params?: DeviceListParams) =>
    apiClient.get<PaginatedResponse<Device>>('/devices', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  /** GET /devices/:id — 设备详情 */
  detail: (id: string) => apiClient.get<ApiResponse<Device>>(`/devices/${id}`),

  /** POST /devices — 新增设备 */
  create: (data: DeviceCreateRequest) => apiClient.post<ApiResponse<Device>>('/devices', data),

  /** PUT /devices/:id — 更新设备（可编辑字段） */
  update: (id: string, data: DeviceUpdateRequest) => apiClient.put<ApiResponse<Device>>(`/devices/${id}`, data),

  /** DELETE /devices/:id — 退役设备 */
  retire: (id: string, reason?: string) =>
    apiClient.delete<ApiResponse<void>>(`/devices/${id}`, { params: { reason } }),

  /** POST /devices/batch — 批量操作 */
  batch: (data: DeviceBatchRequest) => apiClient.post<ApiResponse<{ affected: number }>>('/devices/batch', data),

  /** GET /devices/stats — 设备统计概览 */
  stats: () =>
    apiClient.get<
      ApiResponse<{
        total: number;
        running: number;
        stopped: number;
        error: number;
        maintenance: number;
        byEndpoint: Record<string, number>;
        byType: Record<string, number>;
      }>
    >('/devices/stats'),
};

// ============================================================
//  3. 数据监控 Monitor
// ============================================================
export const monitorApi = {
  /** GET /monitor/overview — 监控总览 */
  overview: () => apiClient.get<ApiResponse<MonitorOverview>>('/monitor/overview'),

  /** GET /monitor/realtime — 实时监控数据 */
  realtime: (params?: MonitorRealtimeParams) =>
    apiClient.get<ApiResponse<MonitorData[]>>('/monitor/realtime', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  /** GET /monitor/history — 历史监控数据 */
  history: (params: MonitorHistoryParams) =>
    apiClient.get<ApiResponse<MonitorData[]>>('/monitor/history', {
      params: params as unknown as Record<string, string | number | boolean | undefined>,
    }),

  /** GET /monitor/alerts — 告警列表 */
  alerts: (params?: { level?: string; status?: string }) =>
    apiClient.get<ApiResponse<MonitorAlert[]>>('/monitor/alerts', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  /** POST /monitor/alerts/:id/acknowledge — 确认告警 */
  acknowledgeAlert: (id: string) => apiClient.post<ApiResponse<void>>(`/monitor/alerts/${id}/acknowledge`),

  /** POST /monitor/alerts/:id/resolve — 解决告警 */
  resolveAlert: (id: string, comment?: string) =>
    apiClient.post<ApiResponse<void>>(`/monitor/alerts/${id}/resolve`, { comment }),

  /** GET /monitor/timeseries — 时间序列数据（供图表用） */
  timeseries: (params: { deviceId?: string; metric: string; period: string }) =>
    apiClient.get<ApiResponse<Array<{ time: string; value: number }>>>('/monitor/timeseries', { params }),

  /**
   * WebSocket 端点: ws://192.168.3.100:3118/api/v1/ws?subscribe=monitor
   * 推送格式: { type: 'monitor', payload: MonitorData, timestamp: number }
   */
};

// ============================================================
//  4. 操作审计 Audit
// ============================================================
export const auditApi = {
  /** GET /audit/logs — 审计日志列表 */
  list: (params?: AuditListParams) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/audit/logs', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  /** GET /audit/logs/:id — 审计详情 */
  detail: (id: string) => apiClient.get<ApiResponse<AuditLog>>(`/audit/logs/${id}`),

  /** POST /audit/export — 导出审计报告 */
  export: (data: AuditExportRequest) =>
    apiClient.post<ApiResponse<{ downloadUrl: string; expiresAt: string }>>('/audit/export', data),

  /** GET /audit/stats — 审计统计 */
  stats: (params?: { startTime?: string; endTime?: string }) =>
    apiClient.get<
      ApiResponse<{
        total: number;
        success: number;
        failed: number;
        critical: number;
        byType: Record<string, number>;
        byOperator: Record<string, number>;
      }>
    >('/audit/stats', { params }),
};

// ============================================================
//  5. 权限管理 Permissions
// ============================================================
export const permissionApi = {
  /** GET /permissions/roles — 角色列表 */
  listRoles: () => apiClient.get<ApiResponse<Role[]>>('/permissions/roles'),

  /** GET /permissions/roles/:id — 角色详情 */
  roleDetail: (id: string) => apiClient.get<ApiResponse<Role>>(`/permissions/roles/${id}`),

  /** POST /permissions/roles — 创建角色 */
  createRole: (data: Partial<Role>) => apiClient.post<ApiResponse<Role>>('/permissions/roles', data),

  /** PUT /permissions/roles/:id — 更新角色 */
  updateRole: (id: string, data: Partial<Role>) => apiClient.put<ApiResponse<Role>>(`/permissions/roles/${id}`, data),

  /** DELETE /permissions/roles/:id — 删除角色 */
  deleteRole: (id: string) => apiClient.delete<ApiResponse<void>>(`/permissions/roles/${id}`),

  /** GET /permissions/users — 用户列表 */
  listUsers: (params?: { role?: string; status?: string; keyword?: string }) =>
    apiClient.get<ApiResponse<User[]>>('/permissions/users', { params }),

  /** POST /permissions/users — 创建用户 */
  createUser: (data: UserCreateRequest) => apiClient.post<ApiResponse<User>>('/permissions/users', data),

  /** PUT /permissions/users/:id — 更新用户 */
  updateUser: (id: string, data: Partial<User>) => apiClient.put<ApiResponse<User>>(`/permissions/users/${id}`, data),

  /** POST /permissions/users/:id/assign-role — 分配角色 */
  assignRole: (data: RoleAssignRequest) =>
    apiClient.post<ApiResponse<void>>(`/permissions/users/${data.userId}/assign-role`, data),

  /** GET /permissions/matrix — 权限矩阵 */
  matrix: () =>
    apiClient.get<
      ApiResponse<{
        features: string[];
        roles: string[];
        matrix: Record<string, Record<string, boolean>>;
      }>
    >('/permissions/matrix'),
};

// ============================================================
//  6. 操作中心 Operations
// ============================================================
export const operationApi = {
  /** GET /operations/actions — 快速操作列表 */
  listActions: () =>
    apiClient.get<
      ApiResponse<
        {
          id: string;
          label: string;
          labelEn: string;
          category: string;
          description: string;
          descriptionEn: string;
          icon: string;
          color: string;
        }[]
      >
    >('/operations/actions'),

  /** POST /operations/execute — 执行操作 */
  execute: (data: ExecuteOperationRequest) =>
    apiClient.post<ApiResponse<{ taskId: string; status: string }>>('/operations/execute', data),

  /** GET /operations/templates — 操作模板列表 */
  listTemplates: () => apiClient.get<ApiResponse<OperationTemplate[]>>('/operations/templates'),

  /** POST /operations/templates/:id/execute — 执行模板 */
  executeTemplate: (data: ExecuteTemplateRequest) =>
    apiClient.post<ApiResponse<{ taskId: string; status: string }>>(
      `/operations/templates/${data.templateId}/execute`,
      data
    ),

  /** POST /operations/templates — 创建模板 */
  createTemplate: (data: Partial<OperationTemplate>) =>
    apiClient.post<ApiResponse<OperationTemplate>>('/operations/templates', data),

  /** GET /operations/logs — 操作日志 */
  logs: (params?: { status?: string; operator?: string; limit?: number }) =>
    apiClient.get<ApiResponse<OperationLog[]>>('/operations/logs', { params }),

  /** GET /operations/tasks/:id — 任务状态 */
  taskStatus: (taskId: string) =>
    apiClient.get<ApiResponse<{ taskId: string; status: string; progress: number; result?: unknown }>>(
      `/operations/tasks/${taskId}`
    ),

  /**
   * WebSocket 端点: ws://192.168.3.100:3118/api/v1/ws?subscribe=operation
   * 推送格式: { type: 'operation', payload: OperationLog, timestamp: number }
   */
};

// ============================================================
//  7. 巡查模式 Patrol
// ============================================================
export const patrolApi = {
  /** GET /patrol/latest — 最新巡查报告 */
  latest: () => apiClient.get<ApiResponse<PatrolReport>>('/patrol/latest'),

  /** GET /patrol/history — 巡查历史 */
  history: (params?: { limit?: number; type?: string }) =>
    apiClient.get<ApiResponse<PatrolReport[]>>('/patrol/history', { params }),

  /** POST /patrol/run — 手动触发巡查 */
  run: (params?: { scope?: 'full' | 'quick' }) =>
    apiClient.post<ApiResponse<{ taskId: string; status: string }>>('/patrol/run', params),

  /** GET /patrol/schedule — 获取巡查计划 */
  getSchedule: () => apiClient.get<ApiResponse<PatrolSchedule>>('/patrol/schedule'),

  /** PUT /patrol/schedule — 更新巡查计划 */
  updateSchedule: (data: Partial<PatrolSchedule>) =>
    apiClient.put<ApiResponse<PatrolSchedule>>('/patrol/schedule', data),

  /** GET /patrol/trend — 健康趋势 */
  trend: (params?: { period?: '24h' | '7d' | '30d' }) =>
    apiClient.get<ApiResponse<Array<{ timestamp: string; score: number; checks: number }>>>('/patrol/trend', {
      params,
    }),

  /**
   * WebSocket 端点: ws://192.168.3.100:3118/api/v1/ws?subscribe=patrol
   * 推送格式: { type: 'patrol', payload: PatrolReport, timestamp: number }
   */
};

// ============================================================
//  8. 一键跟进 Alerts / Follow-up
// ============================================================
export const alertApi = {
  /** GET /alerts — 告警列表 */
  list: (params?: { level?: string; status?: string; keyword?: string }) =>
    apiClient.get<ApiResponse<AlertDetail[]>>('/alerts', { params }),

  /** GET /alerts/:id — 告警详情（含操作链路） */
  detail: (id: string) => apiClient.get<ApiResponse<AlertDetail>>(`/alerts/${id}`),

  /** POST /alerts/:id/action — 告警操作（确认/解决/升级/指派） */
  action: (data: AlertActionRequest) => apiClient.post<ApiResponse<void>>(`/alerts/${data.alertId}/action`, data),

  /** GET /alerts/stats — 告警统计 */
  stats: () =>
    apiClient.get<
      ApiResponse<{
        total: number;
        active: number;
        acknowledged: number;
        resolved: number;
        critical: number;
        warning: number;
        info: number;
      }>
    >('/alerts/stats'),

  /**
   * WebSocket 端点: ws://192.168.3.100:3118/api/v1/ws?subscribe=alert
   * 推送格式: { type: 'alert', payload: WSAlertPayload, timestamp: number }
   */
};

// ============================================================
//  9. AI 辅助决策
// ============================================================
export const aiApi = {
  /** GET /ai/analysis — 获取最新 AI 分析结果 */
  getAnalysis: () => apiClient.get<ApiResponse<AIAnalysisResult>>('/ai/analysis'),

  /** POST /ai/analyze — 触发重新分析 */
  reanalyze: () => apiClient.post<ApiResponse<{ taskId: string; status: string }>>('/ai/analyze'),

  /** POST /ai/suggestions/:id/apply — 应用建议 */
  applySuggestion: (data: ApplySuggestionRequest) =>
    apiClient.post<ApiResponse<AISuggestion>>(`/ai/suggestions/${data.suggestionId}/apply`, data),

  /** POST /ai/suggestions/:id/dismiss — 忽略建议 */
  dismissSuggestion: (id: string) => apiClient.post<ApiResponse<void>>(`/ai/suggestions/${id}/dismiss`),

  /** GET /ai/health — 健康评估数据 */
  health: () =>
    apiClient.get<
      ApiResponse<{ scores: Array<{ category: string; categoryEn: string; score: number }>; overall: number }>
    >('/ai/health'),

  /** GET /ai/trends — 异常趋势数据 */
  trends: (params?: { period?: '24h' | '7d' }) =>
    apiClient.get<ApiResponse<Array<{ time: string; anomalies: number; resolved: number; score: number }>>>(
      '/ai/trends',
      { params }
    ),
};

// ============================================================
//  10. 本地文件管理
// ============================================================
export const fileApi = {
  /** GET /files/tree — 文件树结构 */
  tree: (path?: string) => apiClient.get<ApiResponse<FileNode[]>>('/files/tree', { params: { path } }),

  /** GET /files/content — 文件内容 */
  content: (path: string) => apiClient.get<ApiResponse<FileContentResponse>>('/files/content', { params: { path } }),

  /** POST /files/operation — 文件操作（下载/备份/清理/生成报告） */
  operation: (data: FileOperationRequest) =>
    apiClient.post<ApiResponse<{ taskId: string; status: string; message: string }>>('/files/operation', data),

  /** GET /files/storage — 存储使用统计 */
  storage: () =>
    apiClient.get<
      ApiResponse<{
        total: number;
        used: number;
        free: number;
        breakdown: Array<{ category: string; size: number; formatted: string }>;
      }>
    >('/files/storage'),

  /** GET /files/download/:path — 下载文件 */
  download: (filePath: string, filename: string) => {
    const url = buildUrl('/files/download', { path: filePath });
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  },
};

// ============================================================
//  11. CLI 终端 (Phase 3)
// ============================================================
export const cliApi = {
  /** POST /cli/execute — 执行 CLI 命令 */
  execute: (data: CLIExecuteRequest) => apiClient.post<ApiResponse<CLIExecuteResponse>>('/cli/execute', data),

  /** GET /cli/autocomplete — 获取自动补全数据 */
  autocomplete: () => apiClient.get<ApiResponse<CLIAutoComplete>>('/cli/autocomplete'),

  /** GET /cli/history — 获取命令历史 */
  history: (params?: { limit?: number }) =>
    apiClient.get<ApiResponse<Array<{ command: string; timestamp: string; exitCode: number }>>>('/cli/history', {
      params,
    }),

  /** DELETE /cli/history — 清除命令历�� */
  clearHistory: () => apiClient.delete<ApiResponse<void>>('/cli/history'),
};

// ============================================================
//  12. 脚本化操作 (Phase 3)
// ============================================================
export const scriptApi = {
  /** GET /scripts/templates — 脚本模板列表 */
  listTemplates: () => apiClient.get<ApiResponse<ScriptTemplate[]>>('/scripts/templates'),

  /** GET /scripts/templates/:id — 脚本模板详情 */
  templateDetail: (id: string) => apiClient.get<ApiResponse<ScriptTemplate>>(`/scripts/templates/${id}`),

  /** POST /scripts/templates — 创建脚本模板 */
  createTemplate: (data: Partial<ScriptTemplate>) =>
    apiClient.post<ApiResponse<ScriptTemplate>>('/scripts/templates', data),

  /** PUT /scripts/templates/:id — 更新脚本模板 */
  updateTemplate: (id: string, data: Partial<ScriptTemplate>) =>
    apiClient.put<ApiResponse<ScriptTemplate>>(`/scripts/templates/${id}`, data),

  /** DELETE /scripts/templates/:id — 删除脚本模板 */
  deleteTemplate: (id: string) => apiClient.delete<ApiResponse<void>>(`/scripts/templates/${id}`),

  /** POST /scripts/execute — 执行脚本 */
  execute: (data: ScriptExecuteRequest) => apiClient.post<ApiResponse<ScriptExecution>>('/scripts/execute', data),

  /** GET /scripts/executions — 执行历史 */
  executions: (params?: { status?: string; limit?: number }) =>
    apiClient.get<ApiResponse<ScriptExecution[]>>('/scripts/executions', { params }),

  /** GET /scripts/executions/:id — 执行详情 */
  executionDetail: (id: string) => apiClient.get<ApiResponse<ScriptExecution>>(`/scripts/executions/${id}`),

  /** POST /scripts/batch — 批量执行 */
  batchExecute: (data: BatchExecuteRequest) => apiClient.post<ApiResponse<BatchJob>>('/scripts/batch', data),

  /** GET /scripts/batch/:id — 批量任务状态 */
  batchStatus: (id: string) => apiClient.get<ApiResponse<BatchJob>>(`/scripts/batch/${id}`),
};

// ============================================================
//  13. IDE 插件视图 (Phase 3)
// ============================================================
export const ideApi = {
  /** GET /ide/nodes — IDE 面板节点状态 */
  nodes: () => apiClient.get<ApiResponse<IDENodeStatus[]>>('/ide/nodes'),

  /** GET /ide/summary — IDE 面板概览数据 */
  summary: () =>
    apiClient.get<
      ApiResponse<{
        totalNodes: number;
        onlineNodes: number;
        alerts: number;
        cpuAvg: number;
        memAvg: number;
        latencyAvg: number;
      }>
    >('/ide/summary'),

  /** POST /ide/action — IDE 快速操作 */
  action: (data: { actionId: string; targetId?: string }) =>
    apiClient.post<ApiResponse<{ status: string; message: string }>>('/ide/action', data),
};
