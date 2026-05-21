/**
 * Mock：操作日志
 *
 * - GET    /api/audit-log/page
 * - GET    /api/audit-log/:id
 * - DELETE /api/audit-log/clear
 */
import {
  fail,
  guard,
  ok,
  paginate,
  parseQuery,
  type MockMethod,
} from './_utils'
import { auditLogs, clearAuditLogs, type AuditLog } from './_data/audit-logs'

interface AuditLogPageQuery {
  page?: string
  pageSize?: string
  username?: string
  opType?: string
  status?: string
  startDate?: string
  endDate?: string
}

function extractIdFromUrl(url: string): number | null {
  const path = url.split('?')[0]
  const m = /\/api\/audit-log\/(\d+)$/.exec(path)
  if (!m) return null
  const id = Number(m[1])
  return Number.isFinite(id) ? id : null
}

const auditLogMocks: MockMethod[] = [
  // 分页
  {
    url: '/api/audit-log/page',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as AuditLogPageQuery
      const filtered = auditLogs.filter((l) => {
        if (q.username && !l.username.toLowerCase().includes(q.username.toLowerCase())) return false
        if (q.opType && l.opType !== q.opType) return false
        if (q.status && l.status !== q.status) return false
        if (q.startDate && l.createdAt < q.startDate) return false
        if (q.endDate && l.createdAt > q.endDate + ' 23:59:59') return false
        return true
      })
      return ok(
        paginate(filtered, {
          page: Number(q.page) || 1,
          pageSize: Number(q.pageSize) || 10,
        }),
      )
    }),
  },

  // 详情
  {
    url: '/api/audit-log/:id',
    method: 'get',
    response: guard((req): unknown => {
      const id = extractIdFromUrl(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const log = auditLogs.find((l) => l.id === id)
      if (!log) return fail('日志不存在', 40004)
      return ok<AuditLog>(log)
    }),
  },

  // 清空
  {
    url: '/api/audit-log/clear',
    method: 'delete',
    response: guard((): unknown => {
      clearAuditLogs()
      return ok(null, '已清空所有日志')
    }),
  },
]

export default auditLogMocks
