/**
 * Mock：用户管理模块
 *
 * 接口列表：
 * - GET    /api/user/page                  分页查询（username/nickname/status 模糊过滤）
 * - POST   /api/user                       新增（自动 nextUserId、写入 createdAt）
 * - PUT    /api/user                       更新基本信息（不更新 password）
 * - DELETE /api/user/:id                   删除
 * - POST   /api/user/:id/reset-password    重置密码为 '123456'
 */
import type {
  User,
  UserCreateRequest,
  UserUpdateRequest,
} from '@/types/domain'
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
import { nextUserId, stripPassword, users, type MockUser } from './_data/users'

interface UserPageQuery {
  page?: string
  pageSize?: string
  username?: string
  nickname?: string
  status?: string
}

/** 从 URL `/api/user/123/...` 中提取 id 数字段 */
function extractIdFromUrl(url: string): number | null {
  // 去除 query
  const path = url.split('?')[0]
  const match = /\/api\/user\/(\d+)/.exec(path)
  if (!match) return null
  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

const userMocks: MockMethod[] = [
  // ===== 分页 =====
  {
    url: '/api/user/page',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as UserPageQuery
      const filtered = users.filter((u) => {
        if (q.username && !u.username.includes(q.username)) return false
        if (q.nickname && !u.nickname.includes(q.nickname)) return false
        if (q.status !== undefined && q.status !== '' && Number(u.status) !== Number(q.status))
          return false
        return true
      })
      const list: User[] = filtered.map(stripPassword)
      return ok(
        paginate(list, {
          page: Number(q.page) || 1,
          pageSize: Number(q.pageSize) || 10,
        }),
      )
    }),
  },

  // ===== 新增 =====
  {
    url: '/api/user',
    method: 'post',
    response: guard((req): unknown => {
      const body = parseBody<UserCreateRequest>(req)
      if (!body.username || !body.password) {
        return fail('缺少必要字段', 40000)
      }
      // 用户名查重
      if (users.some((u) => u.username === body.username)) {
        return fail('用户名已存在', 40005)
      }
      const created: MockUser = {
        id: nextUserId(),
        username: body.username,
        password: body.password,
        nickname: body.nickname,
        roleCodes: body.roleCodes ?? [],
        status: body.status ?? 1,
        avatar: '',
        email: '',
        phone: '',
        createdAt: formatNow(),
      }
      users.push(created)
      return ok(stripPassword(created), '新增成功')
    }),
  },

  // ===== 更新 =====
  {
    url: '/api/user',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<UserUpdateRequest>(req)
      if (!body.id) return fail('缺少 id', 40000)
      const idx = users.findIndex((u) => u.id === body.id)
      if (idx < 0) return fail('用户不存在', 40004)
      const target = users[idx]
      const updated: MockUser = {
        ...target,
        username: body.username ?? target.username,
        nickname: body.nickname ?? target.nickname,
        roleCodes: body.roleCodes ?? target.roleCodes,
        status: body.status ?? target.status,
        updatedAt: formatNow(),
      }
      users[idx] = updated
      return ok(stripPassword(updated), '更新成功')
    }),
  },

  // ===== 删除 =====
  {
    url: '/api/user/:id',
    method: 'delete',
    response: guard((req): unknown => {
      const id = extractIdFromUrl(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const idx = users.findIndex((u) => u.id === id)
      if (idx < 0) return fail('用户不存在', 40004)
      users.splice(idx, 1)
      return ok(null, '删除成功')
    }),
  },

  // ===== 重置密码 =====
  {
    url: '/api/user/:id/reset-password',
    method: 'post',
    response: guard((req): unknown => {
      const id = extractIdFromUrl(req.url)
      if (id === null) return fail('缺少 id', 40000)
      const target = users.find((u) => u.id === id)
      if (!target) return fail('用户不存在', 40004)
      target.password = '123456'
      target.updatedAt = formatNow()
      return ok(null, '密码已重置为 123456')
    }),
  },

  // ===== 修改密码（需要旧密码校验） =====
  {
    url: '/api/user/change-password',
    method: 'post',
    response: guard((req): unknown => {
      const body = parseBody<{ userId: number; oldPassword: string; newPassword: string }>(req)
      if (!body.userId) return fail('缺少 userId', 40000)
      const target = users.find((u) => u.id === body.userId)
      if (!target) return fail('用户不存在', 40004)
      if (target.password !== body.oldPassword) return fail('原密码不正确', 40007)
      if (!body.newPassword || body.newPassword.length < 6 || body.newPassword.length > 20) {
        return fail('新密码长度需 6-20', 40006)
      }
      target.password = body.newPassword
      target.updatedAt = formatNow()
      return ok(null, '密码修改成功')
    }),
  },
]

export default userMocks
