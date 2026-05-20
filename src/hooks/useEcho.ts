/**
 * useEcho —— ID 回显聚合查询
 *
 * 场景：表格列里展示 userId 对应的 nickname，避免 N+1。
 * 用法：
 *   const echo = useEcho<User>(loader, 'id')
 *   await echo.fetch([1, 2, 3])
 *   echo.label(1) // -> 'admin'
 */
import { ref } from 'vue'

export interface UseEchoOptions<T> {
  /** 自定义展示字段提取（默认取 'name' 或 'nickname'） */
  display?: (row: T) => string
}

export interface UseEchoReturn<T> {
  cache: ReturnType<typeof ref<Record<string, T>>>
  fetch(ids: Array<string | number>): Promise<void>
  label(id: string | number | undefined | null): string
  raw(id: string | number | undefined | null): T | undefined
}

function defaultDisplay<T>(row: T): string {
  const r = row as unknown as Record<string, unknown>
  if (typeof r.nickname === 'string') return r.nickname
  if (typeof r.name === 'string') return r.name
  return ''
}

export function useEcho<T extends Record<string, unknown>>(
  loader: (ids: Array<string | number>) => Promise<T[]>,
  idField: keyof T,
  options: UseEchoOptions<T> = {},
): UseEchoReturn<T> {
  const cache = ref<Record<string, T>>({}) as ReturnType<typeof ref<Record<string, T>>>
  const display = options.display ?? defaultDisplay

  async function fetch(ids: Array<string | number>): Promise<void> {
    if (!ids.length) return
    const missing = ids.filter((id) => !(String(id) in (cache.value ?? {})))
    if (!missing.length) return
    const rows = await loader(missing)
    const next = { ...(cache.value ?? {}) } as Record<string, T>
    for (const row of rows) {
      const key = String(row[idField])
      next[key] = row
    }
    cache.value = next
  }

  function raw(id: string | number | undefined | null): T | undefined {
    if (id === undefined || id === null) return undefined
    return (cache.value ?? {})[String(id)]
  }

  function label(id: string | number | undefined | null): string {
    const r = raw(id)
    return r ? display(r) : ''
  }

  return { cache, fetch, label, raw }
}
