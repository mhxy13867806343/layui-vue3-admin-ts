/**
 * 字典管理 API
 */
import { http } from '@/utils/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { DictItem, DictType } from '../../mock/_data/dicts-manage'

export type { DictItem, DictType }

/** 字典类型分页查询参数 */
export interface DictTypePageParams extends PageQuery {
  name?: string
  code?: string
}

/** 分页查询字典类型 */
export const getDictTypePage = (params: DictTypePageParams) =>
  http.get<PageResult<DictType>>('/dict-type/page', { params })

/** 新增字典类型 */
export const createDictType = (data: Partial<DictType>) =>
  http.post<DictType>('/dict-type', data)

/** 更新字典类型 */
export const updateDictType = (data: Partial<DictType>) =>
  http.put<DictType>('/dict-type', data)

/** 删除字典类型 */
export const deleteDictType = (id: number) =>
  http.delete<null>(`/dict-type/${id}`)

/** 获取字典项列表 */
export const getDictItemList = (dictTypeId: number) =>
  http.get<DictItem[]>('/dict-item/list', { params: { dictTypeId } })

/** 新增字典项 */
export const createDictItem = (data: Partial<DictItem>) =>
  http.post<DictItem>('/dict-item', data)

/** 更新字典项 */
export const updateDictItem = (data: Partial<DictItem>) =>
  http.put<DictItem>('/dict-item', data)

/** 删除字典项 */
export const deleteDictItem = (id: number) =>
  http.delete<null>(`/dict-item/${id}`)
