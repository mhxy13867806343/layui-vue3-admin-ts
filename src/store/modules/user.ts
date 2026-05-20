import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { cancelAll, cacheInvalidate } from '@/utils/http'
import type { User, LoginRequest } from '@/types/domain'

export interface UserState {
  token: string
  refreshToken: string
  userInfo: User | null
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: storage.get<string>('token') ?? '',
    refreshToken: storage.get<string>('refresh_token') ?? '',
    userInfo: storage.get<User>('user_info') ?? null,
    roles: [],
    permissions: [],
  }),
  actions: {
    /** 同步写回 token / refreshToken（refresh 流程会调用此 action） */
    setTokens(nextToken: string, nextRefreshToken: string) {
      this.token = nextToken
      this.refreshToken = nextRefreshToken
      storage.set('token', nextToken)
      storage.set('refresh_token', nextRefreshToken)
    },
    async login(payload: LoginRequest) {
      const { login: loginApi } = await import('@/api/auth')
      const data = await loginApi(payload)
      this.token = data.token
      this.refreshToken = data.refreshToken
      this.userInfo = data.user
      storage.set('token', data.token)
      storage.set('refresh_token', data.refreshToken)
      storage.set('user_info', data.user)
      // 锁屏校验暂存：仅会话级保存原始密码（mock 用途）
      try {
        sessionStorage.setItem('lva_lock_pw', payload.password)
      } catch {
        /* 隐私模式可能写入失败，忽略 */
      }
      return data
    },
    async fetchUserInfo() {
      const { getUserInfo } = await import('@/api/auth')
      const u = await getUserInfo()
      this.userInfo = u
      storage.set('user_info', u)
      return u
    },
    async fetchUserMenus() {
      const { getUserMenus } = await import('@/api/auth')
      const data = await getUserMenus()
      this.roles = data.roles
      this.permissions = data.permissions
      return data
    },
    clearAuth() {
      this.token = ''
      this.refreshToken = ''
      this.userInfo = null
      this.roles = []
      this.permissions = []
      storage.remove('token')
      storage.remove('refresh_token')
      storage.remove('user_info')
      try {
        sessionStorage.removeItem('lva_lock_pw')
      } catch {
        /* noop */
      }
    },
    async logout() {
      // 登出前：取消所有进行中的请求 + 清空 GET 缓存
      cancelAll()
      cacheInvalidate()

      try {
        const { logout: logoutApi } = await import('@/api/auth')
        await logoutApi().catch(() => undefined)
      } finally {
        const { resetRouter } = await import('@/router')
        resetRouter()
        const { usePermissionStore } = await import('@/store/modules/permission')
        usePermissionStore().reset()
        this.clearAuth()
        const router = (await import('@/router')).default
        await router.replace('/login')
      }
    },
  },
})
