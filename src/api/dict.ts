/**
 * 字典 API
 *
 * - 启用 GET 缓存（tags=['dict']），避免重复拉取
 * - cacheInvalidate(['dict']) 可一次性清除全部字典缓存
 */
import { http, type RequestConfig } from '@/utils/http'

export interface DictItem {
  label: string
  value: string | number
  color?: 'red' | 'green' | 'blue' | 'orange' | 'gray'
}

const cacheCfg: RequestConfig = {
  cache: { ttl: 5 * 60 * 1000, tags: ['dict'] },
}

export const getDict = (code: string) =>
  http.get<DictItem[]>(`/dict/${code}`, cacheCfg)

export const getDictBatch = (codes: string[]) =>
  http.get<Record<string, DictItem[]>>('/dict/batch', {
    ...cacheCfg,
    params: { codes: codes.join(',') },
  })
