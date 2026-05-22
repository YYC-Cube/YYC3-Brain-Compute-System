/**
 * file schemas.ts
 * description zod 输入校验 schema — API 请求参数验证
 * author YanYuCloudCube Team
 * version v3.1.0
 * created 2026-05-19
 * updated 2026-05-19
 * status: active
 * tags: [validation],[zod],[security]
 */

import { z } from 'zod'

export const LoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名过长'),
  password: z.string().min(6, '密码至少6位').max(128, '密码过长'),
})

export const DeviceCreateSchema = z.object({
  name: z.string().min(1, '设备名称不能为空').max(100),
  type: z.enum(['server', 'database', 'instance', 'network', 'storage']),
  endpoint: z.enum(['max', 'nas', 'ecs']),
  ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'IP格式无效'),
  port: z.number().int().min(1).max(65535),
  description: z.string().max(500).optional(),
})

export const DeviceUpdateSchema = DeviceCreateSchema.partial()

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const MonitorHistorySchema = z.object({
  deviceId: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  interval: z.enum(['1m', '5m', '15m', '1h', '6h', '1d']).default('5m'),
  metrics: z.string().optional(),
})

export const AuditListSchema = PaginationSchema.extend({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  operator: z.string().optional(),
  operationType: z.string().optional(),
  result: z.enum(['success', 'failure', 'partial']).optional(),
  keyword: z.string().max(100).optional(),
})

export const CLIExecuteSchema = z.object({
  command: z.string().min(1, '命令不能为空').max(2000, '命令过长'),
  timeout: z.number().int().min(1000).max(60000).default(30000),
})

export const AlertThresholdSchema = z.object({
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  disk: z.number().min(0).max(100),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type DeviceCreateInput = z.infer<typeof DeviceCreateSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>
export type MonitorHistoryInput = z.infer<typeof MonitorHistorySchema>
export type CLIExecuteInput = z.infer<typeof CLIExecuteSchema>
