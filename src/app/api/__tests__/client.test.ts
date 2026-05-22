import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '../../api/client'

describe('ApiError', () => {
  it('should create error with correct properties', () => {
    const error = new ApiError(404, '未找到', 'Not found', { detail: 'test' })
    expect(error.status).toBe(404)
    expect(error.messageZh).toBe('未找到')
    expect(error.messageEn).toBe('Not found')
    expect(error.data).toEqual({ detail: 'test' })
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Not found')
  })

  it('should be instance of Error', () => {
    const error = new ApiError(500, '服务器错误', 'Server error')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiError)
  })
})

describe('API_CONFIG', () => {
  it('should have required config keys', async () => {
    const { API_CONFIG } = await import('../../api/config')
    expect(API_CONFIG.BASE_URL).toBeDefined()
    expect(API_CONFIG.WS_URL).toBeDefined()
    expect(API_CONFIG.TIMEOUT).toBe(15000)
    expect(API_CONFIG.RETRY.maxAttempts).toBe(3)
    expect(API_CONFIG.PAGINATION.defaultPageSize).toBe(20)
  })

  it('should have TEST_MODE as boolean', async () => {
    const { API_CONFIG } = await import('../../api/config')
    expect(typeof API_CONFIG.TEST_MODE).toBe('boolean')
  })
})

describe('AUTH_CONFIG', () => {
  it('should return headers with content type', async () => {
    const { AUTH_CONFIG } = await import('../../api/config')
    localStorage.clear()
    const headers = AUTH_CONFIG.getHeaders()
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['Authorization']).toBeUndefined()
  })

  it('should include Bearer token when present', async () => {
    const { AUTH_CONFIG } = await import('../../api/config')
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, 'test-token-123')
    const headers = AUTH_CONFIG.getHeaders()
    expect(headers['Authorization']).toBe('Bearer test-token-123')
    localStorage.clear()
  })
})

describe('ERROR_MESSAGES', () => {
  it('should have messages for common HTTP status codes', async () => {
    const { ERROR_MESSAGES } = await import('../../api/config')
    expect(ERROR_MESSAGES[400]).toBeDefined()
    expect(ERROR_MESSAGES[401]).toBeDefined()
    expect(ERROR_MESSAGES[403]).toBeDefined()
    expect(ERROR_MESSAGES[404]).toBeDefined()
    expect(ERROR_MESSAGES[500]).toBeDefined()
    expect(ERROR_MESSAGES[400].zh).toBe('请求参数错误')
    expect(ERROR_MESSAGES[404].en).toBe('Resource not found')
  })
})
