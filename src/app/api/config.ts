/**
 * file config.ts
 * description YYC³ Brain Computer System — API 配置中心 · 智能环境适配
 * author YanYuCloudCube Team
 * version v3.2.0
 * created 2026-02-26
 * updated 2026-05-23
 * status: active
 * tags: [api],[config],[env],[multi-environment]
 *
 * brief: 核心配置: 基础 URL、认证、超时、重试策略
 * details: 支持多环境自动检测: 本地开发 / GitHub Pages / 自定义部署
 */

type Environment = 'development' | 'production' | 'staging' | 'mock';

const getEnv = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  return fallback;
};

const detectEnvironment = (): Environment => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const testMode = getEnv('VITE_API_TEST_MODE', 'auto');

  if (testMode === 'true') return 'mock';
  if (testMode === 'false') return 'production';

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }

  if (hostname.includes('github.io') || hostname.includes('brain.yyc3.vip')) {
    return testMode === 'auto' ? 'mock' : 'production';
  }

  return 'production';
};

const getBaseUrl = (): string => {
  const envUrl = getEnv('VITE_API_BASE_URL', '');
  if (envUrl) return envUrl;

  const env = detectEnvironment();

  switch (env) {
    case 'development':
      return 'http://192.168.3.100:3118/api/v1';
    case 'mock':
      return '';
    case 'staging':
      return 'https://api-staging.brain.yyc3.vip/api/v1';
    case 'production':
    default:
      return 'https://api.brain.yyc3.vip/api/v1';
  }
};

const getWsUrl = (): string => {
  const envUrl = getEnv('VITE_WS_URL', '');
  if (envUrl) return envUrl;

  const env = detectEnvironment();

  switch (env) {
    case 'development':
      return 'ws://192.168.3.100:3118/api/v1/ws';
    case 'mock':
      return '';
    case 'staging':
      return 'wss://api-staging.brain.yyc3.vip/api/v1/ws';
    case 'production':
    default:
      return 'wss://api.brain.yyc3.vip/api/v1/ws';
  }
};

export const ENVIRONMENT = detectEnvironment();

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  WS_URL: getWsUrl(),
  TIMEOUT: 15000,
  RETRY: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
  PAGINATION: {
    defaultPage: 1,
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  REALTIME: {
    monitorInterval: 5000,
    alertInterval: 3000,
    patrolInterval: 900000,
  },
  WS_RECONNECT: {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  },
  TEST_MODE: ENVIRONMENT === 'mock',
} as const;

export const API_VERSION = 'v1';

export const AUTH_CONFIG = {
  TOKEN_KEY: getEnv('VITE_AUTH_TOKEN_KEY', 'yyc3_access_token'),
  REFRESH_TOKEN_KEY: getEnv('VITE_AUTH_REFRESH_TOKEN_KEY', 'yyc3_refresh_token'),
  REFRESH_THRESHOLD: 5 * 60 * 1000,
  getHeaders: (): Record<string, string> => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Version': '3.2.0',
      'X-Client-Platform': 'web',
      'X-Environment': ENVIRONMENT,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES: Record<number, { zh: string; en: string }> = {
  400: { zh: '请求参数错误', en: 'Bad request' },
  401: { zh: '登录已过期，请重新登录', en: 'Session expired, please login again' },
  403: { zh: '权限不足，无法执行此操作', en: 'Insufficient permissions' },
  404: { zh: '请求的资源不存在', en: 'Resource not found' },
  409: { zh: '数据冲突，请刷新后重试', en: 'Data conflict, please refresh' },
  429: { zh: '请求过于频繁，请稍后重试', en: 'Too many requests, please wait' },
  500: { zh: '服务器内部错误', en: 'Internal server error' },
  503: { zh: '服务暂时不可用', en: 'Service temporarily unavailable' },
};
