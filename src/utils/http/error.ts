/**
 * HTTP 错误工厂与提示工具
 *
 * 注：layer 仅在实际需要弹错时通过动态 import 加载，
 * 避免在 SSR / Node 端测试中拽入 layui-vue 的 css 副作用。
 */
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'
import type { HttpError, RequestConfig } from './types'

export function makeHttpError<T>(opts: {
  message: string
  status?: number
  body?: ApiResponse<T>
  isCanceled?: boolean
}): HttpError<T> {
  const e = new Error(opts.message) as HttpError<T>
  e.isHttpError = true
  e.status = opts.status
  e.body = opts.body
  e.isCanceled = opts.isCanceled
  return e
}

export function notify(cfg: RequestConfig, message: string): void {
  if (cfg.silent === true && cfg.showError !== true) return
  // lazy import 避开测试 / SSR 期的副作用
  void import('@layui/layui-vue').then(({ layer }) => {
    layer.msg(message, { icon: 2 })
  })
}

export function buildAxiosErrorMessage(err: AxiosError): string {
  if ((err as { code?: string }).code === 'ECONNABORTED') return '请求超时，请稍后重试'
  if (!err.response) return '网络异常，请检查网络连接'
  const status = err.response.status
  if (status >= 500) return '服务异常，请稍后重试'
  const body = err.response.data as ApiResponse<unknown> | undefined
  return body?.message || '请求失败'
}
