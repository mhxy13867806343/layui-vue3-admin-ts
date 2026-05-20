// Feature: layui-vue-admin-system, Property 3: For any JSON-compatible value, storage.set then get returns deep-equal value
// Feature: layui-vue-admin-system, Property 4: For any non-JSON string written to underlying storage, storage.get returns null without throwing
import fc from 'fast-check'
import { beforeEach, describe, expect, it } from 'vitest'
import { storage, STORAGE_PREFIX } from '@/utils/storage'

describe('storage round-trip', () => {
  beforeEach(() => window.localStorage.clear())

  it('Property 3: round-trip preserves JSON-compatible value', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 32 }), fc.jsonValue(), (key, v) => {
        storage.set(key, v)
        expect(storage.get(key)).toEqual(v)
      }),
      { numRuns: 100 },
    )
  })

  it('Property 3: remove returns null', () => {
    storage.set('foo', { a: 1 })
    storage.remove('foo')
    expect(storage.get('foo')).toBeNull()
  })

  it('Property 4: malformed JSON returns null without throwing', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (raw) => {
        // 伪造一个非合法 JSON：除非它本身正好是 JSON.parse 合法
        let isJson = true
        try {
          JSON.parse(raw)
        } catch {
          isJson = false
        }
        fc.pre(!isJson)
        const key = 'malformed'
        window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, raw)
        expect(() => storage.get(key)).not.toThrow()
        expect(storage.get(key)).toBeNull()
      }),
      { numRuns: 60 },
    )
  })
})
