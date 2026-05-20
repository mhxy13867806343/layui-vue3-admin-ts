/**
 * HTTP 类型定义
 *
 * - RequestConfig：扩展 axios，增加 silent / showError / returnRaw / retry / dedupe / cache / abortKey / tag
 * - HttpError：归一化错误对象，业务侧 catch 后可统一处理
 */
import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'

/** 重试选项；retries 为 0 表示不重试 */
export interface RetryOptions {
  retries?: number
  delay?: number | ((attempt: number) => number)
  retryOn?: (err: AxiosError) => boolean
}

/** 缓存选项；ttl 单位毫秒；tags 用于按标签批量失效 */
export interface CacheOptions {
  ttl: number
  key?: string
  tags?: string[]
}

/** 业务可用的 HTTP 请求配置 */
export interface RequestConfig<TBody = unknown> extends AxiosRequestConfig<TBody> {
  /** silent=true 时不弹错误提示，且不计入 nprogress */
  silent?: boolean
  /** 强制弹错误（默认随 silent 反向） */
  showError?: boolean
  /** 直接返回 ApiResponse 壳而不是 unwrap data */
  returnRaw?: boolean
  /** 重试配置：number 视为 retries 计数 */
  retry?: number | RetryOptions
  /** 进行中请求复用；GET/HEAD 默认开启 */
  dedupe?: boolean
  /** 缓存配置；默认不缓存 */
  cache?: CacheOptions
  /** AbortController key（保留字段，未来按 key 取消单一请求） */
  abortKey?: string
  /** 取消标签；默认 'route'（路由切换自动取消） */
  tag?: string | string[]
  /** 内部：refresh 重放标志，禁止业务侧使用 */
  _retried?: boolean
}

/** 业务侧可识别的归一化错误 */
export interface HttpError<T = unknown> extends Error {
  status?: number
  body?: ApiResponse<T>
  isHttpError: true
  isCanceled?: boolean
}
