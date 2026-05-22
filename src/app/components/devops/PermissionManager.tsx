import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Users, Key, CheckCircle, XCircle, Eye, Edit3,
  Plus, Trash2, ChevronDown, UserCog, Lock, Unlock, Settings
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Mock Data =====
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
}

interface Role {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  userCount: number;
  permissions: string[];
  color: string;
}

const MOCK_USERS: User[] = [
  { id: 'U-001', name: '管理员', email: 'admin@yyc3.local', role: 'super_admin', status: 'active', lastLogin: '2026-02-22 14:30', avatar: 'A' },
  { id: 'U-002', name: '张三', email: 'zhangsan@yyc3.local', role: 'system_admin', status: 'active', lastLogin: '2026-02-22 15:45', avatar: 'Z' },
  { id: 'U-003', name: '王五', email: 'wangwu@yyc3.local', role: 'security_admin', status: 'active', lastLogin: '2026-02-21 11:30', avatar: 'W' },
  { id: 'U-004', name: '李四', email: 'lisi@yyc3.local', role: 'system_admin', status: 'active', lastLogin: '2026-02-22 15:45', avatar: 'L' },
  { id: 'U-005', name: '赵六', email: 'zhaoliu@yyc3.local', role: 'auditor', status: 'active', lastLogin: '2026-02-20 09:15', avatar: 'ZL' },
  { id: 'U-006', name: '钱七', email: 'qianqi@yyc3.local', role: 'business_owner', status: 'inactive', lastLogin: '2026-02-15 16:00', avatar: 'Q' },
  { id: 'U-007', name: '孙八', email: 'sunba@yyc3.local', role: 'user', status: 'active', lastLogin: '2026-02-22 10:00', avatar: 'S' },
];

const MOCK_ROLES: Role[] = [
  {
    id: 'super_admin', name: '超级管理员', nameEn: 'Super Admin',
    description: '系统最高权限，可管理所有功能', descriptionEn: 'Full system access and user management',
    userCount: 1, color: 'from-red-500 to-orange-500',
    permissions: ['*']
  },
  {
    id: 'system_admin', name: '系统管理员', nameEn: 'System Admin',
    description: '日常运维管理，设备管理与配置变更', descriptionEn: 'Daily ops, device management & config changes',
    userCount: 2, color: 'from-blue-500 to-cyan-500',
    permissions: ['device:read', 'device:write', 'device:create', 'device:delete', 'config:read', 'config:write', 'monitor:read', 'audit:read']
  },
  {
    id: 'security_admin', name: '安全管理员', nameEn: 'Security Admin',
    description: '安全策略管理与安全审计', descriptionEn: 'Security policy management & audit',
    userCount: 1, color: 'from-purple-500 to-pink-500',
    permissions: ['device:read', 'config:read', 'config:write:security', 'monitor:read', 'audit:read', 'audit:export']
  },
  {
    id: 'auditor', name: '审计人员', nameEn: 'Auditor',
    description: '操作审计查看与报告导出', descriptionEn: 'Audit viewing & report export',
    userCount: 1, color: 'from-green-500 to-emerald-500',
    permissions: ['device:read', 'monitor:read', 'audit:read', 'audit:export']
  },
  {
    id: 'business_owner', name: '业务负责人', nameEn: 'Business Owner',
    description: '业务需求管理与变更验收', descriptionEn: 'Business requirements & change approval',
    userCount: 1, color: 'from-yellow-500 to-amber-500',
    permissions: ['device:read', 'monitor:read', 'change:request', 'change:approve']
  },
  {
    id: 'user', name: '普通用户', nameEn: 'User',
    description: '仅查看权限', descriptionEn: 'View-only access',
    userCount: 1, color: 'from-gray-500 to-gray-600',
    permissions: ['device:read', 'monitor:read']
  },
];

// Permission matrix for the table
const PERMISSION_MATRIX = [
  { resource: '设备信息查看', resourceEn: 'View Devices', super_admin: true, system_admin: true, security_admin: true, auditor: true, business_owner: true, user: true },
  { resource: '设备信息编辑', resourceEn: 'Edit Devices', super_admin: true, system_admin: true, security_admin: false, auditor: false, business_owner: false, user: false },
  { resource: '设备新增/退役', resourceEn: 'Add/Retire', super_admin: true, system_admin: true, security_admin: false, auditor: false, business_owner: false, user: false },
  { resource: '配置变更', resourceEn: 'Config Change', super_admin: true, system_admin: true, security_admin: true, auditor: false, business_owner: false, user: false },
  { resource: '实时监控', resourceEn: 'Live Monitor', super_admin: true, system_admin: true, security_admin: true, auditor: true, business_owner: true, user: true },
  { resource: '告警处理', resourceEn: 'Handle Alerts', super_admin: true, system_admin: true, security_admin: true, auditor: false, business_owner: false, user: false },
  { resource: '操作审计查看', resourceEn: 'View Audit', super_admin: true, system_admin: true, security_admin: true, auditor: true, business_owner: true, user: false },
  { resource: '审计报告导出', resourceEn: 'Export Audit', super_admin: true, system_admin: false, security_admin: true, auditor: true, business_owner: false, user: false },
  { resource: '用户管理', resourceEn: 'User Mgmt', super_admin: true, system_admin: false, security_admin: false, auditor: false, business_owner: false, user: false },
  { resource: '角色管理', resourceEn: 'Role Mgmt', super_admin: true, system_admin: false, security_admin: false, auditor: false, business_owner: false, user: false },
];

