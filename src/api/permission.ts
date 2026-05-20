/**
 * 权限元数据 API
 *
 * 提供权限码全集，供「角色分配权限」等界面渲染权限树使用。
 */
import { http, type RequestConfig } from '@/utils/http'
import type { Permission } from '@/types/domain'

const cacheCfg: RequestConfig = {
  cache: { ttl: 5 * 60 * 1000, tags: ['permission'] },
}

export const getAllPermissions = () =>
  http.get<Permission[]>('/permission/list', cacheCfg)
