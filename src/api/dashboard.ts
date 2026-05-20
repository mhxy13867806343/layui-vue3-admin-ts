/**
 * 仪表盘统计 API
 */
import { http } from '@/utils/http'

/** 计数响应体 */
export interface CountResp {
  count: number
}

/** 用户总数 */
export const getUserCount = () => http.get<CountResp>('/dashboard/userCount')

/** 角色总数 */
export const getRoleCount = () => http.get<CountResp>('/dashboard/roleCount')

/** 菜单总数（含按钮） */
export const getMenuCount = () => http.get<CountResp>('/dashboard/menuCount')

/** 今日访问量（mock 随机） */
export const getTodayVisits = () => http.get<CountResp>('/dashboard/todayVisits')
