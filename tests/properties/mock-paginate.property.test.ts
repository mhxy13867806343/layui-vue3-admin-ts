// Feature: layui-vue-admin-system, Property 8 (subset): paginate is total-preserving and stitches back to original
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { paginate, ok, fail, unauthorized, requireToken } from '../../mock/_utils'

describe('mock helpers', () => {
  it('Property 8: paginate preserves total and bounds list size', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { maxLength: 200 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 30 }),
        (rows, page, pageSize) => {
          const r = paginate(rows, { page, pageSize })
          expect(r.total).toBe(rows.length)
          expect(r.list.length).toBeLessThanOrEqual(pageSize)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('Property 8: stitching all pages reproduces input', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { maxLength: 100 }),
        fc.integer({ min: 1, max: 20 }),
        (rows, pageSize) => {
          const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
          const stitched: number[] = []
          for (let p = 1; p <= totalPages; p++) {
            stitched.push(...paginate(rows, { page: p, pageSize }).list)
          }
          expect(stitched).toEqual(rows)
        },
      ),
      { numRuns: 60 },
    )
  })

  it('Property 8: response shells satisfy invariants', () => {
    expect(ok(123).code).toBe(0)
    expect(fail('boom').code).not.toBe(0)
    expect(unauthorized().code).toBe(401)
  })

  it('Property 8: requireToken tolerates only Bearer mock-token-*', () => {
    expect(requireToken({ headers: {} })).toBe(false)
    expect(requireToken({ headers: { authorization: 'Bearer mock-token-1-2' } })).toBe(true)
    expect(requireToken({ headers: { Authorization: 'mock-token-1' } })).toBe(true)
    expect(requireToken({ headers: { Authorization: 'Bearer not-a-token' } })).toBe(false)
  })
})
