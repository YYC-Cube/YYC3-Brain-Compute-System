/**
 * file useNetworkStatus.ts
 * description 网络状态检测Hook — 监听在线/离线状态变化
 * author YanYuCloudCube Team
 * version v3.1.0
 * created 2026-05-19
 * updated 2026-05-19
 * status: active
 * tags: [hook],[network],[status]
 */

import { useState, useEffect, useCallback } from 'react'

interface NetworkStatus {
  isOnline: boolean
  lastChanged: Date | null
  wasOffline: boolean
}

export function useNetworkStatus(): NetworkStatus & { retryConnection: () => void } {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastChanged: null,
    wasOffline: false,
  }))

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        isOnline: true,
        lastChanged: new Date(),
        wasOffline: prev.wasOffline || !prev.isOnline,
      }))
    }

    const handleOffline = () => {
      setStatus(prev => ({
        isOnline: false,
        lastChanged: new Date(),
        wasOffline: prev.wasOffline,
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const retryConnection = useCallback(() => {
    window.location.reload()
  }, [])

  return { ...status, retryConnection }
}
