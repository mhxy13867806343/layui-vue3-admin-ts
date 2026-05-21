/**
 * 密钥管理 API
 */
import { http } from '@/utils/http'
import type { ApiKey, ApiKeyService } from '../../mock/_data/keys'

export type { ApiKey, ApiKeyService }

/** 获取所有第三方服务密钥 */
export const getKeys = () => http.get<ApiKeyService[]>('/keys')

/** 批量保存密钥 */
export const saveKeys = (keys: ApiKeyService[]) =>
  http.put<ApiKeyService[]>('/keys', { keys })
