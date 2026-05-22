/**
 * YYC³ API — 统一类型定义
 * 覆盖全部 9 个 DevOps 模块 + 认证
 */

// ===== 通用 =====
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  timestamp: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ===== 认证 =====
export interface LoginRequest {
  username: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

// ===== 设备管理 =====
export interface Device {
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
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DeviceListParams extends PaginationParams {
  type?: string;
  endpoint?: string;
  status?: string;
  keyword?: string;
}

export interface DeviceCreateRequest {
  name: string;
  type: 'server' | 'instance' | 'database';
  endpoint: 'max' | 'nas' | 'ecs';
  ip: string;
  port: number;
  os: string;
  cpu: number;
  memory: number;
  disk: number;
  location: string;
  tags: string[];
  description: string;
}

export interface DeviceUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DeviceBatchRequest {
  action: 'retire' | 'restart' | 'maintenance';
  ids: string[];
  reason?: string;
}

// ===== 数据监控 =====
export interface MonitorData {
  deviceId: string;
  timestamp: number;
  cpu: { usage: number; load1: number; load5: number; load15: number };
  memory: { total: number; used: number; free: number; usage: number };
  disk: { total: number; used: number; free: number; usage: number };
  network: { inBytes: number; outBytes: number; inPackets: number; outPackets: number };
  processes: number;
  connections: number;
}

export interface MonitorRealtimeParams {
  deviceId?: string;
  metrics?: string[]; // ['cpu','memory','disk','network']
}

export interface MonitorHistoryParams {
  deviceId: string;
  startTime: string; // ISO 8601
  endTime: string;
  interval: '1m' | '5m' | '15m' | '1h' | '1d';
  metrics?: string[];
}

export interface MonitorAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  messageEn: string;
  device: string;
  deviceId: string;
  metric: string;
  value: string;
  threshold: string;
  time: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface EndpointSummary {
  name: string;
  cpu: number;
  memory: number;
  disk: number;
  devices: number;
}

export interface MonitorOverview {
  totalDevices: number;
  runningDevices: number;
  stoppedDevices: number;
  errorDevices: number;
  maintenanceDevices: number;
  avgCpu: number;
  avgMemory: number;
  avgDisk: number;
  alerts: MonitorAlert[];
  endpoints: EndpointSummary[];
}

// ===== 操作审计 =====
export interface AuditLog {
  id: string;
  operationType: string;
  operationTypeEn: string;
  operationLevel: 'info' | 'warning' | 'critical';
  operator: string;
  operatorId: string;
  operatorRole: string;
  target: string;
  targetId: string;
  action: string;
  actionEn: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  result: 'success' | 'failed' | 'partial';
  reason: string;
  reasonEn: string;
  timestamp: string;
  ip: string;
  duration: number;
  userAgent?: string;
}

export interface AuditListParams extends PaginationParams {
  startTime?: string;
  endTime?: string;
  operator?: string;
  operationType?: string;
  result?: string;
  keyword?: string;
}

export interface AuditExportRequest {
  startTime: string;
  endTime: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filters?: AuditListParams;
}

// ===== 权限管理 =====
export interface Role {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  userCount: number;
  permissions: string[];
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface RoleAssignRequest {
  userId: string;
  roleId: string;
}

// ===== 操作中心 =====
export interface QuickAction {
  id: string;
  label: string;
  labelEn: string;
  category: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
}

export interface OperationTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  steps: { label: string; labelEn: string }[];
  estimatedTime: string;
  risk: 'low' | 'medium' | 'high';
  lastUsed: string;
  usageCount: number;
}

export interface OperationLog {
  id: string;
  action: string;
  actionEn: string;
  operator: string;
  target: string;
  status: 'running' | 'success' | 'failed' | 'queued';
  timestamp: string;
  duration: string;
}

export interface ExecuteOperationRequest {
  actionId: string;
  targetIds: string[];
  params?: Record<string, unknown>;
}

export interface ExecuteTemplateRequest {
  templateId: string;
  targetIds: string[];
  params?: Record<string, unknown>;
}

// ===== 巡查模式 =====
export interface PatrolCheck {
  id: string;
  category: string;
  categoryEn: string;
  name: string;
  nameEn: string;
  status: 'pass' | 'warning' | 'fail';
  value: string;
  threshold: string;
  detail: string;
  detailEn: string;
}

export interface PatrolReport {
  id: string;
  timestamp: string;
  type: 'auto' | 'manual';
  healthScore: number;
  totalChecks: number;
  passed: number;
  warnings: number;
  failures: number;
  checks: PatrolCheck[];
}

export interface PatrolSchedule {
  enabled: boolean;
  interval: number; // minutes
  lastRun: string;
  nextRun: string;
}

// ===== 一键跟进 =====
export interface AlertDetail {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  titleEn: string;
  device: string;
  deviceId: string;
  metric: string;
  value: string;
  threshold: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assignee: string;
  chain: OperationChainItem[];
}

export interface OperationChainItem {
  time: string;
  event: string;
  eventEn: string;
  type: 'trigger' | 'action' | 'auto' | 'resolve';
  highlight?: boolean;
}

export interface AlertActionRequest {
  alertId: string;
  action: 'acknowledge' | 'resolve' | 'escalate' | 'assign';
  comment?: string;
  assignee?: string;
}

// ===== AI 决策 =====
export interface AnomalyPattern {
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

export interface AISuggestion {
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

export interface HealthScore {
  category: string;
  categoryEn: string;
  score: number;
}

export interface AIAnalysisResult {
  patterns: AnomalyPattern[];
  suggestions: AISuggestion[];
  healthScores: HealthScore[];
  overallScore: number;
  analyzedAt: string;
}

export interface ApplySuggestionRequest {
  suggestionId: string;
  confirm: boolean;
}

// ===== 本地文件 =====
export interface FileNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  size?: number;
  sizeFormatted?: string;
  modified?: string;
  children?: FileNode[];
}

export interface FileContentResponse {
  path: string;
  content: string;
  encoding: string;
  size: number;
  modified: string;
}

export interface FileOperationRequest {
  action: 'download' | 'backup' | 'cleanup' | 'generate_report';
  paths?: string[];
  params?: Record<string, unknown>;
}

// ===== Phase 3: CLI Terminal =====
export interface CLICommand {
  id: string;
  command: string;
  output: string;
  outputType: 'text' | 'table' | 'json' | 'error' | 'success' | 'warning';
  timestamp: string;
  duration: number; // ms
}

export interface CLIAutoComplete {
  commands: string[];
  subcommands: Record<string, string[]>;
  flags: Record<string, string[]>;
}

export interface CLIExecuteRequest {
  command: string;
  args?: string[];
  flags?: Record<string, string>;
}

export interface CLIExecuteResponse {
  output: string;
  outputType: 'text' | 'table' | 'json' | 'error' | 'success' | 'warning';
  exitCode: number;
  duration: number;
}

// ===== Phase 3: IDE Plugin View =====
export interface IDEPanelTab {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  badge?: number;
}

export interface IDENodeStatus {
  id: string;
  name: string;
  status: 'online' | 'warning' | 'offline';
  cpu: number;
  memory: number;
  latency: number;
}

export interface IDEQuickAction {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  shortcut?: string;
}

// ===== Phase 3: Script Editor =====
export interface ScriptTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  language: 'bash' | 'python' | 'yaml';
  category: string;
  content: string;
  variables: ScriptVariable[];
  estimatedTime: string;
  risk: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface ScriptVariable {
  name: string;
  label: string;
  labelEn: string;
  type: 'string' | 'number' | 'select' | 'boolean';
  default: string;
  options?: string[];
  required: boolean;
}

export interface ScriptExecution {
  id: string;
  scriptId: string;
  scriptName: string;
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  output: string[];
  progress: number;
  operator: string;
}

export interface BatchJob {
  id: string;
  name: string;
  nameEn: string;
  scripts: string[]; // script IDs
  mode: 'sequential' | 'parallel';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  results: { scriptId: string; status: string; output: string }[];
}

export interface ScriptExecuteRequest {
  scriptId: string;
  variables?: Record<string, string>;
  targetIds?: string[];
}

export interface BatchExecuteRequest {
  jobId: string;
  mode: 'sequential' | 'parallel';
  scriptIds: string[];
  variables?: Record<string, Record<string, string>>;
}

export interface WSMessage {
  type: string;
  payload: unknown;
  timestamp?: number;
}