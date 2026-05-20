/**
 * Mock：认证模块
 *
 * 接口列表：
 * - POST /api/auth/login        登录，签发 mock-token-<userId>-<ts>
 * - POST /api/auth/logout       登出（仅清空客户端态，服务端无副作用）
 * - GET  /api/auth/userInfo     根据 token 解析当前用户
 * - GET  /api/auth/menus        根据当前用户角色返回可见菜单 + 权限码 + 角色码
 *
 * 设计点：
 * - 除登录外所有接口经过 `guard()` 鉴权
 * - menus 过滤规则：
 *   - 若拥有 Super_Admin 角色：返回完整菜单树 + ALL_PERMISSION_CODES
 *   - 否则：递归过滤掉 permission 不在用户权限码集合中的节点；
 *     directory 节点若过滤后无 children 则一并丢弃
 */
import type { LoginRequest, LoginResponse, Menu, User, UserMenusResponse } from '@/types/domain'
import {
  decodeToken,
  extractToken,
  fail,
  guard,
  ok,
  parseBody,
  type MockMethod,
} from './_utils'
import { menus } from './_data/menus'
import { rolePermissionMap, roles } from './_data/roles'
import { ALL_PERMISSION_CODES } from './_data/permissions'
import { stripPassword, users } from './_data/users'

const SUPER_ADMIN = 'Super_Admin'

/** 计算指定角色集合并集对应的权限码集合 */
function collectPermissions(roleCodes: string[]): string[] {
  if (roleCodes.includes(SUPER_ADMIN)) return [...ALL_PERMISSION_CODES]
  const set = new Set<string>()
  for (const code of roleCodes) {
    const codes = rolePermissionMap[code] || []
    for (const c of codes) set.add(c)
  }
  return Array.from(set)
}

/** 递归过滤菜单树：保留无 permission 限制 / 用户拥有 permission / 还有可见 children 的目录/分组 */
function filterMenusByPermissions(tree: Menu[], owned: string[]): Menu[] {
  const result: Menu[] = []
  for (const node of tree) {
    const filteredChildren = node.children?.length
      ? filterMenusByPermissions(node.children, owned)
      : []

    if (node.type === 'directory' || node.type === 'group') {
      // 容器节点（目录/分组）：若过滤后还有可见子节点，保留
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren })
      }
      continue
    }

    // menu / button 节点：基于 permission 过滤
    const need = node.permission
    const allowed = !need || owned.includes(need)
    if (allowed) {
      result.push({ ...node, children: filteredChildren })
    }
  }
  return result
}

const authMocks: MockMethod[] = [
  // ===== 登录 =====
  {
    url: '/api/auth/login',
    method: 'post',
    response: (req): unknown => {
      const { username, password } = parseBody<LoginRequest>(req)
      const matched = users.find((u) => u.username === username && u.password === password)
      if (!matched) return fail('账号或密码错误', 40001)
      if (matched.status !== 1) return fail('账号已被禁用', 40002)
      const ts = Date.now()
      const token = `mock-token-${matched.id}-${ts}`
      const refreshToken = `mock-refresh-${matched.id}-${ts}`
      const resp: LoginResponse = {
        token,
        refreshToken,
        user: stripPassword(matched),
      }
      return ok(resp)
    },
  },

  // ===== 刷新 token =====
  {
    url: '/api/auth/refresh',
    method: 'post',
    response: (req): unknown => {
      const { refreshToken } = parseBody<{ refreshToken?: string }>(req)
      if (!refreshToken || typeof refreshToken !== 'string') {
        return fail('refreshToken 缺失', 40005)
      }
      const m = /^mock-refresh-(\d+)-(\d+)$/.exec(refreshToken)
      if (!m) return fail('refreshToken 非法', 40005)
      const userId = Number(m[1])
      if (!Number.isFinite(userId)) return fail('refreshToken 非法', 40005)
      const matched = users.find((u) => u.id === userId)
      if (!matched) return fail('用户不存在', 40004)
      const ts = Date.now()
      return ok({
        token: `mock-token-${matched.id}-${ts}`,
        refreshToken: `mock-refresh-${matched.id}-${ts}`,
      })
    },
  },

  // ===== 注册 =====
  {
    url: '/api/auth/register',
    method: 'post',
    response: (req): unknown => {
      const body = parseBody<{ username?: string; nickname?: string; password?: string }>(req)
      const username = (body.username ?? '').trim()
      const nickname = (body.nickname ?? '').trim()
      const password = (body.password ?? '').trim()
      if (!/^[A-Za-z0-9_]{4,20}$/.test(username)) return fail('账号格式不合法', 40006)
      if (!nickname || nickname.length > 20) return fail('昵称不合法', 40006)
      if (password.length < 6 || password.length > 20) return fail('密码长度需 6-20', 40006)
      if (users.some((u) => u.username === username)) return fail('用户名已存在', 40005)
      const id = users.reduce((acc, u) => Math.max(acc, u.id), 0) + 1
      const created = {
        id,
        username,
        password,
        nickname,
        email: '',
        phone: '',
        status: 1 as const,
        roleCodes: ['Basic_User'],
        avatar: '',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }
      users.push(created)
      const ts = Date.now()
      const resp: LoginResponse = {
        token: `mock-token-${id}-${ts}`,
        refreshToken: `mock-refresh-${id}-${ts}`,
        user: stripPassword(created),
      }
      return ok(resp, '注册成功')
    },
  },

  // ===== 登出 =====
  {
    url: '/api/auth/logout',
    method: 'post',
    response: guard(() => ok(null, '已登出')),
  },

  // ===== 当前用户信息 =====
  {
    url: '/api/auth/userInfo',
    method: 'get',
    response: guard((req): unknown => {
      const token = extractToken(req)
      const userId = decodeToken(token)
      if (userId === null) return fail('Token 解析失败', 40003)
      const matched = users.find((u) => u.id === userId)
      if (!matched) return fail('用户不存在', 40004)
      const user: User = stripPassword(matched)
      return ok(user)
    }),
  },

  // ===== 当前用户菜单（含权限码 + 角色码）=====
  {
    url: '/api/auth/menus',
    method: 'get',
    response: guard((req): unknown => {
      const token = extractToken(req)
      const userId = decodeToken(token)
      if (userId === null) return fail('Token 解析失败', 40003)
      const matched = users.find((u) => u.id === userId)
      if (!matched) return fail('用户不存在', 40004)

      const userRoleCodes = matched.roleCodes
      // 校验角色编码合法（剔除 rolePermissionMap 中不存在的）
      const validRoleCodes = userRoleCodes.filter((c) => c === SUPER_ADMIN || c in rolePermissionMap)
      const ownedPermissions = collectPermissions(validRoleCodes)

      const visibleMenus = validRoleCodes.includes(SUPER_ADMIN)
        ? menus.map((m) => deepCloneMenu(m))
        : filterMenusByPermissions(menus, ownedPermissions)

      // 角色完整列表：基于 roles 表，仅保留用户拥有的角色码
      const matchedRoleCodes = roles
        .filter((r) => userRoleCodes.includes(r.code))
        .map((r) => r.code)

      const resp: UserMenusResponse = {
        menus: visibleMenus,
        permissions: ownedPermissions,
        roles: matchedRoleCodes,
      }
      return ok(resp)
    }),
  },
]

function deepCloneMenu(m: Menu): Menu {
  return {
    ...m,
    children: m.children?.map((c) => deepCloneMenu(c)) ?? [],
  }
}

export default authMocks
