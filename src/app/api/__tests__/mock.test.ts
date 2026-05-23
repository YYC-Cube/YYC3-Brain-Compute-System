import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockApi } from '../../api/mock';

describe('Mock API Interceptor', () => {
  beforeEach(() => {
    // 不使用 fakeTimers，因为 mock API 使用真实延迟
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Utility Functions', () => {
    it('mockApi should be defined with all endpoints', () => {
      expect(mockApi).toBeDefined();
      expect(mockApi['GET /devices']).toBeDefined();
      expect(mockApi['GET /devices/:id']).toBeDefined();
      expect(mockApi['GET /devices/stats']).toBeDefined();
      expect(mockApi['PUT /devices/:id']).toBeDefined();
      expect(mockApi['GET /monitor/overview']).toBeDefined();
      expect(mockApi['GET /monitor/realtime']).toBeDefined();
      expect(mockApi['GET /audit/logs']).toBeDefined();
      expect(mockApi['GET /audit/stats']).toBeDefined();
      expect(mockApi['GET /permissions/roles']).toBeDefined();
      expect(mockApi['GET /permissions/users']).toBeDefined();
      expect(mockApi['GET /permissions/matrix']).toBeDefined();
      expect(mockApi['GET /operations/logs']).toBeDefined();
      expect(mockApi['POST /operations/execute']).toBeDefined();
      expect(mockApi['GET /patrol/latest']).toBeDefined();
      expect(mockApi['POST /patrol/run']).toBeDefined();
      expect(mockApi['GET /alerts']).toBeDefined();
    });
  });

  describe('Device APIs', () => {
    describe('GET /devices', () => {
      it('should return paginated device list', async () => {
        const result = await mockApi['GET /devices']({});

        expect(result).toBeDefined();
        expect(result.code).toBe(200);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.total).toBeGreaterThan(0);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.pageSize).toBe(20);
      });

      it('should filter devices by endpoint', async () => {
        const result = await mockApi['GET /devices']({ endpoint: 'max' });

        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach((device: any) => {
          expect(device.endpoint).toBe('max');
        });
      });

      it('should filter devices by type', async () => {
        const result = await mockApi['GET /devices']({ type: 'server' });

        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach((device: any) => {
          expect(device.type).toBe('server');
        });
      });

      it('should filter devices by status', async () => {
        const result = await mockApi['GET /devices']({ status: 'running' });

        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach((device: any) => {
          expect(device.status).toBe('running');
        });
      });

      it('should search devices by keyword', async () => {
        const result = await mockApi['GET /devices']({ keyword: 'Max' });

        expect(result.data.length).toBeGreaterThan(0);
      });

      it('should support pagination parameters', async () => {
        const result = await mockApi['GET /devices']({ page: '1', pageSize: '5' });

        expect(result.pagination.page).toBe(1);
        expect(result.pagination.pageSize).toBe(5);
        expect(result.data.length).toBeLessThanOrEqual(5);
      });

      it('should return device with required fields', async () => {
        const result = await mockApi['GET /devices']({});
        const device = result.data[0];

        expect(device.id).toBeDefined();
        expect(device.name).toBeDefined();
        expect(device.type).toBeDefined();
        expect(device.status).toBeDefined();
        expect(device.ip).toBeDefined();
        expect(device.cpuUsage).toBeDefined();
        expect(device.memoryUsage).toBeDefined();
      });
    });

    describe('GET /devices/:id', () => {
      it('should return single device by ID', async () => {
        const result = await mockApi['GET /devices/:id']('DEV-001');

        expect(result.code).toBe(200);
        expect(result.data.id).toBe('DEV-001');
        expect(result.data.name).toBe('Max-Server-Primary');
      });

      it('should throw error for non-existent device', async () => {
        try {
          await mockApi['GET /devices/:id']('NON-EXISTENT');
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeDefined();
          expect((error as any).status).toBe(404);
        }
      });
    });

    describe('GET /devices/stats', () => {
      it('should return device statistics', async () => {
        const result = await mockApi['GET /devices/stats']();

        expect(result.code).toBe(200);
        expect(result.data.total).toBeGreaterThan(0);
        expect(result.data.running).toBeDefined();
        expect(result.data.stopped).toBeDefined();
        expect(result.data.error).toBeDefined();
        expect(result.data.maintenance).toBeDefined();
        expect(result.data.byEndpoint).toBeDefined();
        expect(result.data.byType).toBeDefined();
      });
    });

    describe('PUT /devices/:id', () => {
      it('should update device properties', async () => {
        const updateData = { name: 'Updated Device Name' };
        const result = await mockApi['PUT /devices/:id']('DEV-001', updateData);

        expect(result.code).toBe(200);
        expect(result.data.name).toBe('Updated Device Name');
      });

      it('should throw error for non-existent device', async () => {
        try {
          await mockApi['PUT /devices/:id']('NON-EXISTENT', {});
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeDefined();
          expect((error as any).status).toBe(404);
        }
      });
    });
  });

  describe('Monitor APIs', () => {
    describe('GET /monitor/overview', () => {
      it('should return monitor overview data', async () => {
        const result = await mockApi['GET /monitor/overview']();

        expect(result.code).toBe(200);
        expect(result.data.totalDevices).toBeGreaterThan(0);
        expect(result.data.runningDevices).toBeDefined();
        expect(result.data.avgCpu).toBeDefined();
        expect(result.data.avgMemory).toBeDefined();
        expect(result.data.avgDisk).toBeDefined();
        expect(result.data.alerts).toBeDefined();
        expect(result.data.endpoints).toBeDefined();
      });

      it('should include endpoint-specific metrics', async () => {
        const result = await mockApi['GET /monitor/overview']();

        result.data.endpoints.forEach((endpoint: any) => {
          expect(endpoint.name).toBeDefined();
          expect(endpoint.cpu).toBeDefined();
          expect(endpoint.memory).toBeDefined();
          expect(endpoint.disk).toBeDefined();
          expect(endpoint.devices).toBeDefined();
        });
      });
    });

    describe('GET /monitor/realtime', () => {
      it('should return realtime monitoring data', async () => {
        const result = await mockApi['GET /monitor/realtime']();

        expect(result.code).toBe(200);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);

        const firstDataPoint = result.data[0];
        expect(firstDataPoint.time).toBeDefined();
        expect(firstDataPoint.cpu).toBeDefined();
        expect(firstDataPoint.memory).toBeDefined();
        expect(firstDataPoint.disk).toBeDefined();
        expect(firstDataPoint.networkIn).toBeDefined();
        expect(firstDataPoint.networkOut).toBeDefined();
      });

      it('should return multiple time-series data points', async () => {
        const result = await mockApi['GET /monitor/realtime']();

        expect(result.data.length).toBeGreaterThan(10); // Should have at least 30 points
      });
    });
  });

  describe('Audit APIs', () => {
    describe('GET /audit/logs', () => {
      it('should return paginated audit logs', async () => {
        const result = await mockApi['GET /audit/logs']({});

        expect(result.code).toBe(200);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.pagination).toBeDefined();
      });

      it('should filter logs by operation type', async () => {
        const result = await mockApi['GET /audit/logs']({ operationType: '配置变更' });

        if (result.data.length > 0) {
          result.data.forEach((log: any) => {
            expect(log.operationType).toBe('配置变更');
          });
        }
      });

      it('should filter logs by result', async () => {
        const result = await mockApi['GET /audit/logs']({ result: 'success' });

        if (result.data.length > 0) {
          result.data.forEach((log: any) => {
            expect(log.result).toBe('success');
          });
        }
      });

      it('should return log entries with required fields', async () => {
        const result = await mockApi['GET /audit/logs']({});

        if (result.data.length > 0) {
          const log = result.data[0];
          expect(log.id).toBeDefined();
          expect(log.operationType).toBeDefined();
          expect(log.operator).toBeDefined();
          expect(log.target).toBeDefined();
          expect(log.action).toBeDefined();
          expect(log.result).toBeDefined();
          expect(log.timestamp).toBeDefined();
        }
      });
    });

    describe('GET /audit/stats', () => {
      it('should return audit statistics', async () => {
        const result = await mockApi['GET /audit/stats']();

        expect(result.code).toBe(200);
        expect(result.data.total).toBeGreaterThan(0);
        expect(result.data.success).toBeDefined();
        expect(result.data.critical).toBeDefined();
        expect(result.data.byType).toBeDefined();
        expect(result.data.byOperator).toBeDefined();
      });
    });
  });

  describe('Permission APIs', () => {
    describe('GET /permissions/roles', () => {
      it('should return roles list', async () => {
        const result = await mockApi['GET /permissions/roles']();

        expect(result.code).toBe(200);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);

        const role = result.data[0];
        expect(role.id).toBeDefined();
        expect(role.name).toBeDefined();
        expect(role.permissions).toBeDefined();
      });
    });

    describe('GET /permissions/users', () => {
      it('should return users list', async () => {
        const result = await mockApi['GET /permissions/users']();

        expect(result.code).toBe(200);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);

        const user = result.data[0];
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
        expect(user.status).toBeDefined();
      });
    });

    describe('GET /permissions/matrix', () => {
      it('should return permission matrix', async () => {
        const result = await mockApi['GET /permissions/matrix']();

        expect(result.code).toBe(200);
        expect(result.data.features).toBeDefined();
        expect(result.data.roles).toBeDefined();
        expect(result.data.matrix).toBeDefined();
        expect(Array.isArray(result.data.features)).toBe(true);
        expect(Array.isArray(result.data.roles)).toBe(true);
      });
    });
  });

  describe('Operation APIs', () => {
    describe('GET /operations/logs', () => {
      it('should return operation logs', async () => {
        const result = await mockApi['GET /operations/logs']();

        expect(result.code).toBe(200);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
      });
    });

    describe('POST /operations/execute', () => {
      it('should execute operation and return task ID', async () => {
        const result = await mockApi['POST /operations/execute']();

        expect(result.code).toBe(200);
        expect(result.data.taskId).toBeDefined();
        expect(result.data.taskId.startsWith('TASK-')).toBe(true);
        expect(result.data.status).toBe('running');
      });
    });
  });

  describe('Patrol APIs', () => {
    describe('GET /patrol/latest', () => {
      it('should return latest patrol report', async () => {
        const result = await mockApi['GET /patrol/latest']();

        expect(result.code).toBe(200);
        expect(result.data.id).toBeDefined();
        expect(result.data.healthScore).toBeDefined();
        expect(result.data.totalChecks).toBeDefined();
        expect(result.data.passed).toBeDefined();
        expect(result.data.warnings).toBeDefined();
        expect(result.data.failures).toBeDefined();
        expect(result.data.checks).toBeDefined();
        expect(Array.isArray(result.data.checks)).toBe(true);
      });

      it('should include patrol check details', async () => {
        const result = await mockApi['GET /patrol/latest']();

        if (result.data.checks.length > 0) {
          const check = result.data.checks[0];
          expect(check.id).toBeDefined();
          expect(check.category).toBeDefined();
          expect(check.name).toBeDefined();
          expect(check.status).toBeDefined();
          expect(check.value).toBeDefined();
          expect(check.threshold).toBeDefined();
        }
      });
    });

    describe('POST /patrol/run', () => {
      it('should trigger patrol and return task ID', async () => {
        const result = await mockApi['POST /patrol/run']();

        expect(result.code).toBe(200);
        expect(result.data.taskId).toBeDefined();
        expect(result.data.taskId.startsWith('PATROL-')).toBe(true);
        expect(result.data.status).toBe('completed');
      });
    });
  });

  describe('Alert APIs', () => {
    describe('GET /alerts', () => {
      it('should return alerts list', async () => {
        const result = await mockApi['GET /alerts']({});

        expect(result.code).toBe(200);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      }, 10000);

      it('should filter alerts by level', async () => {
        const result = await mockApi['GET /alerts']({ level: 'critical' });

        if (Array.isArray(result.data) && result.data.length > 0) {
          (result.data as any[]).forEach((alert: any) => {
            expect(alert.level).toBe('critical');
          });
        }
      }, 10000);

      it('should return alert details with required fields', async () => {
        const result = await mockApi['GET /alerts']({});

        if (Array.isArray(result.data) && result.data.length > 0) {
          const alert = result.data[0];
          expect(alert.id).toBeDefined();
          expect(alert.level).toBeDefined();
          expect(alert.title).toBeDefined();
          expect(alert.device).toBeDefined();
          expect(alert.metric).toBeDefined();
          expect(alert.value).toBeDefined();
          expect(alert.timestamp).toBeDefined();
          expect(alert.status).toBeDefined();
        }
      }, 10000);
    });
  });

  describe('Response Format Validation', () => {
    it('all responses should have standard format', async () => {
      const endpoints: Array<[string, Record<string, string>?]> = [
        ['GET /devices', {}],
        ['GET /devices/stats'],
        ['GET /monitor/overview'],
        ['GET /monitor/realtime'],
        ['GET /audit/logs', {}],
        ['GET /audit/stats'],
        ['GET /permissions/roles'],
        ['GET /permissions/users'],
        ['GET /operations/logs'],
        ['GET /patrol/latest'],
        ['GET /alerts', {}],
      ];

      for (const [endpoint, params] of endpoints) {
        const result = await (mockApi as any)[endpoint](params);
        expect(result.code).toBe(200);
        expect(result.message).toBe('success');
        expect(result.timestamp).toBeDefined();
      }
    }, 30000);
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle empty filters gracefully', async () => {
      const result = await mockApi['GET /devices']({
        endpoint: 'non-existent',
        status: 'non-existent',
      });

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(0);
      expect((result as any).pagination?.total).toBe(0);
    }, 10000);

    it('should handle pagination beyond total items', async () => {
      const result = await mockApi['GET /devices']({ page: '999', pageSize: '10' });

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(0);
    }, 10000);

    it('should handle special characters in keyword search', async () => {
      const result = await mockApi['GET /devices']({ keyword: '192.168.1.100' });

      expect(result.code).toBe(200);
    }, 10000);
  });
});
