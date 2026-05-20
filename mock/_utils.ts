/**
 * Mock 服务通用工具
 *
 * 与真实接口共享一套响应壳：{ code, data, message }
 * 与真实接口共享分页结构：{ list, total, page, pageSize }
 *
 * 设计要点：
 * 1. `requireToken` 仅检查 Authorization 头是否以 `Bearer mock-token-` 起始，
 *    不解析具体用户，鉴权动作在 handler 内自行 `decodeToken` 取 userId。
 * 2. `guard(handler)` 在 token 非法时不会调用 handler，直接返回 401 响应壳。
 * 3. `paginate` 严格执行 page/pageSize 归一化为 ≥1，保证属性「分页拼接 ≡ 原数组」。
 *
 * 注：mock 不应耦合 src/utils 与 src/store，仅允许引用 `@/types/*` 的纯 d.ts。
 */
import type { MockMethod } from 'vite-plugin-mock'

// ===== Response Shell =====

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export const ok = <T>(data: T, message = 'ok'): ApiResponse<T> => ({
  code: 0,
  data,
  message,
})

export const fail = (message: string, code = 1): ApiResponse<null> => ({
  code,
  data: null,
  message,
})

export const unauthorized = (): ApiResponse<null> => ({
  code: 401,
  data: null,
  message: '未登录或登录已过期',
})

// ===== Pagination =====

export interface PageQuery {
  page?: number
  pageSize?: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const paginate = <T>(rows: T[], q: PageQuery): PageResult<T> => {
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.max(1, Number(q.pageSize) || 10)
  const start = (page - 1) * pageSize
  return {
    list: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  }
}

// ===== Request Parsing =====

/** 解析 URL 上的 query string */
export const parseQuery = (url: string): Record<string, string> => {
  const i = url.indexOf('?')
  if (i < 0) return {}
  return Object.fromEntries(new URLSearchParams(url.slice(i + 1)))
}

/** 读取请求体；未提供时返回空对象（保持解构调用的稳健性） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseBody = <T = any>(req: any): T => (req?.body ?? {}) as T

// ===== Auth Guard =====

/** 检查 Authorization / authorization 是否以 `Bearer mock-token-` 起始 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requireToken = (req: any): boolean => {
  const auth = req?.headers?.authorization || req?.headers?.Authorization
  if (!auth) return false
  const token = String(auth).replace(/^Bearer\s+/i, '')
  return token.startsWith('mock-token-')
}

/**
 * 鉴权门卫：未带合法 token 时返回 401，并不调用 handler。
 * Property 8 强约束：requireToken 为 false 时 handler 必须未被调用。
 */
export const guard =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (handler: (req: any) => any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req: any) => {
      if (!requireToken(req)) return unauthorized()
      return handler(req)
    }

/**
 * 从请求中提取 Bearer Token 字符串（不含 `Bearer ` 前缀）；
 * 未携带返回空串。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractToken = (req: any): string => {
  const auth = req?.headers?.authorization || req?.headers?.Authorization
  if (!auth) return ''
  return String(auth).replace(/^Bearer\s+/i, '')
}

/**
 * 从 `mock-token-<userId>-<ts>` 形式中提取 userId（number）。
 * 解析失败返回 null。
 */
export const decodeToken = (token: string): number | null => {
  if (!token) return null
  const m = /^mock-token-(\d+)-(\d+)$/.exec(token)
  if (!m) return null
  const userId = Number(m[1])
  return Number.isFinite(userId) ? userId : null
}

// ===== Type Re-exports =====

export type Method = 'get' | 'post' | 'put' | 'delete'

export type { MockMethod }

/** mock 内部对请求对象的最小结构约束（仅用于内部 handler 类型注解） */
export interface MockRequest {
  url: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: Record<string, any>
}

/** 取当前时间戳格式化为 'YYYY-MM-DD HH:mm:ss' */
export const formatNow = (): string => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}
