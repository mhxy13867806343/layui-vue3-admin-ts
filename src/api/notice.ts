/**
 * 通知中心 API
 */
import { http } from '@/utils/http'
import type { PageResult } from '@/types/api'

export type NoticeType = 'message' | 'announcement' | 'todo'

export interface NoticeItem {
  id: number
  type: NoticeType
  title: string
  content: string
  createdAt: string
  read: boolean
}

export interface UnreadCount {
  message: number
  announcement: number
  todo: number
  total: number
}

export const getNoticeList = (params: { type?: NoticeType; page: number; pageSize: number }) =>
  http.get<PageResult<NoticeItem>>('/notice/list', { params })

export const markNoticeRead = (id: number) =>
  http.put<null>(`/notice/${id}/read`)

export const markAllNoticeRead = (type?: NoticeType) =>
  http.put<{ count: number }>('/notice/read-all', undefined, {
    params: type ? { type } : undefined,
  })

export const getUnreadCount = () =>
  http.get<UnreadCount>('/notice/unread-count')
