/**
 * 操作日志 API
 */
import { http } from '@/utils/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { AuditLog, AuditOpType, AuditStatus } from '../../mock/_data/audit-logs'

export type { AuditLog, AuditOpType, AuditStatus }

export interface AuditLogPageParams extends PageQuery {
  username?: string
  opType?: string
  status?: string
  startDate?: string
  endDate?: string
}

export const getAuditLogPage = (params: AuditLogPageParams) =>
  http.get<PageResult<AuditLog>>('/audit-log/page', { params })

export const getAuditLogDetail = (id: number) => http.get<AuditLog>(`/audit-log/${id}`)

export const clearAuditLogs = () => http.delete<null>('/audit-log/clear')
