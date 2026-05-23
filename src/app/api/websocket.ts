/**
 * YYC³ API — WebSocket 管理器
 * 
 * 功能: 实时数据推送 (监控/告警/巡查/操作日志)
 * 特性: 自动重连、指数退避、心跳检测、多频道订阅
 */

import { API_CONFIG } from './config';
import type { WSMessage } from './types';

type MessageHandler = (_message: WSMessage) => void;
type StatusHandler = (_status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

interface WSChannel {
  type: string;
  params?: Record<string, string>;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private channels: WSChannel[] = [];
  private _status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  get status() {
    return this._status;
  }

  // ===== 连接 =====
  connect(channels: WSChannel[] = []): void {
    this.channels = channels;
    this.setStatus('connecting');

    try {
      const params = new URLSearchParams();
      channels.forEach(ch => {
        params.append('subscribe', ch.type);
        if (ch.params) {
          Object.entries(ch.params).forEach(([k, v]) => params.append(k, v));
        }
      });

      const token = localStorage.getItem('yyc3_access_token');
      if (token) params.append('token', token);

      const url = `${API_CONFIG.WS_URL}?${params.toString()}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
// [REMOVED] console.log('[WS] Connected');
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);

          // 心跳响应
          if (message.type === 'pong' as string) return;

          // 分发到对应 handler
          const handlers = this.handlers.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message));
          }

          // 通配符 handler
          const allHandlers = this.handlers.get('*');
          if (allHandlers) {
            allHandlers.forEach(handler => handler(message));
          }
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      this.ws.onerror = (event) => {
        console.error('[WS] Error:', event);
        this.setStatus('error');
      };

      this.ws.onclose = (_event) => {
// [REMOVED] console.log('[WS] Closed:', event.code, event.reason);
        this.setStatus('disconnected');
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

    } catch (err) {
      console.error('[WS] Connection failed:', err);
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  // ===== 断开 =====
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    this.reconnectAttempts = API_CONFIG.WS_RECONNECT.maxAttempts; // 阻止重连

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  // ===== 订阅消息 =====
  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // 返回取消订阅函数
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  // ===== 监听连接状态 =====
  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  // ===== 发送消息 =====
  send(message: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // ===== 内部方法 =====
  private setStatus(status: typeof this._status): void {
    this._status = status;
    this.statusHandlers.forEach(handler => handler(status));
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= API_CONFIG.WS_RECONNECT.maxAttempts) {
// [REMOVED] console.log('[WS] Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(
      API_CONFIG.WS_RECONNECT.baseDelay * Math.pow(2, this.reconnectAttempts),
      API_CONFIG.WS_RECONNECT.maxDelay
    );

// [REMOVED] console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.channels);
    }, delay);
  }
}

// ===== 全局单例 =====
export const wsManager = new WebSocketManager();
