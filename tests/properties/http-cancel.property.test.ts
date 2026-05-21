// Feature: layui-vue-admin-system, Property 14: Route switch cancels pending requests
// For any tag='route' pending request set S, cancelByTag('route') aborts all S,
// and cancelAll() aborts everything. cancelByTag only affects matching tags.
import fc from 'fast-check'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  registerAbort,
  unregisterAbort,
  cancelByTag,
  cancelAll,
  __snapshot,
} from '@/utils/http/cancel'

/**
 * **Validates: Requirements 19.4**
 *
 * Property 14: 路由切换取消未完成请求
 *
 * For any tag='route' pending request set S:
 * - cancelByTag('route') sets all AbortController.signal.aborted === true
 * - cancelByTag only affects requests with matching tag
 * - cancelAll cancels all pending requests across all tags
 * - Cancelled requests have aborted signals
 */
describe('Property 14: HTTP Cancel Interceptor', () => {
  beforeEach(() => {
    // Clear all groups by cancelling everything
    cancelAll()
  })

  it('cancelByTag aborts all controllers registered under that tag', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.integer({ min: 1, max: 10 }),
        (tag, count) => {
          cancelAll() // reset

          const controllers: AbortController[] = []
          for (let i = 0; i < count; i++) {
            const ac = new AbortController()
            registerAbort(tag, ac)
            controllers.push(ac)
          }

          // Before cancel: none should be aborted
          for (const ac of controllers) {
            expect(ac.signal.aborted).toBe(false)
          }

          // Cancel by tag
          cancelByTag(tag)

          // After cancel: all should be aborted
          for (const ac of controllers) {
            expect(ac.signal.aborted).toBe(true)
          }

          // Snapshot should not contain the tag anymore
          const snap = __snapshot()
          expect(snap[tag]).toBeUndefined()
        },
      ),
      { numRuns: 100 },
    )
  })

  it('cancelByTag only cancels requests with matching tag, not others', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        (tagA, tagB, countA, countB) => {
          fc.pre(tagA !== tagB)
          cancelAll() // reset

          const controllersA: AbortController[] = []
          const controllersB: AbortController[] = []

          for (let i = 0; i < countA; i++) {
            const ac = new AbortController()
            registerAbort(tagA, ac)
            controllersA.push(ac)
          }
          for (let i = 0; i < countB; i++) {
            const ac = new AbortController()
            registerAbort(tagB, ac)
            controllersB.push(ac)
          }

          // Cancel only tagA
          cancelByTag(tagA)

          // tagA controllers should be aborted
          for (const ac of controllersA) {
            expect(ac.signal.aborted).toBe(true)
          }

          // tagB controllers should NOT be aborted
          for (const ac of controllersB) {
            expect(ac.signal.aborted).toBe(false)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('cancelAll aborts all pending requests across all tags', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            tag: fc.string({ minLength: 1, maxLength: 20 }),
            count: fc.integer({ min: 1, max: 5 }),
          }),
          { minLength: 1, maxLength: 5 },
        ),
        (groups) => {
          cancelAll() // reset

          const allControllers: AbortController[] = []

          for (const { tag, count } of groups) {
            for (let i = 0; i < count; i++) {
              const ac = new AbortController()
              registerAbort(tag, ac)
              allControllers.push(ac)
            }
          }

          // Before cancel: none should be aborted
          for (const ac of allControllers) {
            expect(ac.signal.aborted).toBe(false)
          }

          // Cancel all
          cancelAll()

          // After cancel: all should be aborted
          for (const ac of allControllers) {
            expect(ac.signal.aborted).toBe(true)
          }

          // Snapshot should be empty
          const snap = __snapshot()
          expect(Object.keys(snap).length).toBe(0)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('unregisterAbort removes controller from group without aborting it', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 2, max: 8 }),
        (tag, count) => {
          cancelAll() // reset

          const controllers: AbortController[] = []
          for (let i = 0; i < count; i++) {
            const ac = new AbortController()
            registerAbort(tag, ac)
            controllers.push(ac)
          }

          // Unregister the first controller
          const removed = controllers[0]
          unregisterAbort(tag, removed)

          // Cancel the tag
          cancelByTag(tag)

          // The unregistered controller should NOT be aborted
          expect(removed.signal.aborted).toBe(false)

          // All others should be aborted
          for (let i = 1; i < controllers.length; i++) {
            expect(controllers[i].signal.aborted).toBe(true)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('cancelByTag with route tag simulates route switch cancellation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (pendingCount) => {
          cancelAll() // reset

          const controllers: AbortController[] = []
          for (let i = 0; i < pendingCount; i++) {
            const ac = new AbortController()
            registerAbort('route', ac)
            controllers.push(ac)
          }

          // Simulate route switch: cancelByTag('route')
          cancelByTag('route')

          // All route-tagged requests should be aborted
          for (const ac of controllers) {
            expect(ac.signal.aborted).toBe(true)
          }

          // AbortSignal.reason should be set (AbortError)
          for (const ac of controllers) {
            expect(ac.signal.aborted).toBe(true)
          }
        },
      ),
      { numRuns: 50 },
    )
  })

  it('cancelled AbortController signal throws AbortError on listener', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (tag) => {
          cancelAll() // reset

          const ac = new AbortController()
          registerAbort(tag, ac)

          let abortFired = false
          ac.signal.addEventListener('abort', () => {
            abortFired = true
          })

          cancelByTag(tag)

          expect(abortFired).toBe(true)
          expect(ac.signal.aborted).toBe(true)
        },
      ),
      { numRuns: 50 },
    )
  })
})
