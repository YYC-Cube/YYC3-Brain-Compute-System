/**
 * file ErrorBoundary.tsx
 * description 全局+模块级错误边界 — 捕获组件崩溃，防止白屏
 * author YanYuCloudCube Team
 * version v3.1.0
 * created 2026-05-19
 * updated 2026-05-19
 * status: active
 * tags: [error-handling],[boundary],[safety]
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  module?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.module ? `:${this.props.module}` : ''}]`, error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-gray-900/50 rounded-lg border border-red-500/30">
          <div className="text-red-400 text-lg font-bold mb-2">
            {this.props.module ? `${this.props.module} 模块异常` : '系统异常'}
          </div>
          <div className="text-gray-400 text-sm mb-4 max-w-md text-center">
            {this.state.error?.message || '未知错误'}
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-sm transition-colors"
          >
            重新加载
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function GlobalErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950 z-[9999]">
      <div className="max-w-lg w-full p-8 bg-gray-900 rounded-2xl border border-red-500/30 shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">YYC³ Brain Computer System</h1>
        <p className="text-red-400 text-lg font-semibold mb-2">系统遇到未预期的错误</p>
        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
          {error?.message || '发生了一个未知错误，请尝试重新加载页面。'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
          >
            重新加载
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  )
}
