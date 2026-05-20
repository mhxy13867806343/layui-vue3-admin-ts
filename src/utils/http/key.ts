/**
 * 请求 key 计算
 *
 * 用于缓存命中与去重；保证不同字段顺序不会得到不同的 key。
 */

/** 稳定字符串化：对象按键名排序后再 JSON.stringify */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const obj = v as Record<string, unknown>
      const sorted: Record<string, unknown> = {}
      for (const k of Object.keys(obj).sort()) sorted[k] = obj[k]
      return sorted
    }
    return v
  })
}

export function buildRequestKey(cfg: {
  method?: string
  url?: string
  params?: unknown
  data?: unknown
}): string {
  return stableStringify({
    method: (cfg.method ?? 'get').toLowerCase(),
    url: cfg.url ?? '',
    params: cfg.params ?? null,
    data: cfg.data ?? null,
  })
}
