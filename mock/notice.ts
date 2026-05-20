/**
 * Mock：通知中心
 *
 * 接口：
 * - GET /api/notice/list?type=...           分页 + 按类型过滤
 * - PUT /api/notice/:id/read                 单条已读
 * - PUT /api/notice/read-all?type=...        某类全部已读
 * - GET /api/notice/unread-count             分类未读统计
 */
import {
  fail,
  guard,
  ok,
  paginate,
  parseQuery,
  type MockMethod,
} from './_utils'
import { notices, type NoticeType } from './_data/notices'

interface ListQuery {
  type?: NoticeType
  page?: string
  pageSize?: string
}

function extractId(url: string): number | null {
  const path = url.split('?')[0]
  const m = /\/api\/notice\/(\d+)/.exec(path)
  if (!m) return null
  const id = Number(m[1])
  return Number.isFinite(id) ? id : null
}

const noticeMocks: MockMethod[] = [
  {
    url: '/api/notice/list',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as ListQuery
      const filtered = q.type ? notices.filter((n) => n.type === q.type) : notices
      return ok(
        paginate(filtered, {
          page: Number(q.page) || 1,
          pageSize: Number(q.pageSize) || 10,
        }),
      )
    }),
  },
  {
    url: '/api/notice/:id/read',
    method: 'put',
    response: guard((req): unknown => {
      const id = extractId(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const target = notices.find((n) => n.id === id)
      if (!target) return fail('通知不存在', 40004)
      target.read = true
      return ok(null, '已标记为已读')
    }),
  },
  {
    url: '/api/notice/read-all',
    method: 'put',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as ListQuery
      let count = 0
      for (const n of notices) {
        if (!q.type || n.type === q.type) {
          if (!n.read) {
            n.read = true
            count++
          }
        }
      }
      return ok({ count }, `已标记 ${count} 条为已读`)
    }),
  },
  {
    url: '/api/notice/unread-count',
    method: 'get',
    response: guard((): unknown => {
      let message = 0
      let announcement = 0
      let todo = 0
      for (const n of notices) {
        if (n.read) continue
        if (n.type === 'message') message++
        else if (n.type === 'announcement') announcement++
        else if (n.type === 'todo') todo++
      }
      return ok({
        message,
        announcement,
        todo,
        total: message + announcement + todo,
      })
    }),
  },
]

export default noticeMocks
