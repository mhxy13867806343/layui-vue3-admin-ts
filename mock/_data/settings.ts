/**
 * 系统设置 Mock 数据
 *
 * 4 个分组：基本设置 / 安全设置 / 通知设置 / 存储设置
 */

export interface BasicSettings {
  systemName: string
  systemLogo: string
  copyright: string
  icp: string
  contactEmail: string
}

export interface SecuritySettings {
  passwordMinLength: number
  loginFailLockCount: number
  lockDuration: number
  /** Token 过期时间（分钟） */
  sessionTimeout: number
  enableCaptcha: boolean
}

export interface NotificationSettings {
  smtpHost: string
  smtpPort: number
  senderEmail: string
  senderPassword: string
  enableSSL: boolean
  /** 是否启用邮件通知 */
  enableEmail: boolean
}

export type StorageType = 'local' | 'aliyun-oss' | 'tencent-cos'

export interface StorageSettings {
  type: StorageType
  bucket: string
  region: string
  /** 上传大小限制（MB） */
  uploadSizeLimit: number
}

export interface SystemSettings {
  basic: BasicSettings
  security: SecuritySettings
  notification: NotificationSettings
  storage: StorageSettings
}

export const settings: SystemSettings = {
  basic: {
    systemName: 'Layui Vue3 Admin',
    systemLogo: 'https://example.com/logo.png',
    copyright: 'Copyright © 2024 Layui Vue3 Admin',
    icp: '京ICP备12345678号',
    contactEmail: 'admin@example.com',
  },
  security: {
    passwordMinLength: 6,
    loginFailLockCount: 5,
    lockDuration: 30,
    sessionTimeout: 120,
    enableCaptcha: true,
  },
  notification: {
    smtpHost: 'smtp.example.com',
    smtpPort: 465,
    senderEmail: 'noreply@example.com',
    senderPassword: '',
    enableSSL: true,
    enableEmail: false,
  },
  storage: {
    type: 'local',
    bucket: '',
    region: '',
    uploadSizeLimit: 10,
  },
}
