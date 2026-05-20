import { hasPermissionPure } from '@/utils/permission'

export type NavDecision =
  | { type: 'pass' }
  | { type: 'redirect'; path: string; query?: Record<string, string> }

export interface DecideContext {
  to: string
  hasToken: boolean
  whitelist: string[]
  registered: string[]
  required?: string | string[]
  owned: string[]
  roles: string[]
}

/**
 * 路由导航决策（纯函数）
 *
 * 优先级：
 *   1. 命中白名单 -> pass
 *   2. 无 token -> 重定向到 /login?redirect=to
 *   3. 路径未在已注册路由 -> /404
 *   4. 需要权限码且校验失败 -> /403
 *   5. 否则 pass
 */
export function decideNavigation(ctx: DecideContext): NavDecision {
  if (ctx.whitelist.includes(ctx.to)) return { type: 'pass' }
  if (!ctx.hasToken) return { type: 'redirect', path: '/login', query: { redirect: ctx.to } }
  if (!ctx.registered.includes(ctx.to)) return { type: 'redirect', path: '/404' }
  if (ctx.required && !hasPermissionPure(ctx.required, { roles: ctx.roles, owned: ctx.owned })) {
    return { type: 'redirect', path: '/403' }
  }
  return { type: 'pass' }
}
