/**
 * 用户数据
 *
 * Mock 内部为方便登录鉴权，对外类型 `User` 增加 `password` 字段，
 * 在响应阶段统一剥离 password 后再返回。
 *
 * 预置：
 * - admin / 123456：Super_Admin
 * - user  / 123456：Basic_User
 *
 * 此外随机生成 30 条普通用户（id 从 100 起），用于分页接口。
 */
import Mock from 'mockjs'
import type { User } from '@/types/domain'

/** 内部使用的"含密码"用户类型 */
export interface MockUser extends User {
  password: string
}

const presetUsers: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800000000',
    status: 1,
    roleCodes: ['Super_Admin'],
    avatar: '',
    createdAt: '2024-01-01 00:00:00',
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    nickname: '普通用户',
    email: 'user@example.com',
    phone: '13800000001',
    status: 1,
    roleCodes: ['Basic_User'],
    avatar: '',
    createdAt: '2024-01-01 00:00:00',
  },
]

/** 生成 30 条普通用户。username 唯一，密码统一为 '123456' */
function generateRandomUsers(): MockUser[] {
  const used = new Set<string>(presetUsers.map((u) => u.username))
  const list: MockUser[] = []
  let id = 100
  while (list.length < 30) {
    const candidate = String(Mock.Random.string('lower', 6, 10))
    if (used.has(candidate)) continue
    used.add(candidate)
    list.push({
      id,
      username: candidate,
      password: '123456',
      nickname: String(Mock.Random.cname()),
      email: String(Mock.Random.email()),
      phone: `13${Mock.Random.string('number', 9)}`,
      status: 1,
      roleCodes: ['Basic_User'],
      avatar: '',
      createdAt: String(Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')),
    })
    id += 1
  }
  return list
}

/**
 * 用户存储。所有 CRUD 接口直接修改此数组。
 */
export const users: MockUser[] = [...presetUsers, ...generateRandomUsers()]

/** 下一个可用用户 id（当前最大 + 1） */
export function nextUserId(): number {
  return users.reduce((acc, u) => Math.max(acc, u.id), 0) + 1
}

/** 剥离 password 字段，返回对外可见的 User */
export const stripPassword = (u: MockUser): User => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = u
  return rest
}
