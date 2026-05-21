/**
 * 版本管理 API
 */
import { http } from '@/utils/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { Version, VersionStatus, VersionType } from '../../mock/_data/versions'

export type { Version, VersionStatus, VersionType }

/** 版本分页查询参数 */
export interface VersionPageParams extends PageQuery {
  version?: string
  status?: string
  type?: string
}

/** 分页查询版本 */
export const getVersionPage = (params: VersionPageParams) =>
  http.get<PageResult<Version>>('/version/page', { params })

/** 新增版本 */
export const createVersion = (data: Partial<Version>) =>
  http.post<Version>('/version', data)

/** 更新版本 */
export const updateVersion = (data: Partial<Version>) =>
  http.put<Version>('/version', data)

/** 删除版本 */
export const deleteVersion = (id: number) =>
  http.delete<null>(`/version/${id}`)

/** 发布草稿版本 */
export const publishVersion = (id: number) =>
  http.post<Version>(`/version/${id}/publish`, {})
