/**
 * 重试与指数退避
 *
 * - 默认条件：网络异常 / 5xx / ECONNABORTED
 * - GET / HEAD 默认 retries=2，其它方法默认 retries=0
 * - 退避：min(BASE * 2^n + jitter, MAX)
 * - 已被取消（signal.aborted）立即终止，不再重试
 */
import type { AxiosError, AxiosResponse } from 'axios'
import { BASE_RETRY_DELAY, MAX_RETRY_DELAY, instance } from './core'
import type { RequestConfig, RetryOptions } from './types'

function defaultRetries(method: string): number {
  const m = method.toLowerCase()
  return m === 'get' || m === 'head' ? 2 : 0
}

function defaultRetryOn(err: AxiosError): boolean {
  if (!err.response) return true
  if (err.code === 'ECONNABORTED') return true
  return err.response.status >= 500
}

export function computeDelay(attempt: number, override?: RetryOptions['delay']): number {
  if (typeof override === 'function') return Math.max(0, override(attempt))
  if (typeof override === 'number') return Math.max(0, override)
  const exp = BASE_RETRY_DELAY * Math.pow(2, attempt)
  const jitter = Math.floor(Math.random() * 100) - 50
  return Math.min(Math.max(0, exp + jitter), MAX_RETRY_DELAY)
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function performWithRetry<T = unknown>(
  cfg: RequestConfig,
): Promise<AxiosResponse<T>> {
  const opts: RetryOptions =
    typeof cfg.retry === 'number' ? { retries: cfg.retry } : (cfg.retry ?? {})
  const retries = opts.retries ?? defaultRetries(cfg.method ?? 'get')
  const retryOn = opts.retryOn ?? defaultRetryOn

  let lastErr: AxiosError | undefined
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return (await instance.request<T>(cfg)) as AxiosResponse<T>
    } catch (e) {
      const err = e as AxiosError
      lastErr = err
      const aborted = (cfg.signal as AbortSignal | undefined)?.aborted === true
      if (aborted) throw err
      if (attempt >= retries || !retryOn(err)) throw err
      await sleep(computeDelay(attempt, opts.delay))
    }
  }
  throw lastErr
}