export function PermissionManager() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [activeTab, setActiveTab] = useState('roles');

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Shield className="w-6 h-6" />
            {isZh ? '权限管理' : 'Permission Management'}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-500/30">
              RBAC
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>{isZh ? '基于角色的访问控制与权限分配' : 'Role-based access control & permission assignment'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 shrink-0">
        {[
          { key: 'roles', label: isZh ? '角色管理' : 'Roles', icon: <Key className="w-3.5 h-3.5" /> },
          { key: 'users', label: isZh ? '用户管理' : 'Users', icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'matrix', label: isZh ? '权限矩阵' : 'Matrix', icon: <Settings className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs transition-all ${
              activeTab === tab.key
                ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
            style={{ fontSize: '0.75rem' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'roles' && (
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {MOCK_ROLES.map((role, idx) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-600 transition-all overflow-hidden group">
                    {/* Color Header */}
                    <div className={`h-1.5 bg-gradient-to-r ${role.color}`} />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-white font-bold" style={{ fontWeight: 700 }}>{isZh ? role.name : role.nameEn}</h3>
                          <p className="text-xs text-gray-500 mt-0.5" style={{ fontSize: '0.7rem' }}>{isZh ? role.description : role.descriptionEn}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-lg" style={{ fontSize: '0.7rem' }}>
                          <Users className="w-3 h-3" /> {role.userCount}
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="space-y-1.5 mt-4">
                        <div className="text-[10px] text-gray-500 font-mono uppercase" style={{ fontSize: '0.625rem' }}>{isZh ? '权限列表' : 'Permissions'}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.slice(0, 5).map((perm, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300" style={{ fontSize: '0.625rem' }}>
                              {perm === '*' ? (isZh ? '全部权限' : 'ALL') : perm}
                            </span>
                          ))}
                          {role.permissions.length > 5 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400" style={{ fontSize: '0.625rem' }}>
                              +{role.permissions.length - 5}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                          <Edit3 className="w-3.5 h-3.5" /> {isZh ? '编辑' : 'Edit'}
                        </button>
                        <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-xs" style={{ fontSize: '0.75rem' }}>
                          <UserCog className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
                <table className="w-full text-sm" style={{ fontSize: '0.875rem' }}>
                  <thead className="bg-gray-900/90">
                    <tr className="border-b border-gray-700/50">
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '用户' : 'User'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden md:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '邮箱' : 'Email'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '角色' : 'Role'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden lg:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '状态' : 'Status'}</th>
                      <th className="py-3 px-4 text-left text-gray-400 font-mono uppercase text-xs hidden lg:table-cell" style={{ fontSize: '0.7rem' }}>{isZh ? '最后登录' : 'Last Login'}</th>
                      <th className="py-3 px-4 text-right text-gray-400 font-mono uppercase text-xs" style={{ fontSize: '0.7rem' }}>{isZh ? '操作' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_USERS.map((user, idx) => {
                      const role = MOCK_ROLES.find(r => r.id === user.role);
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${role?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-[10px] text-white font-bold shrink-0`} style={{ fontSize: '0.625rem' }}>
                                {user.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm text-white font-medium truncate" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{user.name}</div>
                                <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <span className="text-xs text-gray-400 font-mono" style={{ fontSize: '0.75rem' }}>{user.email}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gradient-to-r ${role?.color || ''} bg-opacity-10 text-white border border-white/10`} style={{ fontSize: '0.7rem' }}>
                              {isZh ? role?.name : role?.nameEn}
                            </span>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                              <span className={`text-xs ${user.status === 'active' ? 'text-green-400' : 'text-gray-500'}`} style={{ fontSize: '0.75rem' }}>
                                {user.status === 'active' ? (isZh ? '活跃' : 'Active') : (isZh ? '未激活' : 'Inactive')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <span className="text-xs text-gray-400 font-mono" style={{ fontSize: '0.7rem' }}>{user.lastLogin}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-800 transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'matrix' && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FuturisticPanel title={isZh ? '权限控制矩阵' : 'Permission Control Matrix'} subtitle={isZh ? '角色 × 功能 权限映射' : 'Role × Feature permission mapping'}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="py-3 px-3 text-left text-gray-400 font-mono uppercase text-xs sticky left-0 bg-gray-900/90 z-10" style={{ fontSize: '0.65rem' }}>
                          {isZh ? '功能模块' : 'Feature'}
                        </th>
                        {MOCK_ROLES.map(role => (
                          <th key={role.id} className="py-3 px-3 text-center text-gray-400 font-mono uppercase text-xs whitespace-nowrap" style={{ fontSize: '0.6rem' }}>
                            <div className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${role.color} mr-1`} />
                            {isZh ? role.name : role.nameEn}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSION_MATRIX.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                          <td className="py-2.5 px-3 text-gray-300 sticky left-0 bg-gray-900/80 z-10" style={{ fontSize: '0.75rem' }}>
                            {isZh ? row.resource : row.resourceEn}
                          </td>
                          {MOCK_ROLES.map(role => {
                            const hasPermission = (row as any)[role.id];
                            return (
                              <td key={role.id} className="py-2.5 px-3 text-center">
                                {hasPermission ? (
                                  <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-gray-700 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FuturisticPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
