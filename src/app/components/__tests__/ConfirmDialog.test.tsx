import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ConfirmDialog, useConfirmDialog } from '../../components/ConfirmDialog'

describe('ConfirmDialog — 敏感操作确认弹窗', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
    title: '确认删除',
    description: '此操作不可撤销',
    confirmText: '删除',
    cancelText: '取消',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('确认删除')).toBeTruthy()
    expect(screen.getByText('此操作不可撤销')).toBeTruthy()
  })

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('确认删除')).toBeNull()
  })

  it('calls onConfirm when confirm clicked', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    const btn = screen.getByText('删除')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce()
    })
  })

  it('applies destructive variant styles', () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />)
    const btn = screen.getByText('删除')
    expect(btn.className).toContain('bg-red-600')
  })
})

describe('useConfirmDialog', () => {
  function TestComponent() {
    const { confirm, dialogProps, close } = useConfirmDialog()
    return (
      <div>
        <button onClick={() => confirm({ title: 'Test', description: 'Desc', onConfirm: () => {} })}>
          trigger
        </button>
        <span data-testid="open">{String(dialogProps.open)}</span>
        <button onClick={close}>close</button>
      </div>
    )
  }

  it('starts closed', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('open').textContent).toBe('false')
  })

  it('opens on confirm call', () => {
    render(<TestComponent />)
    fireEvent.click(screen.getByText('trigger'))
    expect(screen.getByTestId('open').textContent).toBe('true')
  })

  it('closes on close call', () => {
    render(<TestComponent />)
    fireEvent.click(screen.getByText('trigger'))
    fireEvent.click(screen.getByText('close'))
    expect(screen.getByTestId('open').textContent).toBe('false')
  })
})
