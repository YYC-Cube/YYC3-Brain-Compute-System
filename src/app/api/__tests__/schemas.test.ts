import { describe, expect, it } from 'vitest';
import {
    AlertThresholdSchema,
    AuditListSchema,
    CLIExecuteSchema,
    DeviceCreateSchema,
    LoginSchema,
    MonitorHistorySchema,
    PaginationSchema,
} from '../schemas';

describe('schemas — zod输入校验', () => {
  describe('LoginSchema', () => {
    it('accepts valid login', () => {
      const result = LoginSchema.safeParse({ username: 'admin', password: '123456' });
      expect(result.success).toBe(true);
    });
    it('rejects empty username', () => {
      const result = LoginSchema.safeParse({ username: '', password: '123456' });
      expect(result.success).toBe(false);
    });
    it('rejects short password', () => {
      const result = LoginSchema.safeParse({ username: 'admin', password: '123' });
      expect(result.success).toBe(false);
    });
    it('rejects missing fields', () => {
      const result = LoginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('DeviceCreateSchema', () => {
    it('accepts valid device', () => {
      const result = DeviceCreateSchema.safeParse({
        name: 'Server-01',
        type: 'server',
        endpoint: 'max',
        ip: '192.168.3.100',
        port: 3118,
      });
      expect(result.success).toBe(true);
    });
    it('rejects invalid IP', () => {
      const result = DeviceCreateSchema.safeParse({
        name: 'Server-01',
        type: 'server',
        endpoint: 'max',
        ip: 'not-an-ip',
        port: 3118,
      });
      expect(result.success).toBe(false);
    });
    it('rejects invalid type', () => {
      const result = DeviceCreateSchema.safeParse({
        name: 'Server-01',
        type: 'invalid',
        endpoint: 'max',
        ip: '192.168.3.100',
        port: 3118,
      });
      expect(result.success).toBe(false);
    });
    it('rejects out-of-range port', () => {
      const result = DeviceCreateSchema.safeParse({
        name: 'Server-01',
        type: 'server',
        endpoint: 'max',
        ip: '192.168.3.100',
        port: 99999,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('PaginationSchema', () => {
    it('applies defaults', () => {
      const result = PaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
    it('coerces string to number', () => {
      const result = PaginationSchema.parse({ page: '3', pageSize: '50' });
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(50);
    });
    it('rejects pageSize > 100', () => {
      const result = PaginationSchema.safeParse({ pageSize: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe('MonitorHistorySchema', () => {
    it('applies default interval', () => {
      const result = MonitorHistorySchema.parse({});
      expect(result.interval).toBe('5m');
    });
    it('accepts valid interval', () => {
      const result = MonitorHistorySchema.parse({ interval: '1h' });
      expect(result.interval).toBe('1h');
    });
    it('rejects invalid interval', () => {
      const result = MonitorHistorySchema.safeParse({ interval: '2h' });
      expect(result.success).toBe(false);
    });
  });

  describe('AuditListSchema', () => {
    it('extends pagination with audit filters', () => {
      const result = AuditListSchema.parse({
        page: 2,
        pageSize: 10,
        operator: 'admin',
        result: 'success',
      });
      expect(result.page).toBe(2);
      expect(result.operator).toBe('admin');
    });
  });

  describe('CLIExecuteSchema', () => {
    it('accepts valid command', () => {
      const result = CLIExecuteSchema.parse({ command: 'ls -la' });
      expect(result.command).toBe('ls -la');
      expect(result.timeout).toBe(30000);
    });
    it('rejects empty command', () => {
      const result = CLIExecuteSchema.safeParse({ command: '' });
      expect(result.success).toBe(false);
    });
    it('rejects oversized command', () => {
      const result = CLIExecuteSchema.safeParse({ command: 'x'.repeat(2001) });
      expect(result.success).toBe(false);
    });
  });

  describe('AlertThresholdSchema', () => {
    it('accepts valid thresholds', () => {
      const result = AlertThresholdSchema.parse({ cpu: 80, memory: 90, disk: 85 });
      expect(result.cpu).toBe(80);
    });
    it('rejects negative values', () => {
      const result = AlertThresholdSchema.safeParse({ cpu: -1, memory: 50, disk: 50 });
      expect(result.success).toBe(false);
    });
    it('rejects values > 100', () => {
      const result = AlertThresholdSchema.safeParse({ cpu: 101, memory: 50, disk: 50 });
      expect(result.success).toBe(false);
    });
  });
});
