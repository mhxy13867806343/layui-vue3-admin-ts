// Feature: layui-vue-admin-system, Property 7: decideNavigation decision table is exhaustive and ordered
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { decideNavigation } from '@/router/guard'

describe('decideNavigation', () => {
  it('Property 7: whitelist → pass', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 16 }),
        fc.boolean(),
        (path, hasToken) => {
          const r = decideNavigation({
            to: path,
            hasToken,
            whitelist: [path],
            registered: [],
            owned: [],
            roles: [],
          })
          expect(r).toEqual({ type: 'pass' })
        },
      ),
      { numRuns: 50 },
    )
  })

  it('Property 7: no token (and not in whitelist) → redirect /login?redirect=to', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 16 }), (path) => {
        const r = decideNavigation({
          to: path,
          hasToken: false,
          whitelist: ['/login'],
          registered: [],
          owned: [],
          roles: [],
        })
        // 路径恰好为 /login 的退化场景由白名单短路
        if (path === '/login') {
          expect(r).toEqual({ type: 'pass' })
          return
        }
        expect(r).toEqual({ type: 'redirect', path: '/login', query: { redirect: path } })
      }),
      { numRuns: 50 },
    )
  })

  it('Property 7: registered miss → /404', () => {
    const r = decideNavigation({
      to: '/missing',
      hasToken: true,
      whitelist: ['/login'],
      registered: [],
      owned: [],
      roles: [],
    })
    expect(r).toEqual({ type: 'redirect', path: '/404' })
  })

  it('Property 7: required mismatch → /403', () => {
    const r = decideNavigation({
      to: '/system/user',
      hasToken: true,
      whitelist: ['/login'],
      registered: ['/system/user'],
      required: 'user:view',
      owned: [],
      roles: [],
    })
    expect(r).toEqual({ type: 'redirect', path: '/403' })
  })

  it('Property 7: required satisfied → pass', () => {
    const r = decideNavigation({
      to: '/system/user',
      hasToken: true,
      whitelist: ['/login'],
      registered: ['/system/user'],
      required: 'user:view',
      owned: ['user:view'],
      roles: [],
    })
    expect(r).toEqual({ type: 'pass' })
  })
})
