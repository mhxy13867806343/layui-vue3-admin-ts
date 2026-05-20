/**
 * HTTP 高层包装入口
 *
 * 装配顺序（请求方向）：
 *   1. cancel：注入 AbortController；
 *   2. cache：命中即短路返回；
 *   3. dedupe：进行中请求复用；
 *   4. progress.start（非 silent）；
 *   5. retry → axios（含 auth 拦截器）；
 *   6. refresh：401 时透明刷新并重放；
 *   7. unwrap & cache write；
 *   8. progress.done + cancel.unregister。
 */
import './interceptors'

import type { AxiosError, AxiosResponse } from 'axios'
import { instance } from './core'
import { performWithRetry } from './retry'
import { tryRefreshAndReplay } from './refresh'
import { buildAxiosErrorMessage, makeHttpError, notify } from './error'
import { buildRequestKey } from './key'
import { cacheGet, cacheSet, cacheInvalidate } from './cache'
import { dedupeGet, dedupeSet } from './dedupe'
import { registerAbort, unregisterAbort, cancelByTag, cancelAll } from './cancel'
import { progressStart, progressDone } from './progress'
import type { RequestConfig } from './types'
import type { ApiResponse } from '@/types/api'

function isCanceledError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const e = err as { code?: string; name?: string; message?: string }
  return e.code === 'ERR_CANCELED' || e.name === 'CanceledError' || e.message === 'canceled'
}

function defaultDedupe(method: string): boolean {
  const m = method.toLowerCase()
  return m === 'get' || m === 'head'
}

function pickTag(cfg: RequestConfig): string {
  if (Array.isArray(cfg.tag)) return cfg.tag[0] ?? 'route'
  return cfg.tag ?? 'route'
}

async function rawRequest<T>(cfg: RequestConfig): Promise<ApiResponse<T>> {
  // 1. cancel：未提供 signal 时自动接管
  const tag = pickTag(cfg)
  let ac: AbortController | undefined
  if (!cfg.signal) {
    ac = new AbortController()
    cfg.signal = ac.signal
    registerAbort(tag, ac)
  }

  // 2. cache 命中
  const key = buildRequestKey(cfg)
  const cacheKey = cfg.cache?.key ?? key
  if (cfg.cache?.ttl && cfg.cache.ttl > 0) {
    const hit = cacheGet(cacheKey)
    if (hit !== undefined) {
      if (ac) unregisterAbort(tag, ac)
      return hit as ApiResponse<T>
    }
  }

  // 3. dedupe
  const dedupeOn = cfg.dedupe ?? defaultDedupe(cfg.method ?? 'get')
  if (dedupeOn) {
    const existing = dedupeGet(key) as Promise<ApiResponse<T>> | undefined
    if (existing) {
      if (ac) unregisterAbort(tag, ac)
      return existing
    }
  }

  if (cfg.silent !== true) progressStart()

  const exec = async (): Promise<ApiResponse<T>> => {
    try {
      let res: AxiosResponse<ApiResponse<T>>
      try {
        res = await performWithRetry<ApiResponse<T>>(cfg)
      } catch (e) {
        const err = e as AxiosError
        if (err.response?.status === 401 && !cfg._retried) {
          return await tryRefreshAndReplay<ApiResponse<T>>(cfg, err, async (next) => {
            const r = await performWithRetry<ApiResponse<T>>(next)
            return r.data
          })
        }
        throw err
      }

      const body = res.data
      if (body && typeof body.code === 'number') {
        if (body.code !== 0) {
          notify(cfg, body.message || '请求失败')
          throw makeHttpError({
            message: body.message || '请求失败',
            status: res.status,
            body,
          })
        }
        if (cfg.cache?.ttl && cfg.cache.ttl > 0) {
          cacheSet(cacheKey, body, cfg.cache.ttl, cfg.cache.tags ?? [])
        }
        return body
      }
      // 不带响应壳的接口（如下载二进制）：包一层
      return {
        code: 0,
        data: body as unknown as T,
        message: 'ok',
      } as ApiResponse<T>
    } catch (e) {
      if (isCanceledError(e)) {
        throw makeHttpError({ message: '请求已取消', isCanceled: true })
      }
      // axios 错误：归一化提示
      const err = e as AxiosError & { isHttpError?: boolean }
      if (err.isHttpError) throw err
      if (err.isAxiosError || err.response) {
        const message = buildAxiosErrorMessage(err)
        notify(cfg, message)
        throw makeHttpError({
          message,
          status: err.response?.status,
          body: err.response?.data as ApiResponse<unknown> | undefined,
        })
      }
      throw e
    } finally {
      if (cfg.silent !== true) progressDone()
      if (ac) unregisterAbort(tag, ac)
    }
  }

  const promise = exec()
  if (dedupeOn) dedupeSet(key, promise as Promise<unknown>)
  return promise
}

export interface HttpFacade {
  get<T>(url: string, cfg?: RequestConfig): Promise<T>
  post<T>(url: string, data?: unknown, cfg?: RequestConfig): Promise<T>
  put<T>(url: string, data?: unknown, cfg?: RequestConfig): Promise<T>
  delete<T>(url: string, cfg?: RequestConfig): Promise<T>
  raw<T>(cfg: RequestConfig): Promise<ApiResponse<T>>
}

export const http: HttpFacade = {
  get<T>(url: string, cfg?: RequestConfig): Promise<T> {
    return rawRequest<T>({ ...(cfg ?? {}), method: 'get', url }).then((r) => r.data)
  },
  post<T>(url: string, data?: unknown, cfg?: RequestConfig): Promise<T> {
    return rawRequest<T>({ ...(cfg ?? {}), method: 'post', url, data }).then((r) => r.data)
  },
  put<T>(url: string, data?: unknown, cfg?: RequestConfig): Promise<T> {
    return rawRequest<T>({ ...(cfg ?? {}), method: 'put', url, data }).then((r) => r.data)
  },
  delete<T>(url: string, cfg?: RequestConfig): Promise<T> {
    return rawRequest<T>({ ...(cfg ?? {}), method: 'delete', url }).then((r) => r.data)
  },
  raw<T>(cfg: RequestConfig): Promise<ApiResponse<T>> {
    return rawRequest<T>(cfg)
  },
}

export { instance, cancelByTag, cancelAll, cacheInvalidate }
export type { RequestConfig, RetryOptions, CacheOptions, HttpError } from './types'
export default http
