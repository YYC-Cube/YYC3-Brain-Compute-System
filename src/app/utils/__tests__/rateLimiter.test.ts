import { describe, expect, it, vi } from 'vitest'
import { RateLimiter, createRateLimiter } from '../rateLimiter'

describe('RateLimiter', () => {
  it('should allow requests within limit', () => {
    const limiter = new RateLimiter(5, 10000)
    const result = limiter.check('test-key')

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })

  it('should block requests when limit exceeded', () => {
    const limiter = new RateLimiter(2, 10000)

    limiter.check('test-key')
    limiter.check('test-key')
    const result = limiter.check('test-key')

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset after window expires', () => {
    const limiter = new RateLimiter(1, 100)
    vi.useFakeTimers()

    limiter.check('test-key')
    const blocked = limiter.check('test-key')
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(101)
    const allowed = limiter.check('test-key')
    expect(allowed.allowed).toBe(true)

    vi.useRealTimers()
  })

  it('should handle different keys independently', () => {
    const limiter = new RateLimiter(1, 10000)

    const result1 = limiter.check('key-1')
    const result2 = limiter.check('key-2')

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
  })

  it('should reset specific key', () => {
    const limiter = new RateLimiter(1, 10000)

    limiter.check('test-key')
    limiter.reset('test-key')

    const result = limiter.check('test-key')
    expect(result.allowed).toBe(true)
  })

  it('should clear all entries', () => {
    const limiter = new RateLimiter(1, 10000)

    limiter.check('key-1')
    limiter.check('key-2')
    limiter.clear()

    const result1 = limiter.check('key-1')
    const result2 = limiter.check('key-2')

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
  })

  it('should create rate limiter with custom config', () => {
    const limiter = createRateLimiter(3, 5000)

    const result = limiter.check('custom')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })
})
