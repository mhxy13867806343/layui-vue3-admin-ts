/**
 * Token Refresh 单飞流程
 *
 * - 同时多个 401 共享同一 refreshPromise
 * - refresh 成功：写回 token + refreshToken + storage，重放原请求
 * - refresh 失败 / 无 refreshToken：清认证态 + 跳 /login
 */
import type { AxiosError, AxiosResponse } from 'axios'
import { instance } from './core'
import type { RequestConfig } from './types'

let refreshPromise: Promise<string> | null = null

interface RefreshBody {
  code: number
  data: { token: string; refreshToken: string }
  message: string
}

async function doRefresh(): Promise<string> {
  const { useUserStore } = await import('@/store/modules/user')
  const userStore = useUserStore()
  const refreshToken = userStore.refreshToken
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN')

  const res: AxiosResponse<RefreshBody> = await instance.request({
    method: 'post',
    url: '/auth/refresh',
    data: { refreshToken },
    timeout: 10000,
  })
  const body = res.data
  if (!body || body.code !== 0 || !body.data?.token) throw new Error('REFRESH_FAILED')

  userStore.token = body.data.token
  userStore.refreshToken = body.data.refreshToken
  const { storage } = await import('@/utils/storage')
  storage.set('token', body.data.token)
  storage.set('refresh_token', body.data.refreshToken)
  return body.data.token
}

export async function tryRefreshAndReplay<T>(
  cfg: RequestConfig,
  err: AxiosError,
  replay: (cfg: RequestConfig) => Promise<T>,
): Promise<T> {
  if (cfg._retried || err.response?.status !== 401) throw err
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  try {
    const newToken = await refreshPromise
    const next: RequestConfig = {
      ...cfg,
      _retried: true,
      headers: {
        ...(cfg.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      } as Record<string, string>,
    }
    return await replay(next)
  } catch {
    const { useUserStore } = await import('@/store/modules/user')
    useUserStore().clearAuth()
    const router = (await import('@/router')).default
    void router.replace('/login')
    throw err
  }
}

/** 测试辅助 */
export function __reset(): void {
  refreshPromise = null
}
