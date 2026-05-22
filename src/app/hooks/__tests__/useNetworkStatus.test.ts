import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

describe('useNetworkStatus', () => {
  it('should return isOnline as boolean', () => {
    const { result } = renderHook(() => useNetworkStatus())
    expect(typeof result.current.isOnline).toBe('boolean')
  })

  it('should have retryConnection function', () => {
    const { result } = renderHook(() => useNetworkStatus())
    expect(typeof result.current.retryConnection).toBe('function')
  })

  it('should default to navigator.onLine', () => {
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.isOnline).toBe(navigator.onLine)
  })

  it('should respond to online event', () => {
    const { result } = renderHook(() => useNetworkStatus())
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current.isOnline).toBe(true)
  })

  it('should respond to offline event', () => {
    const { result } = renderHook(() => useNetworkStatus())
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current.isOnline).toBe(false)
  })
})
