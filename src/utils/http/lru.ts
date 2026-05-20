/**
 * 简单 LRU 缓存（双向链表 + Map）
 *
 * 设计：head 为最旧条目，tail 为最近访问条目；超过容量时从 head 淘汰。
 */
interface LRUEntry<V> {
  value: V
  prev: string | null
  next: string | null
}

export class LRU<V> {
  private map = new Map<string, LRUEntry<V>>()
  private head: string | null = null
  private tail: string | null = null

  constructor(private capacity: number) {}

  size(): number {
    return this.map.size
  }

  get(key: string): V | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    this.touch(key)
    return entry.value
  }

  set(key: string, value: V): void {
    const exists = this.map.get(key)
    if (exists) {
      exists.value = value
      this.touch(key)
      return
    }
    const entry: LRUEntry<V> = { value, prev: this.tail, next: null }
    if (this.tail) {
      const tailEntry = this.map.get(this.tail)
      if (tailEntry) tailEntry.next = key
    }
    this.tail = key
    if (!this.head) this.head = key
    this.map.set(key, entry)
    if (this.map.size > this.capacity) this.evictHead()
  }

  delete(key: string): void {
    const entry = this.map.get(key)
    if (!entry) return
    if (entry.prev) {
      const prev = this.map.get(entry.prev)
      if (prev) prev.next = entry.next
    } else {
      this.head = entry.next
    }
    if (entry.next) {
      const next = this.map.get(entry.next)
      if (next) next.prev = entry.prev
    } else {
      this.tail = entry.prev
    }
    this.map.delete(key)
  }

  /** 按 LRU 顺序（head -> tail）输出条目 */
  *entries(): IterableIterator<[string, V]> {
    let cur = this.head
    while (cur) {
      const e = this.map.get(cur)
      if (!e) return
      yield [cur, e.value]
      cur = e.next
    }
  }

  clear(): void {
    this.map.clear()
    this.head = null
    this.tail = null
  }

  private touch(key: string): void {
    if (this.tail === key) return
    const entry = this.map.get(key)
    if (!entry) return
    // detach
    if (entry.prev) {
      const prev = this.map.get(entry.prev)
      if (prev) prev.next = entry.next
    } else {
      this.head = entry.next
    }
    if (entry.next) {
      const next = this.map.get(entry.next)
      if (next) next.prev = entry.prev
    }
    // append to tail
    entry.prev = this.tail
    entry.next = null
    if (this.tail) {
      const tailEntry = this.map.get(this.tail)
      if (tailEntry) tailEntry.next = key
    }
    this.tail = key
    if (!this.head) this.head = key
  }

  private evictHead(): void {
    if (!this.head) return
    const oldHead = this.head
    const oldEntry = this.map.get(oldHead)
    const next = oldEntry?.next ?? null
    this.map.delete(oldHead)
    this.head = next
    if (this.head) {
      const h = this.map.get(this.head)
      if (h) h.prev = null
    } else {
      this.tail = null
    }
  }
}
