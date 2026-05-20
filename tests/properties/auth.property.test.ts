// Feature: layui-vue-admin-system, Property 1: Logout always clears auth state
// Feature: layui-vue-admin-system, Property 2: Any endpoint receiving HTTP 401 triggers unified logout
import fc from 'fast-check'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { storage } from '@/utils/storage'
import { useUserStore } from '@/store/modules/user'

/**
 * **Validates: Requirements 2.7**
 *
 * Property 1: Logout 永远清空认证态
 *
 * For any 已登录的会话状态（任意非空 token、任意 user 对象），
 * 调用 clearAuth() 之后：
 * - useUserStore.token === ''
 * - useUserStore.userInfo === null
 * - storage.get('token') === null
 * - storage.get('user_info') === null
 */
describe('Property 1: Logout always clears auth state', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('clearAuth resets all auth fields regardless of initial state', () => {
    fc.assert(
      fc.property(
        // arbitrary non-empty token
        fc.string({ minLength: 1, maxLength: 64 }),
        // arbitrary refreshToken
        fc.string({ minLength: 0, maxLength: 64 }),
        // arbitrary user object
        fc.record({
          id: fc.integer({ min: 1, max: 99999 }),
          username: fc.string({ minLength: 1, maxLength: 20 }),
          nickname: fc.string({ minLength: 1, maxLength: 20 }),
          status: fc.constantFrom(0 as const, 1 as const),
          roleCodes: fc.array(fc.string({ minLength: 1, maxLength: 16 }), { maxLength: 5 }),
          createdAt: fc.string({ minLength: 1, maxLength: 30 }),
        }),
        // arbitrary roles
        fc.array(fc.string({ minLength: 1, maxLength: 16 }), { maxLength: 5 }),
        // arbitrary permissions
        fc.array(fc.string({ minLength: 1, maxLength: 32 }), { maxLength: 10 }),
        (token, refreshToken, user, roles, permissions) => {
          const store = useUserStore()

          // Set up arbitrary logged-in state
          store.token = token
          store.refreshToken = refreshToken
          store.userInfo = user as any
          store.roles = roles
          store.permissions = permissions
          storage.set('token', token)
          storage.set('refresh_token', refreshToken)
          storage.set('user_info', user)

          // Act: clear auth
          store.clearAuth()

          // Assert: all auth state is cleared
          expect(store.token).toBe('')
          expect(store.refreshToken).toBe('')
          expect(store.userInfo).toBeNull()
          expect(store.roles).toEqual([])
          expect(store.permissions).toEqual([])
          expect(storage.get('token')).toBeNull()
          expect(storage.get('refresh_token')).toBeNull()
          expect(storage.get('user_info')).toBeNull()
        },
      ),
      { numRuns: 100 },
    )
  })

  it('clearAuth is idempotent (calling twice has same result)', () => {
    const store = useUserStore()
    store.token = 'some-token'
    store.userInfo = { id: 1, username: 'test', nickname: 'Test', status: 1, roleCodes: [], createdAt: '' } as any
    storage.set('token', 'some-token')
    storage.set('user_info', { id: 1 })

    store.clearAuth()
    store.clearAuth()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(storage.get('token')).toBeNull()
    expect(storage.get('user_info')).toBeNull()
  })
})

/**
 * **Validates: Requirements 2.9, 3.5**
 *
 * Property 2: 任意端点收到 HTTP 401 触发统一登出
 *
 * For any 请求 URL 和方法，当 axios 实例收到 HTTP 401 响应时，
 * 响应拦截器执行后必须满足：
 * - useUserStore.token === ''
 * - 路由发生过一次 router.replace，目标 path === '/login'
 * - 调用方收到 Promise.reject
 */
describe('Property 2: HTTP 401 triggers unified logout', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    setActivePinia(createPinia())
    vi.resetModules()
  })

  it('401 response clears auth state and rejects promise', async () => {
    // We test the refresh.ts tryRefreshAndReplay failure path directly,
    // which is the code path that handles 401 when refresh is unavailable.
    const { useUserStore } = await import('@/store/modules/user')

    // Mock router.replace
    const replaceMock = vi.fn().mockResolvedValue(undefined)
    vi.doMock('@/router', () => ({
      default: { replace: replaceMock },
      resetRouter: vi.fn(),
    }))

    await fc.assert(
      fc.asyncProperty(
        // arbitrary URL paths
        fc.string({ minLength: 1, maxLength: 50 }).map((s) => '/' + s.replace(/[^a-z0-9/]/gi, '')),
        // arbitrary HTTP methods
        fc.constantFrom('get', 'post', 'put', 'delete'),
        // arbitrary initial token
        fc.string({ minLength: 1, maxLength: 64 }),
        async (url, method, token) => {
          // Reset pinia for each iteration
          setActivePinia(createPinia())
          const store = useUserStore()

          // Set up logged-in state with no refresh token (so refresh will fail)
          store.token = token
          store.refreshToken = ''
          storage.set('token', token)

          // Import the refresh module fresh
          const { tryRefreshAndReplay, __reset } = await import('@/utils/http/refresh')
          __reset()

          // Simulate a 401 error
          const axiosError = {
            response: { status: 401, data: { code: 401, message: 'Unauthorized' } },
            isAxiosError: true,
          } as any

          const cfg = { method, url, _retried: false } as any

          // tryRefreshAndReplay should reject (no refresh token available)
          let rejected = false
          try {
            await tryRefreshAndReplay(cfg, axiosError, async () => {
              throw new Error('should not replay')
            })
          } catch {
            rejected = true
          }

          // Assert: promise was rejected
          expect(rejected).toBe(true)

          // Assert: auth state was cleared
          expect(store.token).toBe('')
          expect(storage.get('token')).toBeNull()
        },
      ),
      { numRuns: 30 },
    )
  })

  it('401 triggers router.replace to /login', async () => {
    const replaceMock = vi.fn().mockResolvedValue(undefined)
    vi.doMock('@/router', () => ({
      default: { replace: replaceMock },
      resetRouter: vi.fn(),
    }))

    const { useUserStore } = await import('@/store/modules/user')
    const store = useUserStore()

    store.token = 'test-token'
    store.refreshToken = ''
    storage.set('token', 'test-token')

    const { tryRefreshAndReplay, __reset } = await import('@/utils/http/refresh')
    __reset()

    const axiosError = {
      response: { status: 401, data: { code: 401, message: 'Unauthorized' } },
      isAxiosError: true,
    } as any

    const cfg = { method: 'get', url: '/api/user/page', _retried: false } as any

    try {
      await tryRefreshAndReplay(cfg, axiosError, async () => {
        throw new Error('should not replay')
      })
    } catch {
      // expected
    }

    // Assert: router.replace was called with /login
    expect(replaceMock).toHaveBeenCalledWith('/login')
  })
})
