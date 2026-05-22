/**
 * YYC³ API — React Hooks
 *
 * 通用数据获取 Hook，自动处理 loading / error / mock 切换
 * 所有 DevOps 组件通过此层调用 API
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, apiClient } from './client';
import { API_CONFIG } from './config';
import { wsManager } from './websocket';
import { getMockHandler, isMockMode } from './mock';

// ===== 通用请求 Hook =====
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

/**
 * 通用 API 数据获取 Hook
 *
 * Mock 模式下直接返回 mock 数据
 * 生产模式下调用真实 API
 */
export function useApi<T>(
  method: string,
  path: string,
  params?: Record<string, any>,
  options?: {
    immediate?: boolean;
    deps?: any[];
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseApiReturn<T> {
  const { immediate = true, deps = [], onSuccess, onError } = options || {};

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    // 取消上一次请求
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let result: any;

      if (isMockMode()) {
        // Mock 模式
        const handler = getMockHandler(method, path);
        if (handler) {
          result = await handler(params);
        } else {
          throw new Error(`No mock handler for ${method} ${path}`);
        }
      } else {
        // 生产模式
        switch (method) {
          case 'GET':
            result = await apiClient.get(path, { params, signal: abortRef.current.signal });
            break;
          case 'POST':
            result = await apiClient.post(path, params, { signal: abortRef.current.signal });
            break;
          case 'PUT':
            result = await apiClient.put(path, params, { signal: abortRef.current.signal });
            break;
          case 'DELETE':
            result = await apiClient.delete(path, { signal: abortRef.current.signal });
            break;
        }
      }

      const data = result?.data !== undefined ? result.data : result;
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const errorMsg = err instanceof ApiError ? err.messageZh : err.message || '请求失败';
      setState((prev) => ({ ...prev, loading: false, error: errorMsg }));
      onError?.(errorMsg);
    }
  }, [method, path, JSON.stringify(params), ...deps]);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [fetch, immediate]);

  const mutate = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return { ...state, refetch: fetch, mutate };
}

// ===== 分页数据 Hook =====
interface UsePaginatedReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => Promise<void>;
}

export function usePaginatedApi<T>(
  path: string,
  params?: Record<string, any>,
  options?: { pageSize?: number; deps?: any[] }
): UsePaginatedReturn<T> {
  const { pageSize: initialPageSize = 20, deps = [] } = options || {};
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const allParams = { ...params, page, pageSize };

  const {
    data: rawData,
    loading,
    error,
    refetch,
  } = useApi<any>('GET', path, allParams, { deps: [page, pageSize, ...deps] });

  // 处理分页响应
  const data: T[] = Array.isArray(rawData) ? rawData : rawData?.data || rawData || [];
  const pagination = rawData?.pagination || {
    page,
    pageSize,
    total: Array.isArray(rawData) ? rawData.length : 0,
    totalPages: 1,
  };

  return {
    data,
    loading,
    error,
    pagination,
    setPage,
    setPageSize,
    refetch,
  };
}

// ===== 轮询 Hook =====
export function usePolling<T>(
  method: string,
  path: string,
  interval: number,
  params?: Record<string, any>
): UseApiReturn<T> {
  const result = useApi<T>(method, path, params, { immediate: true });

  useEffect(() => {
    const timer = setInterval(() => {
      result.refetch();
    }, interval);
    return () => clearInterval(timer);
  }, [interval, result.refetch]);

  return result;
}

// ===== Mutation Hook =====
interface UseMutationReturn<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput | null>;
  loading: boolean;
  error: string | null;
  data: TOutput | null;
}

export function useMutation<TInput, TOutput>(
  method: string,
  path: string | ((input: TInput) => string),
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
  }
): UseMutationReturn<TInput, TOutput> {
  const [state, setState] = useState<{ loading: boolean; error: string | null; data: TOutput | null }>({
    loading: false,
    error: null,
    data: null,
  });

  const mutate = useCallback(
    async (input: TInput): Promise<TOutput | null> => {
      setState({ loading: true, error: null, data: null });

      try {
        let result: any;
        const resolvedPath = typeof path === 'function' ? path(input) : path;

        if (isMockMode()) {
          const handler = getMockHandler(method, resolvedPath);
          if (handler) {
            result = await handler(input);
          } else {
            throw new Error(`No mock handler for ${method} ${resolvedPath}`);
          }
        } else {
          switch (method) {
            case 'POST':
              result = await apiClient.post(resolvedPath, input);
              break;
            case 'PUT':
              result = await apiClient.put(resolvedPath, input);
              break;
            case 'DELETE':
              result = await apiClient.delete(resolvedPath);
              break;
            case 'PATCH':
              result = await apiClient.patch(resolvedPath, input);
              break;
          }
        }

        const data = result?.data !== undefined ? result.data : result;
        setState({ loading: false, error: null, data });
        options?.onSuccess?.(data);
        return data;
      } catch (err: any) {
        const errorMsg = err instanceof ApiError ? err.messageZh : err.message || '操作失败';
        setState({ loading: false, error: errorMsg, data: null });
        options?.onError?.(errorMsg);
        return null;
      }
    },
    [method, path]
  );

  return { ...state, mutate };
}

// ===== WebSocket Hook =====
export function useWebSocket(type: string, handler: (payload: any) => void) {
  useEffect(() => {
    if (isMockMode()) {
      // Mock 模式: 模拟 WebSocket 推送
      const interval = setInterval(() => {
        if (type === 'monitor') {
          handler({
            cpu: Math.floor(50 + Math.random() * 40),
            memory: Math.floor(55 + Math.random() * 20),
            disk: Math.floor(35 + Math.random() * 10),
            networkIn: Math.floor(200 + Math.random() * 300),
            networkOut: Math.floor(100 + Math.random() * 200),
          });
        } else if (type === 'alert') {
          // 偶尔推送告警
          if (Math.random() > 0.8) {
            handler({
              id: `ALT-RT-${Date.now()}`,
              level: Math.random() > 0.5 ? 'warning' : 'info',
              message: '实时监控数据更新',
              device: 'NAS-Server-Core',
              timestamp: Date.now(),
            });
          }
        }
      }, API_CONFIG.REALTIME.monitorInterval);

      return () => clearInterval(interval);
    }

    // 生产模式: 真实 WebSocket
    // 由 wsManager 统一管理，这里仅做订阅
    const unsubscribe = wsManager.on(type, (msg: any) => handler(msg.payload));
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [type, handler]);
}
