import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import type { Menu } from '@/types/domain'
import { hasPermissionPure } from '@/utils/permission'

interface PermissionState {
  menus: Menu[]
  asyncRoutes: RouteRecordRaw[]
  inited: boolean
}

/** 递归过滤异步路由：保留无 permission 字段的，或权限通过的 */
export function filterAsyncRoutes(
  routes: RouteRecordRaw[],
  ctx: { roles: string[]; owned: string[] },
): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = []
  for (const r of routes) {
    const required = (r.meta as Record<string, unknown> | undefined)?.permission as
      | string
      | string[]
      | undefined
    if (!required || hasPermissionPure(required, ctx)) {
      const copy: RouteRecordRaw = { ...r }
      if (Array.isArray(r.children)) {
        copy.children = filterAsyncRoutes(r.children, ctx)
      }
      result.push(copy)
    }
  }
  return result
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    menus: [],
    asyncRoutes: [],
    inited: false,
  }),
  actions: {
    async generateRoutes(menus: Menu[], permissions: string[], roles: string[]) {
      const { asyncRoutes } = await import('@/router/routes.async')
      const router = (await import('@/router')).default
      const filtered = filterAsyncRoutes(asyncRoutes, { roles, owned: permissions })
      this.asyncRoutes = filtered
      this.menus = menus
      this.inited = true
      filtered.forEach((r) => router.addRoute(r))
      return filtered
    },
    reset() {
      this.menus = []
      this.asyncRoutes = []
      this.inited = false
    },
  },
})
