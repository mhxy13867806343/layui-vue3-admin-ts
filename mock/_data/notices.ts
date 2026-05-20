/**
 * 通知静态数据
 *
 * type 三类：message（消息）/ announcement（公告）/ todo（待办）
 * 每类预置 5–6 条；运行期支持 markRead / markAllRead，写回内存。
 */

export type NoticeType = 'message' | 'announcement' | 'todo'

export interface NoticeItem {
  id: number
  type: NoticeType
  title: string
  content: string
  createdAt: string
  read: boolean
}

let _seq = 1
const make = (type: NoticeType, title: string, content: string): NoticeItem => ({
  id: _seq++,
  type,
  title,
  content,
  createdAt: '2024-12-01 09:00:00',
  read: false,
})

export const notices: NoticeItem[] = [
  // ===== 消息 =====
  make('message', '系统欢迎', '欢迎使用 layui-vue Admin！'),
  make('message', '密码到期提醒', '您的密码将在 7 天后到期，请及时修改'),
  make('message', '登录异常', '检测到您于 2024-12-01 在新设备登录'),
  make('message', '通知接收设置', '您有 3 项通知未启用推送'),
  make('message', '版本更新', '系统已升级到 v0.1.0'),
  // ===== 公告 =====
  make('announcement', '发布说明', '12 月 1 日 0:00 进行系统升级，预计 30 分钟'),
  make('announcement', '安全公告', '请勿在非内网环境使用管理员账号'),
  make('announcement', '数据备份', '每周日凌晨自动备份业务数据'),
  make('announcement', '权限调整', '财务模块新增数据脱敏'),
  make('announcement', '功能下线', '旧版报表中心将于 12 月 31 日下线'),
  // ===== 待办 =====
  make('todo', '审批用户申请', '有 3 条新的用户开通申请等待审批'),
  make('todo', '本月报表导出', '请在月底前导出运营月报'),
  make('todo', '权限审计', '请完成本季度的权限审计'),
  make('todo', '完善个人资料', '您尚未完善手机与邮箱'),
  make('todo', '观看新功能介绍', '快速了解 v0.1 版本的新特性'),
]
