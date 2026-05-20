/**
 * 用户管理 API
 */
import { http } from '@/utils/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { User, UserCreateRequest, UserUpdateRequest } from '@/types/domain'

/** 用户分页查询参数 */
export interface UserPageParams extends PageQuery {
  username?: string
  nickname?: string
  status?: 0 | 1
}

/** 分页查询用户 */
export const getUserPage = (params: UserPageParams) =>
  http.get<PageResult<User>>('/user/page', { params })

/** 新建用户 */
export const createUser = (body: UserCreateRequest) => http.post<User>('/user', body)

/** 更新用户（不含密码） */
export const updateUser = (body: UserUpdateRequest) => http.put<User>('/user', body)

/** 删除用户 */
export const deleteUser = (id: number) => http.delete<null>(`/user/${id}`)

/** 重置用户密码（mock 中重置为默认密码） */
export const resetUserPassword = (id: number) =>
  http.post<null>(`/user/${id}/reset-password`)
