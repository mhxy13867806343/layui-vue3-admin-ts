// Feature: layui-vue-admin-system, Property 12: GET cache idempotency
// For any same cache key with TTL > 0, consecutive GET calls return cached response;
// after TTL expires, cache is invalidated and a fresh request is made.
// cacheInvalidate(tags) clears only matching entries.
import fc from 'fast-check'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheGet, cacheSet, cacheInvalidate, __clearAll } from '@/utils/http/cache'

/**
 * **Validates: Requirements 19.5**
 *
 * Property 12: GET 缓存幂等性
 *
 * For any same cache.key with TTL > 0:
 * - Consecutive reads within TTL return the same cached body
 * - After TTL expires, cacheGet returns undefined
 * - cacheInvalidate(tags) clears only entries with matching tags
 */
describe('Property 12: HTTP Cache Interceptor', () => {
  beforeEach(() => {
    __clearAll()
    vi.useRealTimers()
  })

  it('cacheSet + cacheGet returns same body within TTL', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.jsonValue(),
        fc.integer({ min: 1, max: 60000 }),
        (key, body, ttl) => {
          __clearAll()
          cacheSet(key, body, ttl)
          const result = cacheGet(key)
          expect(result).toEqual(body)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('consecutive cacheGet calls return same reference within TTL', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.record({
          code: fc.constant(0),
          data: fc.jsonValue(),
          message: fc.string({ maxLength: 20 }),
        }),
        fc.integer({ min: 1000, max: 60000 }),
        fc.integer({ min: 2, max: 10 }),
        (key, body, ttl, readCount) => {
          __clearAll()
          cacheSet(key, body, ttl)

          const results: unknown[] = []
          for (let i = 0; i < readCount; i++) {
            results.push(cacheGet(key))
          }

          // All reads should return the same value
          for (const r of results) {
            expect(r).toEqual(body)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('cache is invalidated after TTL expires', () => {
    vi.useFakeTimers()

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.jsonValue(),
        fc.integer({ min: 1, max: 5000 }),
        (key, body, ttl) => {
          __clearAll()
          cacheSet(key, body, ttl)

          // Within TTL: should return body
          expect(cacheGet(key)).toEqual(body)

          // Advance time past TTL
          vi.advanceTimersByTime(ttl + 1)

          // After TTL: should return undefined
          expect(cacheGet(key)).toBeUndefined()
        },
      ),
      { numRuns: 100 },
    )

    vi.useRealTimers()
  })

  it('cacheSet with ttl <= 0 does not store anything', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.jsonValue(),
        fc.integer({ min: -10000, max: 0 }),
        (key, body, ttl) => {
          __clearAll()
          cacheSet(key, body, ttl)
          expect(cacheGet(key)).toBeUndefined()
        },
      ),
      { numRuns: 50 },
    )
  })

  it('cacheInvalidate() clears all entries', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            key: fc.string({ minLength: 1, maxLength: 30 }),
            body: fc.jsonValue(),
            ttl: fc.integer({ min: 1000, max: 60000 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (entries) => {
          __clearAll()
          for (const e of entries) {
            cacheSet(e.key, e.body, e.ttl)
          }

          // All entries should be accessible
          for (const e of entries) {
            expect(cacheGet(e.key)).toEqual(e.body)
          }

          // Invalidate all
          cacheInvalidate()

          // All entries should be gone
          for (const e of entries) {
            expect(cacheGet(e.key)).toBeUndefined()
          }
        },
      ),
      { numRuns: 50 },
    )
  })

  it('cacheInvalidate(tags) clears only entries with matching tags', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.jsonValue(),
        fc.jsonValue(),
        fc.integer({ min: 1000, max: 60000 }),
        (tagA, tagB, bodyA, bodyB, ttl) => {
          // Ensure tags are different
          fc.pre(tagA !== tagB)

          __clearAll()
          const keyA = 'entry-a'
          const keyB = 'entry-b'

          cacheSet(keyA, bodyA, ttl, [tagA])
          cacheSet(keyB, bodyB, ttl, [tagB])

          // Both accessible
          expect(cacheGet(keyA)).toEqual(bodyA)
          expect(cacheGet(keyB)).toEqual(bodyB)

          // Invalidate only tagA
          cacheInvalidate([tagA])

          // Entry A should be gone, entry B should remain
          expect(cacheGet(keyA)).toBeUndefined()
          expect(cacheGet(keyB)).toEqual(bodyB)
        },
      ),
      { numRuns: 100 },
    )
  })
})
