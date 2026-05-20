/**
 * 权限校验工具
 *
 * - hasPermission：使用 Pinia store，供组件 / 指令调用
 * - hasPermissionPure：纯函数，供路由守卫与属性测试调用
 *
 * 设计点：
 *   1. 空入参（undefined / null / 空数组）视为「无权限要求」，恒返回 true
 *   2. Super_Admin 角色对任意权限码恒返回 true
 *   3. 数组入参采用「任一命中即通过」语义
 */
import { useUserStore } from '@/store/modules/user'

export const SUPER_ADMIN_CODE = 'Super_Admin'

export function hasPermission(code: string | string[] | undefined | null): boolean {
  if (!code) return true
  if (Array.isArray(code) && code.length === 0) return true
  const store = useUserStore()
  if (store.roles.includes(SUPER_ADMIN_CODE)) return true
  const owned = store.permissions
  const need = Array.isArray(code) ? code : [code]
  return need.some((c) => owned.includes(c))
}

// 纯函数版本：用于路由守卫与属性测试，避免在守卫纯函数内部访问 Pinia
export function hasPermissionPure(
  code: string | string[] | undefined | null,
  ctx: { roles: string[]; owned: string[] },
): boolean {
  if (!code) return true
  if (Array.isArray(code) && code.length === 0) return true
  if (ctx.roles.includes(SUPER_ADMIN_CODE)) return true
  const need = Array.isArray(code) ? code : [code]
  return need.some((c) => ctx.owned.includes(c))
}
