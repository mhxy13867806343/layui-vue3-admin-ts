/**
 * Mock：角色管理模块
 *
 * 接口列表：
 * - GET    /api/role/page                  分页（code/name/status 过滤）
 * - POST   /api/role                       新增（编码重复 -> 40010）
 * - PUT    /api/role                       更新（编码若变更需查重）
 * - DELETE /api/role/:id                   删除（被 user.roleCodes 引用 -> 40020）
 * - GET    /api/role/:id/permissions       查询该角色权限码数组
 * - PUT    /api/role/:id/permissions       覆盖写入该角色权限码
 */
import type { Role } from '@/types/domain'
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
import { nextRoleId, rolePermissionMap, roles } from './_data/roles'
import { permissions } from './_data/permissions'
import { users } from './_data/users'

interface RolePageQuery {
  page?: string
  pageSize?: string
  code?: string
  name?: string
  status?: string
}

interface RoleCreateBody {
  code: string
  name: string
  description?: string
  status?: 0 | 1
}

interface RoleUpdateBody extends RoleCreateBody {
  id: number
}

interface RolePermissionsBody {
  permissions: string[]
}

const ROLE_CODE_DUPLICATE = 40010
const ROLE_IN_USE = 40020

/** 从 `/api/role/:id` / `/api/role/:id/permissions` 提取 id */
function extractRoleId(url: string): number | null {
  const path = url.split('?')[0]
  const match = /\/api\/role\/(\d+)/.exec(path)
  if (!match) return null
  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

const roleMocks: MockMethod[] = [
  // ===== 分页 =====
  {
    url: '/api/role/page',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as RolePageQuery
      const filtered = roles.filter((r) => {
        if (q.code && !r.code.includes(q.code)) return false
        if (q.name && !r.name.includes(q.name)) return false
        if (q.status !== undefined && q.status !== '' && Number(r.status) !== Number(q.status))
          return false
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

  // ===== 新增 =====
  {
    url: '/api/role',
    method: 'post',
    response: guard((req): unknown => {
      const body = parseBody<RoleCreateBody>(req)
      if (!body.code || !body.name) return fail('缺少必要字段', 40000)
      if (roles.some((r) => r.code === body.code)) {
        return fail('角色编码已存在', ROLE_CODE_DUPLICATE)
      }
      const created: Role = {
        id: nextRoleId(),
        code: body.code,
        name: body.name,
        description: body.description ?? '',
        status: body.status ?? 1,
        createdAt: formatNow(),
      }
      roles.push(created)
      // 默认无权限
      rolePermissionMap[created.code] = []
      return ok(created, '新增成功')
    }),
  },

  // ===== 更新 =====
  {
    url: '/api/role',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<RoleUpdateBody>(req)
      if (!body.id) return fail('缺少 id', 40000)
      const idx = roles.findIndex((r) => r.id === body.id)
      if (idx < 0) return fail('角色不存在', 40004)
      const target = roles[idx]
      // 编码若变更需查重
      if (body.code && body.code !== target.code) {
        if (roles.some((r) => r.code === body.code)) {
          return fail('角色编码已存在', ROLE_CODE_DUPLICATE)
        }
        // 同步迁移权限映射
        rolePermissionMap[body.code] = rolePermissionMap[target.code] ?? []
        delete rolePermissionMap[target.code]
        // 同步迁移用户绑定
        for (const u of users) {
          u.roleCodes = u.roleCodes.map((c) => (c === target.code ? body.code : c))
        }
      }
      const updated: Role = {
        ...target,
        code: body.code ?? target.code,
        name: body.name ?? target.name,
        description: body.description ?? target.description,
        status: body.status ?? target.status,
      }
      roles[idx] = updated
      return ok(updated, '更新成功')
    }),
  },

  // ===== 删除 =====
  {
    url: '/api/role/:id',
    method: 'delete',
    response: guard((req): unknown => {
      const id = extractRoleId(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const idx = roles.findIndex((r) => r.id === id)
      if (idx < 0) return fail('角色不存在', 40004)
      const target = roles[idx]
      // 引用检查：是否有用户使用该角色
      const inUse = users.some((u) => u.roleCodes.includes(target.code))
      if (inUse) {
        return fail('该角色正在被使用，无法删除', ROLE_IN_USE)
      }
      roles.splice(idx, 1)
      delete rolePermissionMap[target.code]
      return ok(null, '删除成功')
    }),
  },

  // ===== 查询角色权限 =====
  {
    url: '/api/role/:id/permissions',
    method: 'get',
    response: guard((req): unknown => {
      const id = extractRoleId(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const role = roles.find((r) => r.id === id)
      if (!role) return fail('角色不存在', 40004)
      const codes = rolePermissionMap[role.code] ?? []
      return ok([...codes])
    }),
  },

  // ===== 写入角色权限 =====
  {
    url: '/api/role/:id/permissions',
    method: 'put',
    response: guard((req): unknown => {
      const id = extractRoleId(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const role = roles.find((r) => r.id === id)
      if (!role) return fail('角色不存在', 40004)
      const body = parseBody<RolePermissionsBody>(req)
      const next = Array.isArray(body.permissions) ? body.permissions.slice() : []
      rolePermissionMap[role.code] = next
      return ok(null, '权限保存成功')
    }),
  },

  // ===== 权限元数据：返回全部权限码（供前端权限树渲染） =====
  {
    url: '/api/permission/list',
    method: 'get',
    response: guard((): unknown => ok(permissions)),
  },
]

export default roleMocks
