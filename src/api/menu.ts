/**
 * 菜单管理 API
 */
import { http } from '@/utils/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { Menu, MenuType } from '@/types/domain'

/** 菜单分页查询参数 */
export interface MenuPageParams extends PageQuery {
  name?: string
}

/** 菜单创建请求体 */
export interface MenuCreateRequest {
  parentId: number | null
  name: string
  icon?: string
  type: MenuType
  path?: string
  component?: string
  permission?: string
  sort?: number
  visible?: boolean
}

/** 菜单更新请求体 */
export interface MenuUpdateRequest extends MenuCreateRequest {
  id: number
}

/** 获取菜单树（含 children） */
export const getMenuTree = () => http.get<Menu[]>('/menu/tree')

/** 分页查询菜单（扁平） */
export const getMenuPage = (params: MenuPageParams) =>
  http.get<PageResult<Menu>>('/menu/page', { params })

/** 新建菜单 */
export const createMenu = (body: MenuCreateRequest) => http.post<Menu>('/menu', body)

/** 更新菜单 */
export const updateMenu = (body: MenuUpdateRequest) => http.put<Menu>('/menu', body)

/** 删除菜单（存在子节点时由服务端拒绝） */
export const deleteMenu = (id: number) => http.delete<null>(`/menu/${id}`)
