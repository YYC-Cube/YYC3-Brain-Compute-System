import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('API Config - Environment Detection', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.stubGlobal('window', {
      ...window,
      location: { ...originalLocation },
    })
    vi.stubGlobal('import.meta', {
      env: {},
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should detect localhost as development environment', async () => {
    Object.defineProperty(window.location, 'hostname', {
      value: 'localhost',
      writable: true,
    })

    const { API_CONFIG, ENVIRONMENT } = await import('../config')

    expect(ENVIRONMENT).toBe('development')
    expect(API_CONFIG.BASE_URL).toContain('192.168.3.100')
    expect(API_CONFIG.TEST_MODE).toBe(false)
  })

  it('should detect 127.0.0.1 as development environment', async () => {
    Object.defineProperty(window.location, 'hostname', {
      value: '127.0.0.1',
      writable: true,
    })

    const { ENVIRONMENT } = await import('../config')

    expect(ENVIRONMENT).toBe('development')
  })

  it('should use mock mode for GitHub Pages by default', async () => {
    Object.defineProperty(window.location, 'hostname', {
      value: 'yyc-cube.github.io',
      writable: true,
    })

    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_TEST_MODE: 'auto',
      },
    })

    const { API_CONFIG, ENVIRONMENT } = await import('../config')

    expect(ENVIRONMENT).toBe('mock')
    expect(API_CONFIG.BASE_URL).toBe('')
    expect(API_CONFIG.TEST_MODE).toBe(true)
  })

  it('should use mock mode for brain.yyc3.vip by default', async () => {
    Object.defineProperty(window.location, 'hostname', {
      value: 'brain.yyc3.vip',
      writable: true,
    })

    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_TEST_MODE: 'auto',
      },
    })

    const { API_CONFIG, ENVIRONMENT } = await import('../config')

    expect(ENVIRONMENT).toBe('mock')
    expect(API_CONFIG.TEST_MODE).toBe(true)
  })

  it('should respect explicit VITE_API_TEST_MODE=true', async () => {
    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_TEST_MODE: 'true',
      },
    })

    const { ENVIRONMENT } = await import('../config')

    expect(ENVIRONMENT).toBe('mock')
  })

  it('should respect explicit VITE_API_TEST_MODE=false', async () => {
    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_TEST_MODE: 'false',
      },
    })

    const { ENVIRONMENT } = await import('../config')

    expect(ENVIRONMENT).toBe('production')
  })

  it('should use custom BASE_URL when provided', async () => {
    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_BASE_URL: 'https://custom-api.example.com/api/v1',
        VITE_API_TEST_MODE: 'auto',
      },
    })

    const { API_CONFIG } = await import('../config')

    expect(API_CONFIG.BASE_URL).toBe('https://custom-api.example.com/api/v1')
  })

  it('should include environment header in auth config', async () => {
    const { AUTH_CONFIG } = await import('../config')
    const headers = AUTH_CONFIG.getHeaders()

    expect(headers['X-Environment']).toBeDefined()
    expect(headers['X-Client-Version']).toBe('3.2.0')
    expect(headers['Content-Type']).toBe('application/json')
  })
})
