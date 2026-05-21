/**
 * Mock：系统设置模块
 *
 * 接口列表：
 * - GET  /api/settings              获取所有设置
 * - PUT  /api/settings              一次性保存所有分组（payload: SystemSettings）
 * - PUT  /api/settings/basic        保存基本设置
 * - PUT  /api/settings/security     保存安全设置
 * - PUT  /api/settings/notification 保存通知设置
 * - PUT  /api/settings/storage      保存存储设置
 */
import { guard, ok, parseBody, type MockMethod } from './_utils'
import {
  settings,
  type BasicSettings,
  type NotificationSettings,
  type SecuritySettings,
  type StorageSettings,
  type SystemSettings,
} from './_data/settings'

const settingsMocks: MockMethod[] = [
  // ===== 获取所有设置 =====
  {
    url: '/api/settings',
    method: 'get',
    response: guard((): unknown => {
      return ok(settings)
    }),
  },

  // ===== 整体保存 =====
  {
    url: '/api/settings',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<Partial<SystemSettings>>(req)
      if (body.basic) Object.assign(settings.basic, body.basic)
      if (body.security) Object.assign(settings.security, body.security)
      if (body.notification) Object.assign(settings.notification, body.notification)
      if (body.storage) Object.assign(settings.storage, body.storage)
      return ok(settings, '保存成功')
    }),
  },

  // ===== 保存基本设置 =====
  {
    url: '/api/settings/basic',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<BasicSettings>(req)
      Object.assign(settings.basic, body)
      return ok(settings.basic, '保存成功')
    }),
  },

  // ===== 保存安全设置 =====
  {
    url: '/api/settings/security',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<SecuritySettings>(req)
      Object.assign(settings.security, body)
      return ok(settings.security, '保存成功')
    }),
  },

  // ===== 保存通知设置 =====
  {
    url: '/api/settings/notification',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<NotificationSettings>(req)
      Object.assign(settings.notification, body)
      return ok(settings.notification, '保存成功')
    }),
  },

  // ===== 保存存储设置 =====
  {
    url: '/api/settings/storage',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<StorageSettings>(req)
      Object.assign(settings.storage, body)
      return ok(settings.storage, '保存成功')
    }),
  },
]

export default settingsMocks
