import type { RouteRecordRaw } from 'vue-router'

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权限' },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' },
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: { title: '服务异常' },
  },
  {
    path: '/redirect/:path(.*)',
    name: 'Redirect',
    component: () => import('@/views/redirect/index.vue'),
    meta: { title: '重定向' },
  },
  {
    // 兜底：渲染 404 组件，但不 redirect。这样 beforeEach 能看到
    // 用户原始的 to.path（例如 `/`），从而正确决策跳转 /login 还是 /404。
    path: '/:pathMatch(.*)*',
    name: 'NotFoundFallback',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' },
  },
]

/** 白名单：未登录也允许访问 */
export const WHITELIST: string[] = ['/login', '/register', '/403', '/404', '/500']
