/**
 * Mock：版本管理模块
 *
 * 接口列表：
 * - GET    /api/version/page         分页查询
 * - POST   /api/version              新增
 * - PUT    /api/version              更新
 * - DELETE /api/version/:id          删除
 * - POST   /api/version/:id/publish  发布（草稿 -> 已发布）
 */
import {
  fail,
  formatNow,
  guard,
  ok,
  paginate,
  parseBody,
  parseQuery,
  type MockMethod,
} from './_utils'
import { nextVersionId, versions, type Version } from './_data/versions'

interface VersionPageQuery {
  page?: string
  pageSize?: string
  version?: string
  status?: string
  type?: string
}

function extractIdFromUrl(url: string, suffix?: string): number | null {
  const path = url.split('?')[0]
  const re = suffix
    ? new RegExp(`/api/version/(\\d+)/${suffix}$`)
    : /\/api\/version\/(\d+)$/
  const match = re.exec(path)
  if (!match) return null
  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

const versionMocks: MockMethod[] = [
  // ===== 分页 =====
  {
    url: '/api/version/page',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as VersionPageQuery
      const filtered = versions.filter((v) => {
        if (q.version && !v.version.includes(q.version)) return false
        if (q.status && v.status !== q.status) return false
        if (q.type && v.type !== q.type) return false
        return true
      })
      filtered.sort((a, b) => b.publishDate.localeCompare(a.publishDate))
      return ok(
        paginate(filtered, {
          page: Number(q.page) || 1,
          pageSize: Number(q.pageSize) || 10,
        }),
      )
    }),
  },

  // ===== 发布 =====
  {
    url: '/api/version/:id/publish',
    method: 'post',
    response: guard((req): unknown => {
      const id = extractIdFromUrl(req.url, 'publish')
      if (id === null) return fail('缺少 id', 40000)
      const target = versions.find((v) => v.id === id)
      if (!target) return fail('版本不存在', 40004)
      if (target.status !== 'draft') return fail('仅草稿状态可发布', 40006)
      target.status = 'published'
      if (!target.publishDate) target.publishDate = formatNow().split(' ')[0]
      return ok(target, '发布成功')
    }),
  },

  // ===== 新增 =====
  {
    url: '/api/version',
    method: 'post',
    response: guard((req): unknown => {
      const body = parseBody<Partial<Version>>(req)
      if (!body.version) return fail('版本号不能为空', 40000)
      const created: Version = {
        id: nextVersionId(),
        version: body.version,
        type: body.type ?? 'patch',
        summary: body.summary ?? '',
        content: body.content || '',
        publishDate: body.publishDate || formatNow().split(' ')[0],
        status: body.status || 'draft',
        forceUpdate: body.forceUpdate || false,
        downloadUrl: body.downloadUrl || '',
        createdAt: formatNow(),
      }
      versions.push(created)
      return ok(created, '新增成功')
    }),
  },

  // ===== 更新 =====
  {
    url: '/api/version',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<Partial<Version>>(req)
      if (!body.id) return fail('缺少 id', 40000)
      const idx = versions.findIndex((v) => v.id === body.id)
      if (idx < 0) return fail('版本不存在', 40004)
      const target = versions[idx]
      versions[idx] = {
        ...target,
        version: body.version ?? target.version,
        type: body.type ?? target.type,
        summary: body.summary ?? target.summary,
        content: body.content ?? target.content,
        publishDate: body.publishDate ?? target.publishDate,
        status: body.status ?? target.status,
        forceUpdate: body.forceUpdate ?? target.forceUpdate,
        downloadUrl: body.downloadUrl ?? target.downloadUrl,
      }
      return ok(versions[idx], '更新成功')
    }),
  },

  // ===== 删除 =====
  {
    url: '/api/version/:id',
    method: 'delete',
    response: guard((req): unknown => {
      const id = extractIdFromUrl(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const idx = versions.findIndex((v) => v.id === id)
      if (idx < 0) return fail('版本不存在', 40004)
      versions.splice(idx, 1)
      return ok(null, '删除成功')
    }),
  },
]

export default versionMocks
