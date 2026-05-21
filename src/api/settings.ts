/**
 * 系统设置 API
 */
import { http } from '@/utils/http'
import type {
  BasicSettings,
  NotificationSettings,
  SecuritySettings,
  StorageSettings,
  StorageType,
  SystemSettings,
} from '../../mock/_data/settings'

export type {
  BasicSettings,
  NotificationSettings,
  SecuritySettings,
  StorageSettings,
  StorageType,
  SystemSettings,
}

/** 获取所有设置 */
export const getSettings = () => http.get<SystemSettings>('/settings')

/** 保存基本设置 */
export const saveBasicSettings = (data: BasicSettings) =>
  http.put<BasicSettings>('/settings/basic', data)

/** 保存安全设置 */
export const saveSecuritySettings = (data: SecuritySettings) =>
  http.put<SecuritySettings>('/settings/security', data)

/** 保存通知设置 */
export const saveNotificationSettings = (data: NotificationSettings) =>
  http.put<NotificationSettings>('/settings/notification', data)

/** 保存存储设置 */
export const saveStorageSettings = (data: StorageSettings) =>
  http.put<StorageSettings>('/settings/storage', data)
