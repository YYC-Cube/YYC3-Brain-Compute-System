import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from '../../api/client';
import { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from '../../api/config';

describe('API Client', () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as any).fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ApiError', () => {
    it('should create error with correct properties', () => {
      const error = new ApiError(400, 'Bad Request', '请求参数错误', { field: 'email' });

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.status).toBe(400);
      expect(error.messageZh).toBe('Bad Request');
      expect(error.messageEn).toBe('请求参数错误');
      expect(error.data).toEqual({ field: 'email' });
    });

    it('should handle different HTTP status codes', () => {
      const errors = [
        new ApiError(401, 'Unauthorized', '未授权'),
        new ApiError(403, 'Forbidden', '权限不足'),
        new ApiError(404, 'Not Found', '资源不存在'),
        new ApiError(500, 'Server Error', '服务器错误'),
      ];

      errors.forEach(error => {
        expect(error.status).toBeDefined();
        expect(error.messageZh).toBeDefined();
        expect(error.messageEn).toBeDefined();
        expect(error.name).toBe('ApiError');
      });
    });
  });

  describe('buildUrl (internal function tested via requests)', () => {
    it('should build URL with query parameters', async () => {
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: [], message: 'success' }),
      });

      await apiClient.get('/devices', { params: { page: 1, pageSize: 20 } });

      expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
      const url = ((globalThis as any).fetch as any).mock.calls[0][0];
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=20');
    });

    it('should filter undefined and empty parameters', async () => {
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: {}, message: 'success' }),
      });

      await apiClient.get('/test', { params: { a: 1, b: undefined as string | undefined, c: '', d: null as any } });

      const url = ((globalThis as any).fetch as any).mock.calls[0][0];
      expect(url).toContain('a=1');
      expect(url).not.toContain('b=');
      expect(url).not.toContain('c=');
      expect(url).not.toContain('d=');
    });
  });

  describe('apiClient.get', () => {
    it('should make GET request and return response', async () => {
      const mockData = { id: 1, name: 'Test Device' };
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: mockData, message: 'success' }),
      });

      const result = await apiClient.get<any>('/devices/1');

      expect(result).toEqual({ code: 200, data: mockData, message: 'success' });
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Client-Version': '3.2.0',
          }),
        })
      );
    });

    it('should handle paginated response', async () => {
      const mockPaginatedData = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, pageSize: 20, total: 100, totalPages: 5 },
      };
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, ...mockPaginatedData, message: 'success' }),
      });

      const result = await apiClient.get<any>('/devices');

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(100);
    });
  });

  describe('apiClient.post', () => {
    it('should make POST request with body', async () => {
      const requestBody = { name: 'New Device', type: 'server' };
      const responseData = { id: 2, ...requestBody };
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 201, data: responseData, message: 'success' }),
      });

      const result = await apiClient.post<any>('/devices', requestBody);

      expect(result.data.id).toBe(2);
      expect(result.data.name).toBe('New Device');
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('apiClient.put', () => {
    it('should make PUT request for updates', async () => {
      const updateData = { name: 'Updated Device' };
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: updateData, message: 'success' }),
      });

      const result = await apiClient.put<any>('/devices/1', updateData);

      expect(result.data.name).toBe('Updated Device');
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('apiClient.delete', () => {
    it('should make DELETE request', async () => {
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: null, message: 'success' }),
      });

      await apiClient.delete('/devices/1');

      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('apiClient.patch', () => {
    it('should make PATCH request for partial updates', async () => {
      const patchData = { status: 'maintenance' };
      (globalThis as any).fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: patchData, message: 'success' }),
      });

      const result = await apiClient.patch<any>('/devices/1', patchData);

      expect(result.data.status).toBe('maintenance');
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError on 400 Bad Request', async () => {
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid input' }),
      });

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).messageEn).toBeDefined();
      }
    });

    it('should throw ApiError on 404 Not Found', async () => {
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      try {
        await apiClient.get('/nonexistent');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect(ERROR_MESSAGES[404]).toBeDefined();
      }
    });

    it('should throw ApiError on 500 Server Error', async () => {
      (globalThis as any).fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Internal error' }),
      });

      try {
        await apiClient.get('/error');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeDefined();
      }
    });

    it('should handle network errors with retry', async () => {
      (globalThis as any).fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ code: 200, data: { retry: true }, message: 'success' }),
        });

      const result = await apiClient.get<any>('/retry-test');

      expect(result.data.retry).toBe(true);
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000);

    it('should not retry on 4xx client errors', async () => {
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({}),
      });

      try {
        await apiClient.get('/forbidden');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(403);
        expect((globalThis as any).fetch).toHaveBeenCalledTimes(1); // No retry
      }
    });
  });

  describe('Timeout Handling', () => {
    it('should use custom timeout when provided', async () => {
      ((globalThis as any).fetch as any).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const startTime = Date.now();
      try {
        await apiClient.get('/slow', { timeout: 50, retry: false });
      } catch (error) {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(200); // Should timeout quickly
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(0);
        expect((error as ApiError).messageEn).toContain('timeout');
      }
    });
  });

  describe('204 No Content Handling', () => {
    it('should return undefined for 204 responses', async () => {
      ((globalThis as any).fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiClient.get('/delete-action');

      expect(result).toBeUndefined();
    });
  });

  describe('Authentication Headers', () => {
    it('should include Authorization header when token exists', async () => {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, 'test-token-123');
      (globalThis as any).fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: {}, message: 'success' }),
      });

      await apiClient.get('/protected');

      const headers = ((globalThis as any).fetch as any).mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer test-token-123');
    });

    it('should not include Authorization header without token', async () => {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      (globalThis as any).fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: {}, message: 'success' }),
      });

      await apiClient.get('/public');

      const headers = ((globalThis as any).fetch as any).mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('API Configuration Integration', () => {
    it('should use API_CONFIG values correctly', () => {
      expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY.maxAttempts).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY.baseDelay).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY.maxDelay).toBeGreaterThan(0);
    });

    it('should include standard headers in all requests', async () => {
      (globalThis as any).fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: {}, message: 'success' }),
      });

      await apiClient.get('/headers-test');

      const headers = ((globalThis as any).fetch as any).mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Client-Version']).toBe('3.2.0');
      expect(headers['X-Client-Platform']).toBe('web');
      expect(headers['X-Environment']).toBeDefined();
    });
  });
});
