import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { staticRoutes, WHITELIST } from './routes.static'
import { decideNavigation } from './guard'
import { cancelByTag } from '@/utils/http'

const router = createRouter({
  history: createWebHistory((import.meta.env.BASE_URL as string) || '/'),
  routes: staticRoutes,
})

const STATIC_NAMES = new Set(
  staticRoutes
    .map((r) => r.name)
    .filter((n): n is string => typeof n === 'string'),
)

router.beforeEach(async (to, _from) => {
  // 路由切换：取消所有挂在 'route' tag 上的进行中请求
  cancelByTag('route')

  const { useUserStore } = await import('@/store/modules/user')
  const { usePermissionStore } = await import('@/store/modules/permission')
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (WHITELIST.includes(to.path)) return true

  if (!userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (!permissionStore.inited) {
    try {
      const menus = await userStore.fetchUserMenus()
      await permissionStore.generateRoutes(menus.menus, menus.permissions, menus.roles)
      // 返回 to.fullPath 会触发 router 重新解析；动态路由已注册，下一轮守卫直接 pass
      return to.fullPath
    } catch {
      userStore.clearAuth()
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }

  const matched = router.resolve(to.path)
  // 命中 catch-all 兜底（NotFoundFallback）不算「已注册」
  const isRegistered =
    matched.matched.length > 0 &&
    !matched.matched.some((r) => r.name === 'NotFoundFallback')
  const required = (to.meta?.permission as string | string[] | undefined) ?? undefined

  const decision = decideNavigation({
    to: to.path,
    hasToken: Boolean(userStore.token),
    whitelist: WHITELIST,
    registered: isRegistered ? [to.path] : [],
    required,
    owned: userStore.permissions,
    roles: userStore.roles,
  })

  if (decision.type === 'pass') return true
  return { path: decision.path, query: decision.query }
})

router.afterEach((to) => {
  const title = to.meta?.title ? `${to.meta.title} - layui-vue Admin` : 'layui-vue Admin'
  document.title = title
})

/** 重置动态路由（保留 staticRoutes） */
export function resetRouter(): void {
  for (const route of router.getRoutes()) {
    if (route.name && !STATIC_NAMES.has(String(route.name))) {
      router.removeRoute(route.name)
    }
  }
}

export default router

/** 重新导出 RouteRecordRaw 方便外部 typing */
export type { RouteRecordRaw }
