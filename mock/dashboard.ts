/**
 * Mock：仪表盘统计接口
 *
 * 接口列表（统一 `data: { count: number }`）：
 * - GET /api/dashboard/userCount
 * - GET /api/dashboard/roleCount
 * - GET /api/dashboard/menuCount
 * - GET /api/dashboard/todayVisits
 */
import Mock from 'mockjs'
import { guard, ok, type MockMethod } from './_utils'
import { users } from './_data/users'
import { roles } from './_data/roles'
import { flattenMenus, menus } from './_data/menus'

interface CountPayload {
  count: number
}

const dashboardMocks: MockMethod[] = [
  {
    url: '/api/dashboard/userCount',
    method: 'get',
    response: guard(() => ok<CountPayload>({ count: users.length })),
  },
  {
    url: '/api/dashboard/roleCount',
    method: 'get',
    response: guard(() => ok<CountPayload>({ count: roles.length })),
  },
  {
    url: '/api/dashboard/menuCount',
    method: 'get',
    response: guard(() => ok<CountPayload>({ count: flattenMenus(menus).length })),
  },
  {
    url: '/api/dashboard/todayVisits',
    method: 'get',
    response: guard(() => ok<CountPayload>({ count: Mock.Random.integer(50, 5000) })),
  },
]

export default dashboardMocks
