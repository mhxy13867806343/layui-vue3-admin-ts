/**
 * Mock：字典管理模块
 *
 * 接口列表：
 * - GET    /api/dict-type/page       字典类型分页
 * - POST   /api/dict-type            新增字典类型
 * - PUT    /api/dict-type            更新字典类型
 * - DELETE /api/dict-type/:id        删除字典类型
 * - GET    /api/dict-item/list       字典项列表（按 dictTypeId）
 * - POST   /api/dict-item            新增字典项
 * - PUT    /api/dict-item            更新字典项
 * - DELETE /api/dict-item/:id        删除字典项
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
import {
  dictItems,
  dictTypes,
  nextDictItemId,
  nextDictTypeId,
  type DictItem,
  type DictType,
} from './_data/dicts-manage'

interface DictTypePageQuery {
  page?: string
  pageSize?: string
  name?: string
  code?: string
}

function extractIdFromUrl(url: string, prefix: string): number | null {
  const path = url.split('?')[0]
  const regex = new RegExp(`${prefix}/(\\d+)`)
  const match = regex.exec(path)
  if (!match) return null
  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

const dictManageMocks: MockMethod[] = [
  // ===== 字典类型分页 =====
  {
    url: '/api/dict-type/page',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as DictTypePageQuery
      const filtered = dictTypes.filter((d) => {
        if (q.name && !d.name.includes(q.name)) return false
        if (q.code && !d.code.includes(q.code)) return false
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

  // ===== 新增字典类型 =====
  {
    url: '/api/dict-type',
    method: 'post',
    response: guard((req): unknown => {
      const body = parseBody<Partial<DictType>>(req)
      if (!body.name || !body.code) return fail('名称和编码不能为空', 40000)
      if (dictTypes.some((d) => d.code === body.code)) return fail('编码已存在', 40005)
      const created: DictType = {
        id: nextDictTypeId(),
        name: body.name,
        code: body.code,
        status: body.status ?? 1,
        remark: body.remark || '',
        createdAt: formatNow(),
      }
      dictTypes.push(created)
      return ok(created, '新增成功')
    }),
  },

  // ===== 更新字典类型 =====
  {
    url: '/api/dict-type',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<Partial<DictType>>(req)
      if (!body.id) return fail('缺少 id', 40000)
      const idx = dictTypes.findIndex((d) => d.id === body.id)
      if (idx < 0) return fail('字典类型不存在', 40004)
      const target = dictTypes[idx]
      dictTypes[idx] = {
        ...target,
        name: body.name ?? target.name,
        code: body.code ?? target.code,
        status: body.status ?? target.status,
        remark: body.remark ?? target.remark,
      }
      return ok(dictTypes[idx], '更新成功')
    }),
  },

  // ===== 删除字典类型 =====
  {
    url: '/api/dict-type/:id',
    method: 'delete',
    response: guard((req): unknown => {
      const id = extractIdFromUrl(req.url, '/api/dict-type')
      if (id === null) return fail('缺少 id', 40000)
      const idx = dictTypes.findIndex((d) => d.id === id)
      if (idx < 0) return fail('字典类型不存在', 40004)
      dictTypes.splice(idx, 1)
      // 同时删除关联的字典项
      for (let i = dictItems.length - 1; i >= 0; i--) {
        if (dictItems[i].dictTypeId === id) dictItems.splice(i, 1)
      }
      return ok(null, '删除成功')
    }),
  },

  // ===== 字典项列表 =====
  {
    url: '/api/dict-item/list',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as { dictTypeId?: string }
      if (!q.dictTypeId) return fail('缺少 dictTypeId', 40000)
      const typeId = Number(q.dictTypeId)
      const items = dictItems
        .filter((i) => i.dictTypeId === typeId)
        .sort((a, b) => a.sort - b.sort)
      return ok(items)
    }),
  },

  // ===== 新增字典项 =====
  {
    url: '/api/dict-item',
    method: 'post',
    response: guard((req): unknown => {
      const body = parseBody<Partial<DictItem>>(req)
      if (!body.dictTypeId || !body.label) return fail('缺少必要字段', 40000)
      const created: DictItem = {
        id: nextDictItemId(),
        dictTypeId: body.dictTypeId,
        label: body.label,
        value: body.value ?? '',
        sort: body.sort ?? 0,
        status: body.status ?? 1,
        createdAt: formatNow(),
      }
      dictItems.push(created)
      return ok(created, '新增成功')
    }),
  },

  // ===== 更新字典项 =====
  {
    url: '/api/dict-item',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<Partial<DictItem>>(req)
      if (!body.id) return fail('缺少 id', 40000)
      const idx = dictItems.findIndex((i) => i.id === body.id)
      if (idx < 0) return fail('字典项不存在', 40004)
      const target = dictItems[idx]
      dictItems[idx] = {
        ...target,
        label: body.label ?? target.label,
        value: body.value ?? target.value,
        sort: body.sort ?? target.sort,
        status: body.status ?? target.status,
      }
      return ok(dictItems[idx], '更新成功')
    }),
  },

  // ===== 删除字典项 =====
  {
    url: '/api/dict-item/:id',
    method: 'delete',
    response: guard((req): unknown => {
      const id = extractIdFromUrl(req.url, '/api/dict-item')
      if (id === null) return fail('缺少 id', 40000)
      const idx = dictItems.findIndex((i) => i.id === id)
      if (idx < 0) return fail('字典项不存在', 40004)
      dictItems.splice(idx, 1)
      return ok(null, '删除成功')
    }),
  },
]

export default dictManageMocks
