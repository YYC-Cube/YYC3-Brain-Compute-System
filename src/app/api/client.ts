/**
 * YYC³ API — HTTP 客户端
 * 
 * 功能: 统一请求/响应拦截、自动重试、错误处理、Token 刷新
 * 支持: GET / POST / PUT / DELETE / PATCH + 文件下载
 */

import { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from './config';
import type { ApiResponse, PaginatedResponse } from './types';

// ===== 请求选项 =====
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  retry?: boolean;
  timeout?: number;
}

// ===== 错误类 =====
export class ApiError extends Error {
  constructor(
    public status: number,
    public messageZh: string,
    public messageEn: string,
    public data?: unknown
  ) {
    super(messageEn);
    this.name = 'ApiError';
  }
}

// ===== 构建 URL =====
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

// ===== 超时 Promise =====
function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new ApiError(0, '请求超时', 'Request timeout')), ms)
  );
}

// ===== 指数退避延迟 =====
function getRetryDelay(attempt: number): number {
  const delay = API_CONFIG.RETRY.baseDelay * Math.pow(2, attempt);
  return Math.min(delay + Math.random() * 1000, API_CONFIG.RETRY.maxDelay);
}

// ===== 核心请求方法 =====
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, params, signal, retry = true, timeout = API_CONFIG.TIMEOUT } = options;

  const url = buildUrl(path, params);
  const allHeaders = { ...AUTH_CONFIG.getHeaders(), ...headers };

  const fetchOptions: RequestInit = {
    method,
    headers: allHeaders,
    signal,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let lastError: ApiError | Error = new Error('Unknown error');

  const maxAttempts = retry ? API_CONFIG.RETRY.maxAttempts : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise(timeout),
      ]);

      // 处理 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      // 解析 JSON
      const data = await response.json();

      // 成功
      if (response.ok) {
        return data as T;
      }

      // 401 → Token 过期，尝试刷新
      if (response.status === 401 && attempt === 0) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Token 已刷新，重新请求
          const newHeaders = { ...AUTH_CONFIG.getHeaders(), ...headers };
          const retryResponse = await fetch(url, { ...fetchOptions, headers: newHeaders });
          if (retryResponse.ok) {
            return (await retryResponse.json()) as T;
          }
        }
        // 刷新失败，清除 Token
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      }

      // 错误
      const errMsg = ERROR_MESSAGES[response.status] || { zh: '请求失败', en: 'Request failed' };
      throw new ApiError(response.status, errMsg.zh, errMsg.en, data);

    } catch (error) {
      lastError = error as ApiError | Error;

      // 非网络错误不重试
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // 最后一次尝试
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
    }
  }

  throw lastError;
}

// ===== Token 刷新 =====
async function refreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, data.data.accessToken);
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, data.data.refreshToken);
      return true;
    }
  } catch {
    // 刷新失败
  }
  return false;
}

// ===== 导出方法 =====
export const apiClient = {
  get: <T,>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  put: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),

  patch: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),

  delete: <T,>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};