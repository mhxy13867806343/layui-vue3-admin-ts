/**
 * 角色管理 API
 */
import { http } from '@/utils/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { Role } from '@/types/domain'

/** 角色分页查询参数 */
export interface RolePageParams extends PageQuery {
  code?: string
  name?: string
  status?: 0 | 1
}

/** 角色创建请求体 */
export interface RoleCreateRequest {
  code: string
  name: string
  description?: string
  status: 0 | 1
}

/** 角色更新请求体 */
export interface RoleUpdateRequest extends RoleCreateRequest {
  id: number
}

/** 分页查询角色 */
export const getRolePage = (params: RolePageParams) =>
  http.get<PageResult<Role>>('/role/page', { params })

/** 新建角色 */
export const createRole = (body: RoleCreateRequest) => http.post<Role>('/role', body)

/** 更新角色 */
export const updateRole = (body: RoleUpdateRequest) => http.put<Role>('/role', body)

/** 删除角色 */
export const deleteRole = (id: number) => http.delete<null>(`/role/${id}`)

/** 查询角色已分配的权限码集合 */
export const getRolePermissions = (id: number) =>
  http.get<string[]>(`/role/${id}/permissions`)

/** 保存角色权限分配 */
export const saveRolePermissions = (id: number, permissions: string[]) =>
  http.put<null>(`/role/${id}/permissions`, { permissions })
