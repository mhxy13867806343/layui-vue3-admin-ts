/**
 * 进行中请求复用
 *
 * 同一 key 的请求在结束前共享一个 Promise；settle 后立即清理 key。
 */
const inflight = new Map<string, Promise<unknown>>()

export function dedupeGet(key: string): Promise<unknown> | undefined {
  return inflight.get(key)
}

export function dedupeSet(key: string, p: Promise<unknown>): void {
  inflight.set(key, p)
  void p.finally(() => {
    if (inflight.get(key) === p) inflight.delete(key)
  })
}

/** 测试辅助 */
export function __clearAll(): void {
  inflight.clear()
}
