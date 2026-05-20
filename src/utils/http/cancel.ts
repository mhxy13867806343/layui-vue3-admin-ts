/**
 * 请求取消（按 tag 分组）
 *
 * - registerAbort/unregisterAbort：内部维护 tag -> Set<AbortController>
 * - cancelByTag(tag)：终止该 tag 所有进行中请求并清空分组
 * - cancelAll：终止全部分组
 *
 * 路由切换自动取消：在 router/index.ts beforeEach 顶部调用 cancelByTag('route')。
 */
const groups = new Map<string, Set<AbortController>>()

export function registerAbort(tag: string, ac: AbortController): void {
  let set = groups.get(tag)
  if (!set) {
    set = new Set()
    groups.set(tag, set)
  }
  set.add(ac)
}

export function unregisterAbort(tag: string, ac: AbortController): void {
  const set = groups.get(tag)
  if (!set) return
  set.delete(ac)
  if (set.size === 0) groups.delete(tag)
}

export function cancelByTag(tag: string): void {
  const set = groups.get(tag)
  if (!set) return
  for (const ac of set) {
    try {
      ac.abort()
    } catch {
      /* noop */
    }
  }
  groups.delete(tag)
}

export function cancelAll(): void {
  for (const set of groups.values()) {
    for (const ac of set) {
      try {
        ac.abort()
      } catch {
        /* noop */
      }
    }
  }
  groups.clear()
}

/** 测试辅助 */
export function __snapshot(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [tag, set] of groups) out[tag] = set.size
  return out
}
