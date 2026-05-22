/**
 * YYC³ API — 统一导出
 * 
 * 使用方式:
 *   import { deviceApi, useApi, useMutation } from './';
 * 
 * 切换真实后端:
 *   修改 /api/config.ts 中 TEST_MODE: false
 *   修改 BASE_URL 为实际后端地址
 */

// 配置
export { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from './config';

// 类型
export type * from './types';

// HTTP 客户端
export { apiClient, ApiError } from './client';

// WebSocket
export { WebSocketManager, wsManager } from './websocket';

// 端点
export {
  authApi,
  deviceApi,
  monitorApi,
  auditApi,
  permissionApi,
  operationApi,
  patrolApi,
  alertApi,
  aiApi,
  fileApi,
  cliApi,
  scriptApi,
  ideApi,
} from './endpoints';

// 端点配置 (生产部署)
export { ENDPOINT_REGISTRY, PRODUCTION_CONFIG } from './endpoints-config';

// React Hooks
export { useApi, usePaginatedApi, usePolling, useMutation, useWebSocket } from './hooks';

// Mock
export { isMockMode, getMockHandler } from './mock';