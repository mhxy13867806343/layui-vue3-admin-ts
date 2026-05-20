// Feature: layui-vue-admin-system, Property 9: closeTabReducer keeps tab list consistent
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { closeTabReducer, isCloseVisible } from '@/store/modules/app'
import type { TabItem } from '@/types/domain'

const tabArb = fc.uniqueArray(
  fc.string({ minLength: 1, maxLength: 8 }).map<TabItem>((s) => ({
    fullPath: `/p/${s}`,
    title: s,
    closable: true,
  })),
  { selector: (t) => t.fullPath, minLength: 1, maxLength: 8 },
)

describe('closeTabReducer', () => {
  it('Property 9: length === 1 → input is returned unchanged', () => {
    fc.assert(
      fc.property(tabArb, (tabs) => {
        fc.pre(tabs.length === 1)
        const r = closeTabReducer(tabs, tabs[0].fullPath, tabs[0].fullPath)
        expect(r.tabs).toEqual(tabs)
        expect(r.activePath).toBe(tabs[0].fullPath)
        expect(isCloseVisible(tabs)).toBe(false)
      }),
      { numRuns: 50 },
    )
  })

  it('Property 9: closing non-active keeps activePath', () => {
    fc.assert(
      fc.property(tabArb, (tabs) => {
        fc.pre(tabs.length >= 2)
        const active = tabs[0].fullPath
        const closing = tabs[1].fullPath
        const r = closeTabReducer(tabs, active, closing)
        expect(r.activePath).toBe(active)
        expect(r.tabs.length).toBe(tabs.length - 1)
        expect(r.tabs.find((t) => t.fullPath === closing)).toBeUndefined()
      }),
      { numRuns: 100 },
    )
  })

  it('Property 9: closing active prefers right neighbor, falls back to left', () => {
    fc.assert(
      fc.property(tabArb, fc.integer({ min: 0, max: 100 }), (tabs, seed) => {
        fc.pre(tabs.length >= 2)
        const idx = seed % tabs.length
        const active = tabs[idx].fullPath
        const r = closeTabReducer(tabs, active, active)
        expect(r.tabs.length).toBe(tabs.length - 1)
        expect(r.tabs.find((t) => t.fullPath === active)).toBeUndefined()
        const expected = tabs[idx + 1]?.fullPath ?? tabs[idx - 1]?.fullPath ?? ''
        expect(r.activePath).toBe(expected)
      }),
      { numRuns: 100 },
    )
  })

  it('isCloseVisible matches length>1', () => {
    expect(isCloseVisible([])).toBe(false)
    expect(isCloseVisible([{ fullPath: '/a', title: 'a', closable: true }])).toBe(false)
    expect(
      isCloseVisible([
        { fullPath: '/a', title: 'a', closable: true },
        { fullPath: '/b', title: 'b', closable: true },
      ]),
    ).toBe(true)
  })
})
