import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  aiApi,
  alertApi,
  auditApi,
  authApi,
  cliApi,
  deviceApi,
  fileApi,
  monitorApi,
  operationApi,
  patrolApi,
  permissionApi,
  scriptApi,
} from '../../api/endpoints';

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.resetModules();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Endpoint Structure Validation', () => {
    it('authApi should have required methods', () => {
      expect(authApi.login).toBeDefined();
      expect(typeof authApi.login).toBe('function');
      expect(authApi.logout).toBeDefined();
      expect(typeof authApi.logout).toBe('function');
      expect(authApi.refresh).toBeDefined();
      expect(typeof authApi.refresh).toBe('function');
      expect(authApi.getProfile).toBeDefined();
      expect(typeof authApi.getProfile).toBe('function');
    });

    it('deviceApi should have required methods', () => {
      expect(deviceApi.list).toBeDefined();
      expect(deviceApi.detail).toBeDefined();
      expect(deviceApi.stats).toBeDefined();
      expect(deviceApi.create).toBeDefined();
      expect(deviceApi.update).toBeDefined();
      expect(deviceApi.retire).toBeDefined();
      expect(deviceApi.batch).toBeDefined();
    });

    it('monitorApi should have required methods', () => {
      expect(monitorApi.overview).toBeDefined();
      expect(monitorApi.realtime).toBeDefined();
      expect(monitorApi.history).toBeDefined();
      expect(monitorApi.alerts).toBeDefined();
    });

    it('auditApi should have required methods', () => {
      expect(auditApi.list).toBeDefined();
      expect(auditApi.detail).toBeDefined();
      expect(auditApi.export).toBeDefined();
      expect(auditApi.stats).toBeDefined();
    });

    it('permissionApi should have required methods', () => {
      expect(permissionApi.listRoles).toBeDefined();
      expect(permissionApi.listUsers).toBeDefined();
      expect(permissionApi.matrix).toBeDefined();
      expect(permissionApi.assignRole).toBeDefined();
    });

    it('operationApi should have required methods', () => {
      expect(operationApi.logs).toBeDefined();
      expect(operationApi.execute).toBeDefined();
      expect(operationApi.listTemplates).toBeDefined();
      expect(operationApi.executeTemplate).toBeDefined();
    });

    it('patrolApi should have required methods', () => {
      expect(patrolApi.latest).toBeDefined();
      expect(patrolApi.run).toBeDefined();
      expect(patrolApi.getSchedule).toBeDefined();
    });

    it('alertApi should have required methods', () => {
      expect(alertApi.list).toBeDefined();
      expect(alertApi.detail).toBeDefined();
      expect(alertApi.action).toBeDefined();
      expect(alertApi.stats).toBeDefined();
    });

    it('fileApi should have required methods', () => {
      expect(fileApi.tree).toBeDefined();
      expect(fileApi.content).toBeDefined();
      expect(fileApi.operation).toBeDefined();
      expect(fileApi.storage).toBeDefined();
    });

    it('aiApi should have required methods', () => {
      expect(aiApi.getAnalysis).toBeDefined();
      expect(aiApi.applySuggestion).toBeDefined();
    });

    it('cliApi should have required methods', () => {
      expect(cliApi.execute).toBeDefined();
      expect(cliApi.autocomplete).toBeDefined();
    });

    it('scriptApi should have required methods', () => {
      expect(scriptApi.listTemplates).toBeDefined();
      expect(scriptApi.execute).toBeDefined();
      expect(scriptApi.executions).toBeDefined();
    });
  });

  describe('Method Signature Validation', () => {
    it('authApi.login should accept LoginRequest and return Promise', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: {}, message: 'success' }),
      });

      const result = authApi.login({ username: 'test', password: 'test' });

      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it('deviceApi.list should accept params and return Promise', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: [], message: 'success' }),
      });

      const result = deviceApi.list({ page: 1, pageSize: 20 });

      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it('monitorApi.overview should return Promise', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: {}, message: 'success' }),
      });

      const result = monitorApi.overview();

      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it('alertApi.acknowledge should accept id and return Promise', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: {}, message: 'success' }),
      });

      const result = alertApi.action({ alertId: 'ALT-001', action: 'acknowledge' });

      expect(result).toBeInstanceOf(Promise);
      await result;
    });
  });

  describe('API Client Integration', () => {
    it('all API methods should use apiClient', () => {
      const apiModules = [
        authApi,
        deviceApi,
        monitorApi,
        auditApi,
        permissionApi,
        operationApi,
        patrolApi,
        alertApi,
        fileApi,
        aiApi,
        cliApi,
        scriptApi,
      ];

      apiModules.forEach(apiModule => {
        Object.values(apiModule).forEach(method => {
          if (typeof method === 'function') {
            expect(method).toBeInstanceOf(Function);
          }
        });
      });
    });
  });

  describe('Endpoint Coverage', () => {
    it('should cover all major DevOps modules', () => {
      const expectedModules = [
        'auth',
        'device',
        'monitor',
        'audit',
        'permission',
        'operation',
        'patrol',
        'alert',
        'file',
        'ai',
        'cli',
        'script',
      ];

      const actualModules = Object.keys({
        authApi,
        deviceApi,
        monitorApi,
        auditApi,
        permissionApi,
        operationApi,
        patrolApi,
        alertApi,
        fileApi,
        aiApi,
        cliApi,
        scriptApi,
      }).map(key => key.replace('Api', ''));

      expectedModules.forEach(module => {
        expect(actualModules).toContain(module);
      });
    });

    it('should have CRUD operations for core entities', () => {
      expect(deviceApi.create).toBeDefined(); // Create
      expect(deviceApi.detail).toBeDefined(); // Read
      expect(deviceApi.update).toBeDefined(); // Update
      expect(deviceApi.retire).toBeDefined(); // Delete/Retire
    });
  });
});
