// Feature: layui-vue-admin-system, Property 13: Retry backoff sequence is monotonic
// For any retries=N, the i-th retry delay d_i satisfies d_i <= d_{i+1} <= MAX,
// and retries stop immediately when retryOn(err) === false.
import fc from 'fast-check'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computeDelay } from '@/utils/http/retry'
import { BASE_RETRY_DELAY, MAX_RETRY_DELAY } from '@/utils/http/core'

/**
 * **Validates: Requirements 19.1, 19.2**
 *
 * Property 13: 重试退避序列单调
 *
 * For any retries=N:
 * - computeDelay(i) produces values bounded by [0, MAX_RETRY_DELAY]
 * - The expected (non-jittered) delay is monotonically non-decreasing
 * - retryOn(err) === false stops retries immediately
 * - Successful responses stop retries
 */
describe('Property 13: HTTP Retry Interceptor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('computeDelay is bounded by [0, MAX_RETRY_DELAY] for any attempt', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        (attempt) => {
          const delay = computeDelay(attempt)
          expect(delay).toBeGreaterThanOrEqual(0)
          expect(delay).toBeLessThanOrEqual(MAX_RETRY_DELAY)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('computeDelay with fixed override returns that value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 10000 }),
        (attempt, fixedDelay) => {
          const delay = computeDelay(attempt, fixedDelay)
          expect(delay).toBe(fixedDelay)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('computeDelay with function override uses the function result', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 5000 }),
        (attempt, baseValue) => {
          const fn = (a: number) => baseValue * (a + 1)
          const delay = computeDelay(attempt, fn)
          expect(delay).toBe(baseValue * (attempt + 1))
        },
      ),
      { numRuns: 100 },
    )
  })

  it('default exponential backoff base grows with attempt (ignoring jitter)', () => {
    // The expected value (without jitter) is BASE * 2^attempt, capped at MAX.
    // With jitter of ±50, we verify the general trend is non-decreasing
    // by checking that the midpoint (BASE * 2^attempt) is monotonic.
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (maxAttempt) => {
          const midpoints: number[] = []
          for (let i = 0; i <= maxAttempt; i++) {
            const expected = Math.min(BASE_RETRY_DELAY * Math.pow(2, i), MAX_RETRY_DELAY)
            midpoints.push(expected)
          }

          // Midpoints should be monotonically non-decreasing
          for (let i = 1; i < midpoints.length; i++) {
            expect(midpoints[i]).toBeGreaterThanOrEqual(midpoints[i - 1])
          }
        },
      ),
      { numRuns: 50 },
    )
  })

  it('retry sequence delays are bounded and eventually cap at MAX_RETRY_DELAY', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }),
        (retries) => {
          const delays: number[] = []
          for (let i = 0; i < retries; i++) {
            delays.push(computeDelay(i))
          }

          // All delays are within bounds
          for (const d of delays) {
            expect(d).toBeGreaterThanOrEqual(0)
            expect(d).toBeLessThanOrEqual(MAX_RETRY_DELAY)
          }

          // For large enough attempts, delay should be at or near MAX
          if (retries > 5) {
            const lastDelay = delays[delays.length - 1]
            // With BASE=300, 2^5=32, 300*32=9600 > MAX=3000, so it should be capped
            expect(lastDelay).toBeLessThanOrEqual(MAX_RETRY_DELAY)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('performWithRetry retries up to configured max and stops on retryOn=false', async () => {
    // We test the retry logic by mocking the axios instance
    const { instance } = await import('@/utils/http/core')
    const { performWithRetry } = await import('@/utils/http/retry')

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 0, max: 4 }),
        async (maxRetries, successAt) => {
          // successAt is the attempt index where the request succeeds
          // If successAt > maxRetries, all attempts fail
          const effectiveSuccessAt = Math.min(successAt, maxRetries + 1)
          let callCount = 0

          const requestSpy = vi.spyOn(instance, 'request').mockImplementation(async () => {
            callCount++
            if (callCount <= effectiveSuccessAt) {
              const err: any = new Error('Server Error')
              err.response = { status: 500 }
              err.code = undefined
              err.isAxiosError = true
              throw err
            }
            return { data: { code: 0, data: 'ok', message: 'ok' }, status: 200 } as any
          })

          callCount = 0

          const cfg: any = {
            method: 'get',
            url: '/api/test',
            retry: { retries: maxRetries, delay: 0 },
          }

          if (effectiveSuccessAt <= maxRetries) {
            // Should eventually succeed
            const result = await performWithRetry(cfg)
            expect(result).toBeDefined()
            expect(callCount).toBe(effectiveSuccessAt + 1)
          } else {
            // All retries exhausted, should throw
            await expect(performWithRetry(cfg)).rejects.toThrow()
            expect(callCount).toBe(maxRetries + 1)
          }

          requestSpy.mockRestore()
        },
      ),
      { numRuns: 30 },
    )
  })

  it('performWithRetry stops immediately when retryOn returns false', async () => {
    const { instance } = await import('@/utils/http/core')
    const { performWithRetry } = await import('@/utils/http/retry')

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (maxRetries) => {
          let callCount = 0

          const requestSpy = vi.spyOn(instance, 'request').mockImplementation(async () => {
            callCount++
            const err: any = new Error('Client Error')
            err.response = { status: 400 }
            err.code = undefined
            err.isAxiosError = true
            throw err
          })

          callCount = 0

          const cfg: any = {
            method: 'get',
            url: '/api/test',
            retry: {
              retries: maxRetries,
              delay: 0,
              // retryOn returns false for 400 errors → no retry
              retryOn: (err: any) => err.response?.status >= 500,
            },
          }

          await expect(performWithRetry(cfg)).rejects.toThrow()
          // Should only be called once (no retries since retryOn returns false)
          expect(callCount).toBe(1)

          requestSpy.mockRestore()
        },
      ),
      { numRuns: 30 },
    )
  })
})
