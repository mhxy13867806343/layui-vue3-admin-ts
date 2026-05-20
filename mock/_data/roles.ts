/**
 * 角色数据 + 角色↔权限映射
 *
 * 设计点：
 * - `rolePermissionMap` 以「角色编码 -> 权限码数组」存储，与业务侧权限校验语义一致
 * - `Super_Admin` 拥有 ALL_PERMISSION_CODES（全部权限）
 * - `Basic_User` 仅持有 4 个查看类权限，符合"基础查看"语义
 */
import type { Role } from '@/types/domain'
import { ALL_PERMISSION_CODES } from './permissions'

export const roles: Role[] = [
  {
    id: 1,
    code: 'Super_Admin',
    name: '超级管理员',
    description: '拥有全部权限',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
  },
  {
    id: 2,
    code: 'Basic_User',
    name: '基础用户',
    description: '仅查看权限',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
  },
]

/** 角色编码 -> 权限码数组 */
export const rolePermissionMap: Record<string, string[]> = {
  Super_Admin: [...ALL_PERMISSION_CODES],
  Basic_User: ['dashboard:view', 'user:view', 'role:view', 'menu:view'],
}

/** 取下一个可用角色 id */
export function nextRoleId(): number {
  return roles.reduce((acc, r) => Math.max(acc, r.id), 0) + 1
}
