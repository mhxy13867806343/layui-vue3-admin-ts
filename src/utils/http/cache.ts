/**
 * GET 响应缓存（LRU + TTL）
 *
 * - cacheGet: 命中且未过期则返回；过期自动删除
 * - cacheSet: ttl > 0 时写入
 * - cacheInvalidate: 不传 tags 清空全部；否则按 tag 命中删除
 */
import { LRU } from './lru'

interface CacheEntry {
  body: unknown
  expireAt: number
  tags: string[]
}

const lru = new LRU<CacheEntry>(100)

export function cacheGet(key: string): unknown | undefined {
  const entry = lru.get(key)
  if (!entry) return undefined
  if (Date.now() >= entry.expireAt) {
    lru.delete(key)
    return undefined
  }
  return entry.body
}

export function cacheSet(key: string, body: unknown, ttl: number, tags: string[] = []): void {
  if (ttl <= 0) return
  lru.set(key, { body, expireAt: Date.now() + ttl, tags })
}

export function cacheInvalidate(tags?: string[]): void {
  if (!tags || tags.length === 0) {
    lru.clear()
    return
  }
  const toDelete: string[] = []
  for (const [k, entry] of lru.entries()) {
    if (entry.tags.some((t) => tags.includes(t))) toDelete.push(k)
  }
  toDelete.forEach((k) => lru.delete(k))
}

/** 测试辅助：清空全部缓存 */
export function __clearAll(): void {
  lru.clear()
}
