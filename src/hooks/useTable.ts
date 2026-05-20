/**
 * useTable —— 分页表格通用 hook
 *
 * 输入：loader(params) -> Promise<PageResult<T>>
 * 输出：{ list, total, loading, page, pageSize, query, search, reset, refresh, remove }
 *
 * 特性：
 *   - page / pageSize 变化自动 reload；
 *   - search() 重置 page=1 后 reload；
 *   - reset() 清空 query 并回到初始 query；
 *   - refresh() 复用当前 page/query；
 *   - remove(predicate) 本地删除一行（用于「删除接口成功 → 立即从列表移除」无需重新拉数据）。
 */
import { ref, watch, type Ref } from 'vue'
import type { PageResult } from '@/types/api'

export interface UseTableOptions<Q extends Record<string, unknown>> {
  initialQuery?: Q
  initialPage?: number
  initialPageSize?: number
  immediate?: boolean
}

export interface UseTableReturn<T, Q extends Record<string, unknown>> {
  list: Ref<T[]>
  total: Ref<number>
  loading: Ref<boolean>
  page: Ref<number>
  pageSize: Ref<number>
  query: Ref<Q>
  search(): Promise<void>
  reset(): Promise<void>
  refresh(): Promise<void>
  remove(predicate: (row: T) => boolean): void
}

export function useTable<T, Q extends Record<string, unknown> = Record<string, unknown>>(
  loader: (params: Q & { page: number; pageSize: number }) => Promise<PageResult<T>>,
  options: UseTableOptions<Q> = {},
): UseTableReturn<T, Q> {
  const initialQuery = (options.initialQuery ?? ({} as Q))
  const list = ref<T[]>([]) as Ref<T[]>
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const page = ref<number>(options.initialPage ?? 1)
  const pageSize = ref<number>(options.initialPageSize ?? 10)
  const query = ref<Q>({ ...initialQuery }) as Ref<Q>

  async function load(): Promise<void> {
    loading.value = true
    try {
      const result = await loader({
        ...(query.value as Q),
        page: page.value,
        pageSize: pageSize.value,
      })
      list.value = result.list
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function search(): Promise<void> {
    page.value = 1
    await load()
  }

  async function reset(): Promise<void> {
    query.value = { ...initialQuery } as Q
    page.value = 1
    await load()
  }

  async function refresh(): Promise<void> {
    await load()
  }

  function remove(predicate: (row: T) => boolean): void {
    list.value = list.value.filter((r) => !predicate(r))
    total.value = Math.max(0, total.value - 1)
  }

  // page / pageSize 变化自动 reload；query 由 search/reset 显式触发，避免输入即查询
  watch([page, pageSize], () => {
    void load()
  })

  if (options.immediate !== false) {
    void load()
  }

  return { list, total, loading, page, pageSize, query, search, reset, refresh, remove }
}
