import { describe, expect, it, beforeEach } from 'vitest';
import {
  API_CONFIG,
  API_VERSION,
  AUTH_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
  ENVIRONMENT,
} from '../../api/config';

describe('API Configuration', () => {
  describe('Environment Detection', () => {
    it('ENVIRONMENT should be defined', () => {
      expect(ENVIRONMENT).toBeDefined();
      expect(typeof ENVIRONMENT).toBe('string');
    });

    it('ENVIRONMENT should be valid value', () => {
      const validEnvironments = ['development', 'production', 'staging', 'mock'];
      expect(validEnvironments).toContain(ENVIRONMENT);
    });
  });

  describe('API_CONFIG', () => {
    it('should have required configuration properties', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined();
      expect(API_CONFIG.WS_URL).toBeDefined();
      expect(API_CONFIG.TIMEOUT).toBeDefined();
      expect(API_CONFIG.RETRY).toBeDefined();
      expect(API_CONFIG.PAGINATION).toBeDefined();
      expect(API_CONFIG.REALTIME).toBeDefined();
      expect(API_CONFIG.WS_RECONNECT).toBeDefined();
      expect(API_CONFIG.TEST_MODE).toBeDefined();
    });

    it('TIMEOUT should be positive number', () => {
      expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
      expect(typeof API_CONFIG.TIMEOUT).toBe('number');
    });

    it('RETRY configuration should have valid values', () => {
      expect(API_CONFIG.RETRY.maxAttempts).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY.baseDelay).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY.maxDelay).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY.maxDelay).toBeGreaterThanOrEqual(API_CONFIG.RETRY.baseDelay);
    });

    it('PAGINATION configuration should have valid defaults', () => {
      expect(API_CONFIG.PAGINATION.defaultPage).toBeGreaterThanOrEqual(1);
      expect(API_CONFIG.PAGINATION.defaultPageSize).toBeGreaterThan(0);
      expect(Array.isArray(API_CONFIG.PAGINATION.pageSizeOptions)).toBe(true);
      expect(API_CONFIG.PAGINATION.pageSizeOptions.length).toBeGreaterThan(0);
    });

    it('REALTIME configuration should have valid intervals', () => {
      expect(API_CONFIG.REALTIME.monitorInterval).toBeGreaterThan(0);
      expect(API_CONFIG.REALTIME.alertInterval).toBeGreaterThan(0);
      expect(API_CONFIG.REALTIME.patrolInterval).toBeGreaterThan(0);
    });

    it('WS_RECONNECT configuration should have valid values', () => {
      expect(API_CONFIG.WS_RECONNECT.maxAttempts).toBeGreaterThan(0);
      expect(API_CONFIG.WS_RECONNECT.baseDelay).toBeGreaterThan(0);
      expect(API_CONFIG.WS_RECONNECT.maxDelay).toBeGreaterThan(0);
      expect(API_CONFIG.WS_RECONNECT.maxDelay).toBeGreaterThanOrEqual(API_CONFIG.WS_RECONNECT.baseDelay);
    });

    it('TEST_MODE should be boolean', () => {
      expect(typeof API_CONFIG.TEST_MODE).toBe('boolean');
    });

    it('BASE_URL should be string', () => {
      expect(typeof API_CONFIG.BASE_URL).toBe('string');
    });

    it('WS_URL should be string', () => {
      expect(typeof API_CONFIG.WS_URL).toBe('string');
    });
  });

  describe('API_VERSION', () => {
    it('should be defined', () => {
      expect(API_VERSION).toBeDefined();
    });

    it('should be version string', () => {
      expect(typeof API_VERSION).toBe('string');
      expect(API_VERSION).toMatch(/^v\d+$/);
    });
  });

  describe('AUTH_CONFIG', () => {
    it('should have required properties', () => {
      expect(AUTH_CONFIG.TOKEN_KEY).toBeDefined();
      expect(AUTH_CONFIG.REFRESH_TOKEN_KEY).toBeDefined();
      expect(AUTH_CONFIG.REFRESH_THRESHOLD).toBeDefined();
      expect(AUTH_CONFIG.getHeaders).toBeDefined();
    });

    it('TOKEN_KEY should be non-empty string', () => {
      expect(AUTH_CONFIG.TOKEN_KEY).toBeTruthy();
      expect(typeof AUTH_CONFIG.TOKEN_KEY).toBe('string');
    });

    it('REFRESH_TOKEN_KEY should be non-empty string', () => {
      expect(AUTH_CONFIG.REFRESH_TOKEN_KEY).toBeTruthy();
      expect(typeof AUTH_CONFIG.REFRESH_TOKEN_KEY).toBe('string');
    });

    it('REFRESH_THRESHOLD should be positive number', () => {
      expect(AUTH_CONFIG.REFRESH_THRESHOLD).toBeGreaterThan(0);
      expect(typeof AUTH_CONFIG.REFRESH_THRESHOLD).toBe('number');
    });

    describe('getHeaders()', () => {
      beforeEach(() => {
        localStorage.clear();
      });

      it('should return base headers without token', () => {
        const headers = AUTH_CONFIG.getHeaders();

        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['X-Client-Version']).toBe('3.2.0');
        expect(headers['X-Client-Platform']).toBe('web');
        expect(headers['X-Environment']).toBeDefined();
        expect(headers['Authorization']).toBeUndefined();
      });

      it('should include Authorization header when token exists', () => {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, 'test-token-123');

        const headers = AUTH_CONFIG.getHeaders();

        expect(headers['Authorization']).toBe('Bearer test-token-123');
      });

      it('should not include Authorization header for empty token', () => {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, '');

        const headers = AUTH_CONFIG.getHeaders();

        expect(headers['Authorization']).toBeUndefined();
      });
    });
  });

  describe('HTTP_STATUS', () => {
    it('should contain all standard status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.RATE_LIMITED).toBe(429);
      expect(HTTP_STATUS.SERVER_ERROR).toBe(500);
      expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
    });

    it('all status codes should be numbers', () => {
      Object.values(HTTP_STATUS).forEach(status => {
        expect(typeof status).toBe('number');
        expect(status).toBeGreaterThan(0);
      });
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should contain error messages for all status codes', () => {
      const expectedCodes = [400, 401, 403, 404, 409, 429, 500, 503];

      expectedCodes.forEach(code => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(ERROR_MESSAGES[code].zh).toBeDefined();
        expect(ERROR_MESSAGES[code].en).toBeDefined();
      });
    });

    it('error messages should be non-empty strings', () => {
      Object.values(ERROR_MESSAGES).forEach(msg => {
        expect(msg.zh.length).toBeGreaterThan(0);
        expect(msg.en.length).toBeGreaterThan(0);
      });
    });

    it('should have Chinese and English messages', () => {
      expect(ERROR_MESSAGES[400].zh).toBe('请求参数错误');
      expect(ERROR_MESSAGES[400].en).toBe('Bad request');
      expect(ERROR_MESSAGES[401].zh).toContain('登录');
      expect(ERROR_MESSAGES[401].en).toContain('Session');
    });
  });

  describe('Configuration Consistency', () => {
    it('API_VERSION should match BASE_URL version', () => {
      if (API_CONFIG.BASE_URL) {
        expect(API_CONFIG.BASE_URL).toContain(API_VERSION);
      }
    });

    it('REFRESH_THRESHOLD should be reasonable (5 minutes)', () => {
      expect(AUTH_CONFIG.REFRESH_THRESHOLD).toBe(5 * 60 * 1000); // 5 minutes in ms
    });

    it('pageSizeOptions should include defaultPageSize', () => {
      expect(API_CONFIG.PAGINATION.pageSizeOptions).toContain(
        API_CONFIG.PAGINATION.defaultPageSize
      );
    });

    it('monitorInterval should be less than patrolInterval', () => {
      expect(API_CONFIG.REALTIME.monitorInterval).toBeLessThan(
        API_CONFIG.REALTIME.patrolInterval
      );
    });
  });
});
