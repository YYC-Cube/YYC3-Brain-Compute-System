/**
 * file rateLimiter.ts
 * description 前端请求节流器 — 防止短时间内重复请求
 * author YanYuCloudCube Team
 * version v3.1.0
 * created 2026-05-19
 * updated 2026-05-19
 * status: active
 * tags: [security],[rate-limit],[throttle]
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private entries = new Map<string, RateLimitEntry>()

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 10000,
  ) {}

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.entries.get(key)

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.windowMs
      this.entries.set(key, { count: 1, resetAt })
      return { allowed: true, remaining: this.maxRequests - 1, resetAt }
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count++
    return { allowed: true, remaining: this.maxRequests - entry.count, resetAt: entry.resetAt }
  }

  reset(key: string): void {
    this.entries.delete(key)
  }

  clear(): void {
    this.entries.clear()
  }
}

export const apiRateLimiter = new RateLimiter(10, 10000)
export const loginRateLimiter = new RateLimiter(5, 60000)
export const cliRateLimiter = new RateLimiter(20, 10000)

export function createRateLimiter(maxRequests: number, windowMs: number): RateLimiter {
  return new RateLimiter(maxRequests, windowMs)
}
