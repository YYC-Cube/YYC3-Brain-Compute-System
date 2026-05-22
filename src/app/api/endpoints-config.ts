/**
 * YYC3 Brain Computer System — Real API Endpoint Configuration
 * 
 * Production endpoint mapping for all 14 API modules.
 * 
 * Usage:
 *   1. Set TEST_MODE: false in /api/config.ts
 *   2. Update BASE_URL to your actual backend address
 *   3. Ensure backend implements all endpoints below
 *   4. Configure JWT tokens via AUTH_CONFIG
 * 
 * Backend Stack: Node.js (Express/Koa) or Python (FastAPI)
 * Database: PostgreSQL 15 + Redis 7.2
 * Real-time: WebSocket (ws://...)
 * 
 * Deployment: Local closed-loop (192.168.3.x:3118)
 */

// ============================================================
//  Endpoint Registry — All REST + WebSocket routes
// ============================================================

export const ENDPOINT_REGISTRY = {

  // ──────────────────────────────────────────────────────
  //  1. Auth (认证)
  // ──────────────────────────────────────────────────────
  auth: {
    login:       { method: 'POST', path: '/auth/login',      description: '用户登录 / User login',      auth: false },
    logout:      { method: 'POST', path: '/auth/logout',     description: '用户登出 / User logout',     auth: true },
    refresh:     { method: 'POST', path: '/auth/refresh',    description: '刷新Token / Refresh token',  auth: false },
    getProfile:  { method: 'GET',  path: '/auth/profile',    description: '获取用户信息 / Get profile', auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  2. Devices (设备管理)
  // ──────────────────────────────────────────────────────
  devices: {
    list:    { method: 'GET',    path: '/devices',           description: '设备列表(分页) / Device list (paginated)',  auth: true,  params: ['page','pageSize','type','endpoint','status','keyword'] },
    detail:  { method: 'GET',    path: '/devices/:id',       description: '设备详情 / Device detail',                   auth: true },
    create:  { method: 'POST',   path: '/devices',           description: '新增设备 / Create device',                   auth: true,  roles: ['super_admin','system_admin'] },
    update:  { method: 'PUT',    path: '/devices/:id',       description: '更新设备 / Update device',                   auth: true,  roles: ['super_admin','system_admin'] },
    retire:  { method: 'DELETE', path: '/devices/:id',       description: '退役设备 / Retire device',                   auth: true,  roles: ['super_admin','system_admin'] },
    batch:   { method: 'POST',   path: '/devices/batch',     description: '批量操作 / Batch operation',                 auth: true,  roles: ['super_admin','system_admin'] },
    stats:   { method: 'GET',    path: '/devices/stats',     description: '设备统计 / Device statistics',               auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  3. Monitor (数据监控)
  // ──────────────────────────────────────────────────────
  monitor: {
    overview:       { method: 'GET',  path: '/monitor/overview',               description: '监控总览 / Monitor overview',          auth: true },
    realtime:       { method: 'GET',  path: '/monitor/realtime',               description: '实时数据 / Realtime data',             auth: true,  params: ['deviceId','metrics'] },
    history:        { method: 'GET',  path: '/monitor/history',                description: '历史数据 / Historical data',           auth: true,  params: ['deviceId','startTime','endTime','interval','metrics'] },
    alerts:         { method: 'GET',  path: '/monitor/alerts',                 description: '告警列表 / Alert list',                auth: true,  params: ['level','status'] },
    acknowledgeAlert: { method: 'POST', path: '/monitor/alerts/:id/acknowledge', description: '确认告警 / Acknowledge alert',       auth: true,  roles: ['super_admin','system_admin','security_admin'] },
    resolveAlert:   { method: 'POST', path: '/monitor/alerts/:id/resolve',     description: '解决告警 / Resolve alert',             auth: true,  roles: ['super_admin','system_admin','security_admin'] },
    timeseries:     { method: 'GET',  path: '/monitor/timeseries',             description: '时间序列 / Time series',               auth: true,  params: ['deviceId','metric','period'] },
    // Phase 6.1: Cross-endpoint comparison
    comparison:     { method: 'GET',  path: '/monitor/comparison',             description: '跨端对比 / Cross-endpoint comparison',  auth: true,  params: ['endpoints','range'] },
    comparisonExport: { method: 'POST', path: '/monitor/comparison/export',    description: '导出对比报告 / Export comparison report', auth: true, roles: ['super_admin','system_admin','auditor'] },
    // Phase 6.2: Historical comparison & Alert thresholds
    historical:     { method: 'GET',  path: '/monitor/historical',             description: '历史对比 / Historical comparison',        auth: true,  params: ['period'] },
    getThresholds:  { method: 'GET',  path: '/monitor/thresholds',             description: '获取告警阈值 / Get alert thresholds',     auth: true },
    updateThresholds: { method: 'PUT', path: '/monitor/thresholds',            description: '更新告警阈值 / Update alert thresholds',  auth: true, roles: ['super_admin','system_admin'] },
    // WebSocket
    ws_monitor:     { method: 'WS',   path: '/ws?subscribe=monitor',           description: '实时监控推送 / Realtime monitor push', auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  4. Audit (操作审计)
  // ──────────────────────────────────────────────────────
  audit: {
    list:    { method: 'GET',  path: '/audit/logs',           description: '审计日志列表 / Audit log list',  auth: true,  params: ['page','pageSize','startTime','endTime','operator','operationType','result','keyword'] },
    detail:  { method: 'GET',  path: '/audit/logs/:id',       description: '审计详情 / Audit detail',        auth: true },
    export:  { method: 'POST', path: '/audit/export',         description: '导出审计报告 / Export report',   auth: true,  roles: ['super_admin','security_admin','auditor'] },
    stats:   { method: 'GET',  path: '/audit/stats',          description: '审计统计 / Audit statistics',    auth: true,  params: ['startTime','endTime'] },
  },

  // ──────────────────────────────────────────────────────
  //  5. Permissions (权限管理)
  // ──────────────────────────────────────────────────────
  permissions: {
    listRoles:     { method: 'GET',    path: '/permissions/roles',                   description: '角色列表 / Role list',              auth: true },
    roleDetail:    { method: 'GET',    path: '/permissions/roles/:id',               description: '角色详情 / Role detail',             auth: true },
    createRole:    { method: 'POST',   path: '/permissions/roles',                   description: '创建角色 / Create role',             auth: true,  roles: ['super_admin'] },
    updateRole:    { method: 'PUT',    path: '/permissions/roles/:id',               description: '更新角色 / Update role',             auth: true,  roles: ['super_admin'] },
    deleteRole:    { method: 'DELETE', path: '/permissions/roles/:id',               description: '删除角色 / Delete role',             auth: true,  roles: ['super_admin'] },
    listUsers:     { method: 'GET',    path: '/permissions/users',                   description: '用户列表 / User list',              auth: true,  params: ['role','status','keyword'] },
    createUser:    { method: 'POST',   path: '/permissions/users',                   description: '创建用户 / Create user',             auth: true,  roles: ['super_admin'] },
    updateUser:    { method: 'PUT',    path: '/permissions/users/:id',               description: '更新用户 / Update user',             auth: true,  roles: ['super_admin'] },
    assignRole:    { method: 'POST',   path: '/permissions/users/:id/assign-role',   description: '分配角色 / Assign role',             auth: true,  roles: ['super_admin'] },
    matrix:        { method: 'GET',    path: '/permissions/matrix',                  description: '权限矩阵 / Permission matrix',      auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  6. Operations (操作中心)
  // ──────────────────────────────────────────────────────
  operations: {
    listActions:    { method: 'GET',  path: '/operations/actions',                    description: '快速操作列表 / Quick actions',       auth: true },
    execute:        { method: 'POST', path: '/operations/execute',                    description: '执行操作 / Execute action',          auth: true,  roles: ['super_admin','system_admin'] },
    listTemplates:  { method: 'GET',  path: '/operations/templates',                  description: '操作模板列表 / Template list',       auth: true },
    executeTemplate: { method: 'POST', path: '/operations/templates/:id/execute',     description: '执行模板 / Execute template',        auth: true,  roles: ['super_admin','system_admin'] },
    createTemplate: { method: 'POST', path: '/operations/templates',                  description: '创建模板 / Create template',         auth: true,  roles: ['super_admin','system_admin'] },
    logs:           { method: 'GET',  path: '/operations/logs',                       description: '操作日志 / Operation logs',          auth: true,  params: ['status','operator','limit'] },
    taskStatus:     { method: 'GET',  path: '/operations/tasks/:id',                  description: '任务状态 / Task status',             auth: true },
    // WebSocket
    ws_operation:   { method: 'WS',   path: '/ws?subscribe=operation',                description: '操作推送 / Operation push',          auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  7. Patrol (巡查模式)
  // ──────────────────────────────────────────────────────
  patrol: {
    latest:         { method: 'GET',  path: '/patrol/latest',                         description: '最新巡查报告 / Latest report',      auth: true },
    history:        { method: 'GET',  path: '/patrol/history',                        description: '巡查历史 / Patrol history',          auth: true,  params: ['limit','type'] },
    run:            { method: 'POST', path: '/patrol/run',                            description: '触发巡查 / Trigger patrol',          auth: true,  roles: ['super_admin','system_admin','security_admin'] },
    getSchedule:    { method: 'GET',  path: '/patrol/schedule',                       description: '获取巡查计划 / Get schedule',        auth: true },
    updateSchedule: { method: 'PUT',  path: '/patrol/schedule',                       description: '更新巡查计划 / Update schedule',     auth: true,  roles: ['super_admin','system_admin'] },
    trend:          { method: 'GET',  path: '/patrol/trend',                          description: '健康趋势 / Health trend',            auth: true,  params: ['period'] },
    // WebSocket
    ws_patrol:      { method: 'WS',   path: '/ws?subscribe=patrol',                   description: '巡查推送 / Patrol push',             auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  8. Alerts / Follow-up (一键跟进)
  // ──────────────────────────────────────────────────────
  alerts: {
    list:    { method: 'GET',  path: '/alerts',                      description: '告警列表 / Alert list',           auth: true,  params: ['level','status','keyword'] },
    detail:  { method: 'GET',  path: '/alerts/:id',                  description: '告警详情(含操作链路) / Detail',    auth: true },
    action:  { method: 'POST', path: '/alerts/:id/action',           description: '告警操作 / Alert action',          auth: true,  roles: ['super_admin','system_admin','security_admin'] },
    stats:   { method: 'GET',  path: '/alerts/stats',                description: '告警统计 / Alert stats',           auth: true },
    // WebSocket
    ws_alert: { method: 'WS',  path: '/ws?subscribe=alert',          description: '告警推送 / Alert push',            auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  9. AI (AI辅助决策)
  // ──────────────────────────────────────────────────────
  ai: {
    getAnalysis:      { method: 'GET',  path: '/ai/analysis',                    description: 'AI分析结果 / AI analysis result',    auth: true },
    reanalyze:        { method: 'POST', path: '/ai/analyze',                     description: '触发重新分析 / Trigger re-analyze',  auth: true },
    applySuggestion:  { method: 'POST', path: '/ai/suggestions/:id/apply',       description: '应用建议 / Apply suggestion',        auth: true,  roles: ['super_admin','system_admin'] },
    dismissSuggestion: { method: 'POST', path: '/ai/suggestions/:id/dismiss',    description: '忽略建议 / Dismiss suggestion',      auth: true },
    health:           { method: 'GET',  path: '/ai/health',                      description: '健康评估 / Health assessment',        auth: true },
    trends:           { method: 'GET',  path: '/ai/trends',                      description: '异常趋势 / Anomaly trends',          auth: true,  params: ['period'] },
  },

  // ──────────────────────────────────────────────────────
  //  10. Files (本地文件管理)
  // ──────────────────────────────────────────────────────
  files: {
    tree:      { method: 'GET',  path: '/files/tree',                  description: '文件树 / File tree',               auth: true,  params: ['path'] },
    content:   { method: 'GET',  path: '/files/content',               description: '文件内容 / File content',           auth: true,  params: ['path'] },
    operation: { method: 'POST', path: '/files/operation',             description: '文件操作 / File operation',         auth: true,  roles: ['super_admin','system_admin'] },
    storage:   { method: 'GET',  path: '/files/storage',               description: '存储统计 / Storage stats',          auth: true },
    download:  { method: 'GET',  path: '/files/download',              description: '下载文件 / Download file',          auth: true,  params: ['path'] },
  },

  // ──────────────────────────────────────────────────────
  //  11. CLI Terminal (Phase 3)
  // ─────────────────────────────────────────────────────
  cli: {
    execute:      { method: 'POST',   path: '/cli/execute',            description: '执行CLI命令 / Execute CLI command', auth: true },
    autocomplete: { method: 'GET',    path: '/cli/autocomplete',       description: '自动补全数据 / Autocomplete data',  auth: true },
    history:      { method: 'GET',    path: '/cli/history',            description: '命令历史 / Command history',         auth: true,  params: ['limit'] },
    clearHistory: { method: 'DELETE', path: '/cli/history',            description: '清除历史 / Clear history',           auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  12. Scripts (Phase 3 脚本化操作)
  // ──────────────────────────────────────────────────────
  scripts: {
    listTemplates:    { method: 'GET',    path: '/scripts/templates',           description: '脚本模板列表 / Script templates',      auth: true },
    templateDetail:   { method: 'GET',    path: '/scripts/templates/:id',       description: '模板详情 / Template detail',            auth: true },
    createTemplate:   { method: 'POST',   path: '/scripts/templates',           description: '创建模板 / Create template',            auth: true,  roles: ['super_admin','system_admin'] },
    updateTemplate:   { method: 'PUT',    path: '/scripts/templates/:id',       description: '更新模板 / Update template',            auth: true,  roles: ['super_admin','system_admin'] },
    deleteTemplate:   { method: 'DELETE', path: '/scripts/templates/:id',       description: '删除模板 / Delete template',            auth: true,  roles: ['super_admin'] },
    execute:          { method: 'POST',   path: '/scripts/execute',             description: '执行脚本 / Execute script',             auth: true,  roles: ['super_admin','system_admin'] },
    executions:       { method: 'GET',    path: '/scripts/executions',          description: '执行历史 / Execution history',          auth: true,  params: ['status','limit'] },
    executionDetail:  { method: 'GET',    path: '/scripts/executions/:id',      description: '执行详情 / Execution detail',           auth: true },
    batchExecute:     { method: 'POST',   path: '/scripts/batch',              description: '批量执行 / Batch execute',              auth: true,  roles: ['super_admin','system_admin'] },
    batchStatus:      { method: 'GET',    path: '/scripts/batch/:id',          description: '批量状态 / Batch status',               auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  13. IDE Plugin View (Phase 3)
  // ──────────────────────────────────────────────────────
  ide: {
    nodes:    { method: 'GET',  path: '/ide/nodes',           description: 'IDE节点状态 / IDE node status',     auth: true },
    summary:  { method: 'GET',  path: '/ide/summary',         description: 'IDE概览数据 / IDE summary',          auth: true },
    action:   { method: 'POST', path: '/ide/action',          description: 'IDE快速操作 / IDE quick action',     auth: true },
  },

  // ──────────────────────────────────────────────────────
  //  14. Theme Customizer (Phase 5 + 5.5)
  // ──────────────────────────────────────────────────────
  theme: {
    presets:         { method: 'GET',    path: '/theme/presets',          description: '预设主题列表 / Preset theme list',         auth: true },
    current:         { method: 'GET',    path: '/theme/current',          description: '当前主题 / Current theme',                 auth: true },
    apply:           { method: 'PUT',    path: '/theme/apply',            description: '应用主题 / Apply theme',                   auth: true },
    export_:         { method: 'POST',   path: '/theme/export',           description: '导出主题 / Export theme',                  auth: true },
    import_:         { method: 'POST',   path: '/theme/import',           description: '导入主题 / Import theme',                  auth: true },
    // Phase 5.5: Font upload, background, snapshots
    listFonts:       { method: 'GET',    path: '/theme/fonts',            description: '自定义字体列表 / Custom font list',        auth: true },
    uploadFont:      { method: 'POST',   path: '/theme/fonts/upload',     description: '上传字体 / Upload font',                   auth: true },
    deleteFont:      { method: 'DELETE', path: '/theme/fonts/:id',        description: '删除字体 / Delete font',                   auth: true },
    getBackground:   { method: 'GET',    path: '/theme/background',       description: '获取背景配置 / Get background config',     auth: true },
    updateBackground:{ method: 'PUT',    path: '/theme/background',       description: '更新背景 / Update background',             auth: true },
    listSnapshots:   { method: 'GET',    path: '/theme/snapshots',        description: '快照列表 / Snapshot list',                 auth: true },
    createSnapshot:  { method: 'POST',   path: '/theme/snapshots',        description: '创建快照 / Create snapshot',               auth: true },
    restoreSnapshot: { method: 'POST',   path: '/theme/snapshots/:id/restore', description: '恢复快照 / Restore snapshot',         auth: true },
    deleteSnapshot:  { method: 'DELETE', path: '/theme/snapshots/:id',    description: '删除快照 / Delete snapshot',               auth: true },
  },

} as const;


// ============================================================
//  Backend Implementation Spec
// ============================================================

/**
 * Backend Requirements for Production Deployment:
 * 
 * Server: http://192.168.3.100:3118
 * API Base: /api/v1
 * Auth: JWT Bearer Token
 * 
 * Request Format:
 *   Headers: {
 *     "Content-Type": "application/json",
 *     "Authorization": "Bearer <access_token>",
 *     "X-Client-Version": "1.0.0",
 *     "X-Client-Platform": "web"
 *   }
 * 
 * Response Format (success):
 *   {
 *     "code": 200,
 *     "message": "success",
 *     "data": <T>,
 *     "timestamp": 1709384400000
 *   }
 * 
 * Response Format (paginated):
 *   {
 *     "code": 200,
 *     "message": "success",
 *     "data": <T[]>,
 *     "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 },
 *     "timestamp": 1709384400000
 *   }
 * 
 * Response Format (error):
 *   {
 *     "code": 400|401|403|404|500,
 *     "message": "Error description",
 *     "data": null,
 *     "timestamp": 1709384400000
 *   }
 * 
 * WebSocket Protocol:
 *   URL: ws://192.168.3.100:3118/api/v1/ws?subscribe=<type>&token=<jwt>
 *   Types: monitor | alert | operation | patrol
 *   Message: { "type": "<type>", "payload": <data>, "timestamp": <number> }
 * 
 * Database Tables Required:
 *   - users           (id, name, email, password_hash, role, status, ...)
 *   - roles           (id, name, description, permissions, ...)
 *   - devices         (id, name, type, endpoint, ip, port, status, os, cpu, memory, disk, ...)
 *   - monitor_data    (id, device_id, timestamp, cpu, memory, disk, network, ...)
 *   - audit_logs      (id, operation_type, operator_id, target, action, result, ...)
 *   - alerts          (id, level, device_id, metric, value, threshold, status, ...)
 *   - patrol_reports  (id, timestamp, type, health_score, checks, ...)
 *   - patrol_schedule (id, enabled, interval, last_run, next_run)
 *   - op_templates    (id, name, description, steps, risk, ...)
 *   - op_logs         (id, action, operator, target, status, ...)
 *   - ai_patterns     (id, device, metric, severity, description, ...)
 *   - ai_suggestions  (id, pattern_id, action, description, status, ...)
 *   - scripts         (id, name, language, category, content, variables, ...)
 *   - script_executions (id, script_id, status, started_at, output, ...)
 *   - batch_jobs      (id, name, scripts, mode, status, progress, ...)
 *   - cli_history     (id, user_id, command, exit_code, timestamp)
 *   - files_metadata  (path, type, size, modified, ...)
 * 
 * Redis Keys:
 *   - session:<user_id>          -> JWT session data
 *   - monitor:latest:<device_id> -> Latest monitor snapshot
 *   - alerts:active              -> Active alert IDs set
 *   - patrol:schedule            -> Current patrol schedule
 *   - cli:autocomplete           -> Cached autocomplete data
 */


// ============================================================
//  Quick Switch: Mock -> Production
// ============================================================

/**
 * To switch from Mock to Real API:
 * 
 * 1. Open /api/config.ts
 * 2. Set TEST_MODE: false
 * 3. Verify BASE_URL matches your backend:
 *      BASE_URL: 'http://192.168.3.100:3118/api/v1'
 * 4. Verify WS_URL:
 *      WS_URL: 'ws://192.168.3.100:3118/api/v1/ws'
 * 5. Ensure backend is running and accessible
 * 6. Login to get JWT token (POST /auth/login)
 * 
 * The hooks layer (/api/hooks.ts) automatically switches between
 * mock and real API based on the TEST_MODE flag. No component
 * code changes needed.
 */

export const PRODUCTION_CONFIG = {
  // Primary backend (local Mac)
  primary: {
    baseUrl: 'http://192.168.3.100:3118/api/v1',
    wsUrl:   'ws://192.168.3.100:3118/api/v1/ws',
    label:   'Max端本地 / Max Local',
  },
  // Secondary backend (NAS)
  secondary: {
    baseUrl: 'http://192.168.1.200:3118/api/v1',
    wsUrl:   'ws://192.168.1.200:3118/api/v1/ws',
    label:   'NAS端本地 / NAS Local',
  },
  // ECS backend (cloud)
  cloud: {
    baseUrl: 'https://api.yyc3.cloud/api/v1',
    wsUrl:   'wss://api.yyc3.cloud/api/v1/ws',
    label:   'ECS云端 / ECS Cloud',
  },
} as const;


// ============================================================
//  Endpoint Count Summary
// ============================================================
// Total REST endpoints: 71
// Total WebSocket channels: 4
// Auth-protected: 69 (97%)
// Role-restricted: 26 (37%)
// Modules: 14
//
// Phase 0: auth(4) + devices(7) + monitor(8) + audit(4) + permissions(10) = 33
// Phase 1: operations(8) + patrol(7) + alerts(5) = 20
// Phase 2: ai(6) + files(5) = 11
// Phase 3: cli(4) + scripts(10) + ide(3) = 17
// Phase 5+5.5: theme(14) = 14
// Phase 6.1: monitor.comparison(2) = 2 → Total: 77
// Phase 6.2: monitor.historical(1) + monitor.thresholds(2) = 3 → Total: 80
// ============================================================