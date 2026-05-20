/**
 * 权限码全集
 *
 * 设计点：
 * - `code` 全局唯一，业务侧通过 code 判断权限
 * - `type` 区分菜单类与按钮类：
 *   - 菜单类：与 menu.permission 一一对应，控制可见性
 *   - 按钮类：用于行内操作（新增 / 修改 / 删除 / 重置密码 / 分配权限）
 * - `Super_Admin` 角色覆盖 ALL_PERMISSION_CODES（所有权限均通过）
 */
import type { Permission } from '@/types/domain'

/**
 * Mock 内部权限实体（type 仅取 menu / button 两类，未涉及 api 类）。
 * 与 `@/types/domain` 中的 Permission 字段名保持一致。
 */
export interface MockPermission extends Permission {
  type: 'menu' | 'button'
}

export const permissions: MockPermission[] = [
  // 仪表盘
  { code: 'dashboard:view', name: '仪表盘查看', type: 'menu' },

  // 用户管理
  { code: 'user:view', name: '用户查看', type: 'menu' },
  { code: 'user:create', name: '用户新增', type: 'button' },
  { code: 'user:update', name: '用户修改', type: 'button' },
  { code: 'user:delete', name: '用户删除', type: 'button' },
  { code: 'user:reset-password', name: '用户重置密码', type: 'button' },

  // 角色管理
  { code: 'role:view', name: '角色查看', type: 'menu' },
  { code: 'role:create', name: '角色新增', type: 'button' },
  { code: 'role:update', name: '角色修改', type: 'button' },
  { code: 'role:delete', name: '角色删除', type: 'button' },
  { code: 'role:assign', name: '角色分配权限', type: 'button' },

  // 菜单管理
  { code: 'menu:view', name: '菜单查看', type: 'menu' },
  { code: 'menu:create', name: '菜单新增', type: 'button' },
  { code: 'menu:update', name: '菜单修改', type: 'button' },
  { code: 'menu:delete', name: '菜单删除', type: 'button' },
]

/** 全部权限码集合（Super_Admin 直接持有） */
export const ALL_PERMISSION_CODES: string[] = permissions.map((p) => p.code)
