// Feature: layui-vue-admin-system, Property 6: Super_Admin passes any permission check
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { hasPermissionPure, SUPER_ADMIN_CODE } from '@/utils/permission'

describe('hasPermissionPure', () => {
  it('Property 6: Super_Admin role grants all permissions', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.array(fc.string(), { maxLength: 5 }),
          fc.constant(undefined),
          fc.constant(null),
        ),
        fc.array(fc.string(), { maxLength: 5 }),
        (code, owned) => {
          const ctx = { roles: [SUPER_ADMIN_CODE], owned }
          expect(hasPermissionPure(code, ctx)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('empty / null / undefined code is treated as no requirement', () => {
    expect(hasPermissionPure(undefined, { roles: [], owned: [] })).toBe(true)
    expect(hasPermissionPure(null, { roles: [], owned: [] })).toBe(true)
    expect(hasPermissionPure([], { roles: [], owned: [] })).toBe(true)
    expect(hasPermissionPure('', { roles: [], owned: [] })).toBe(true)
  })

  it('array semantic is "any match"', () => {
    expect(
      hasPermissionPure(['a', 'b'], { roles: [], owned: ['b'] }),
    ).toBe(true)
    expect(
      hasPermissionPure(['a', 'b'], { roles: [], owned: ['c'] }),
    ).toBe(false)
  })
})
