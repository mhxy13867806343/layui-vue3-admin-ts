// Feature: layui-vue-admin-system, Property 10: 行级删除按钮可见性等价
// **Validates: Requirements 7.10**
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { canDeleteRow } from '@/utils/user-row'

/**
 * Arbitrary: generates a minimal User-like object with a positive integer id.
 */
const userRowArb = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
})

/**
 * Arbitrary: generates a list of user rows with unique ids.
 */
const userListArb = fc.uniqueArray(
  fc.integer({ min: 1, max: 100_000 }),
  { minLength: 1, maxLength: 20 },
).map((ids) => ids.map((id) => ({ id })))

describe('canDeleteRow (Property 10)', () => {
  it('canDeleteRow(row, currentUserId) === (row.id !== currentUserId)', () => {
    fc.assert(
      fc.property(
        userRowArb,
        fc.integer({ min: 1, max: 100_000 }),
        (row, currentUserId) => {
          const result = canDeleteRow(row, currentUserId)
          expect(result).toBe(row.id !== currentUserId)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('current user row is never deletable', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100_000 }),
        (userId) => {
          expect(canDeleteRow({ id: userId }, userId)).toBe(false)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('other users are always deletable', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50_000 }),
        fc.integer({ min: 50_001, max: 100_000 }),
        (rowId, currentUserId) => {
          // rowId and currentUserId are guaranteed different by range
          expect(canDeleteRow({ id: rowId }, currentUserId)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('for any user list, deletable set === { row | row.id !== currentUserId }', () => {
    fc.assert(
      fc.property(
        userListArb,
        fc.integer({ min: 1, max: 100_000 }),
        (rows, currentUserId) => {
          const deletableIds = rows
            .filter((row) => canDeleteRow(row, currentUserId))
            .map((r) => r.id)
          const expectedIds = rows
            .filter((row) => row.id !== currentUserId)
            .map((r) => r.id)
          expect(deletableIds).toEqual(expectedIds)
        },
      ),
      { numRuns: 100 },
    )
  })
})
