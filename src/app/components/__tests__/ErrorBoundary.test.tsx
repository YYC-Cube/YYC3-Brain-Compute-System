import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ErrorBoundary } from '../../components/ErrorBoundary';

function ThrowError({ error }: { error: Error }): React.ReactElement {
  throw error;
}

describe('ErrorBoundary', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('[ErrorBoundary')) return;
      if (typeof args[0] === 'string' && args[0].includes('The above error occurred')) return;
      originalError.call(console, ...args);
    };
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>正常内容</div>
      </ErrorBoundary>
    );
    expect(getByText('正常内容')).toBeInTheDocument();
  });

  it('should render error UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary module="测试模块">
        <ThrowError error={new Error('测试崩溃')} />
      </ErrorBoundary>
    );
    expect(getByText('测试模块 模块异常')).toBeInTheDocument();
    expect(getByText('测试崩溃')).toBeInTheDocument();
    expect(getByText('重新加载')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<div>自定义错误</div>}>
        <ThrowError error={new Error('oops')} />
      </ErrorBoundary>
    );
    expect(getByText('自定义错误')).toBeInTheDocument();
  });

  it('should recover after reset', () => {
    const { getByText, queryByText, rerender } = render(
      <ErrorBoundary module="恢复测试">
        <ThrowError error={new Error('崩溃')} />
      </ErrorBoundary>
    );
    expect(getByText('恢复测试 模块异常')).toBeInTheDocument();
    getByText('重新加载').click();
    rerender(
      <ErrorBoundary module="恢复测试">
        <div>已恢复</div>
      </ErrorBoundary>
    );
    expect(queryByText('恢复测试 模块异常')).not.toBeInTheDocument();
    expect(getByText('已恢复')).toBeInTheDocument();
  });
});
