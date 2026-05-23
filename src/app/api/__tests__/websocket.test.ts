import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_CONFIG } from '../../api/config';
import { WebSocketManager } from '../../api/websocket';

describe('WebSocket Manager', () => {
  let wsManager: WebSocketManager;

  beforeEach(() => {
    vi.resetModules();
    wsManager = new WebSocketManager();
  });

  afterEach(() => {
    try {
      wsManager.disconnect();
    } catch (_________e) {
      // Ignore disconnect errors
    }
    vi.restoreAllMocks();
  });

  describe('Constructor & Initial State', () => {
    it('should create WebSocketManager instance', () => {
      expect(wsManager).toBeInstanceOf(WebSocketManager);
    });

    it('should have initial status as disconnected', () => {
      expect(wsManager.status).toBe('disconnected');
    });

    it('should expose core methods', () => {
      expect(typeof wsManager.on).toBe('function');
      expect(typeof wsManager.disconnect).toBe('function');
      expect(typeof wsManager.connect).toBe('function');
      expect(typeof wsManager.send).toBe('function');
      expect(typeof wsManager.onStatus).toBe('function');
    });
  });

  describe('on() - Message Subscription', () => {
    it('should register message handler and return unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = wsManager.on('monitor', handler);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('onStatus() - Status Monitoring', () => {
    it('should register status change handler and return unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = wsManager.onStatus(handler);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('send()', () => {
    it('should not throw when sending while disconnected', () => {
      expect(() => wsManager.send({ type: 'test' })).not.toThrow();
    });
  });

  describe('disconnect()', () => {
    it('should not throw when disconnecting without connection', () => {
      expect(() => wsManager.disconnect()).not.toThrow();
    });

    it('should set status to disconnected after disconnect', () => {
      const statusHandler = vi.fn();
      wsManager.onStatus(statusHandler);

      wsManager.disconnect();

      expect(statusHandler).toHaveBeenCalledWith('disconnected');
    });
  });

  describe('API Configuration Integration', () => {
    it('should have valid WS_RECONNECT configuration', () => {
      expect(API_CONFIG.WS_RECONNECT.maxAttempts).toBeGreaterThan(0);
      expect(API_CONFIG.WS_RECONNECT.baseDelay).toBeGreaterThan(0);
      expect(API_CONFIG.WS_RECONNECT.maxDelay).toBeGreaterThan(0);
    });

    it('should have valid WS_URL configuration', () => {
      expect(typeof API_CONFIG.WS_URL).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple subscriptions to same type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsub1 = wsManager.on('monitor', handler1);
      const unsub2 = wsManager.on('monitor', handler2);

      expect(typeof unsub1).toBe('function');
      expect(typeof unsub2).toBe('function');
    });

    it('should handle rapid subscribe/unsubscribe cycles', () => {
      for (let i = 0; i < 10; i++) {
        const handler = vi.fn();
        const unsub = wsManager.on('test', handler);
        unsub();
      }

      expect(true).toBe(true); // Should not throw
    });
  });
});
