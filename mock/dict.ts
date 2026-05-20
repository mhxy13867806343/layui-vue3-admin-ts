/**
 * Mock：字典查询
 *
 * - GET /api/dict/:code  返回单个字典项数组
 * - GET /api/dict/batch  ?codes=a,b,c 批量返回 Record<code, DictItem[]>
 */
import { fail, guard, ok, parseQuery, type MockMethod } from './_utils'
import { dicts } from './_data/dicts'

function extractCode(url: string): string | null {
  const path = url.split('?')[0]
  const m = /\/api\/dict\/([A-Za-z0-9_-]+)/.exec(path)
  if (!m) return null
  return m[1]
}

const dictMocks: MockMethod[] = [
  {
    url: '/api/dict/batch',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as { codes?: string }
      const codes = (q.codes ?? '').split(',').map((c) => c.trim()).filter(Boolean)
      const out: Record<string, unknown> = {}
      for (const code of codes) {
        out[code] = dicts[code] ?? []
      }
      return ok(out)
    }),
  },
  {
    url: '/api/dict/:code',
    method: 'get',
    response: guard((req): unknown => {
      const code = extractCode(req.url)
      if (!code) return fail('缺少 code', 40000)
      const items = dicts[code]
      if (!items) return ok([], '字典不存在，已返回空数组')
      return ok(items)
    }),
  },
]

export default dictMocks
