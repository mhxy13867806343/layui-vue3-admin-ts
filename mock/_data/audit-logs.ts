/**
 * 操作日志 Mock 数据
 *
 * 50+ 条审计日志记录，覆盖登录/登出/CRUD/导出/上传等操作。
 */

export type AuditOpType = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'upload'
export type AuditStatus = 'success' | 'fail'

export interface AuditLog {
  id: number
  userId: number
  username: string
  avatarColor: string
  opType: AuditOpType
  description: string
  ip: string
  browser: string
  os: string
  userAgent: string
  status: AuditStatus
  duration: number
  payload: string
  response: string
  location: string
  createdAt: string
}

const USERS = [
  { id: 1, username: 'admin', color: '#16baaa' },
  { id: 2, username: 'user', color: '#1e9fff' },
  { id: 3, username: 'john', color: '#ff5722' },
  { id: 4, username: 'alice', color: '#a855f7' },
  { id: 5, username: 'bob', color: '#f59e0b' },
  { id: 6, username: 'tester', color: '#ec4899' },
]

const BROWSERS = ['Chrome 120', 'Edge 120', 'Firefox 121', 'Safari 17', 'Chrome 119']
const OS_LIST = ['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04', 'iOS 17', 'Android 14']
const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

const LOCATIONS = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '西安']

function randomIp(): string {
  const prefix = ['192.168', '10.0', '172.16', '203.0', '198.51']
  const p = prefix[Math.floor(Math.random() * prefix.length)]
  return `${p}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

function randomTime(daysBack: number): string {
  const now = Date.now()
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000)
  const d = new Date(now - offset)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

const OP_DEFS: { type: AuditOpType; descs: string[] }[] = [
  { type: 'login', descs: ['用户登录系统', '账号密码登录', '扫码登录'] },
  { type: 'logout', descs: ['用户主动登出', 'Token 过期登出'] },
  { type: 'create', descs: ['新增用户', '新增角色', '新增菜单', '新增字典项', '新增版本'] },
  { type: 'update', descs: ['更新用户信息', '修改角色权限', '编辑菜单', '更新系统设置'] },
  { type: 'delete', descs: ['删除用户', '删除角色', '删除菜单', '删除字典项'] },
  { type: 'export', descs: ['导出用户列表', '导出操作日志', '导出 Excel 报表'] },
  { type: 'upload', descs: ['上传文件', '上传头像', '导入 Excel'] },
]

function generate(count: number): AuditLog[] {
  const logs: AuditLog[] = []
  for (let i = 0; i < count; i++) {
    const user = USERS[Math.floor(Math.random() * USERS.length)]
    const opDef = OP_DEFS[Math.floor(Math.random() * OP_DEFS.length)]
    const desc = opDef.descs[Math.floor(Math.random() * opDef.descs.length)]
    const success = Math.random() > 0.15
    const ua = UA_LIST[Math.floor(Math.random() * UA_LIST.length)]
    logs.push({
      id: i + 1,
      userId: user.id,
      username: user.username,
      avatarColor: user.color,
      opType: opDef.type,
      description: desc,
      ip: randomIp(),
      browser: BROWSERS[Math.floor(Math.random() * BROWSERS.length)],
      os: OS_LIST[Math.floor(Math.random() * OS_LIST.length)],
      userAgent: ua,
      status: success ? 'success' : 'fail',
      duration: Math.floor(Math.random() * 500) + 20,
      payload: JSON.stringify({ id: Math.floor(Math.random() * 100), name: 'sample' }),
      response: success
        ? JSON.stringify({ code: 0, message: 'ok' })
        : JSON.stringify({ code: 500, message: '服务器内部错误' }),
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      createdAt: randomTime(7),
    })
  }
  // sort by createdAt desc
  return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const auditLogs: AuditLog[] = generate(80)

let auditLogIdSeq = auditLogs.length + 1
export const nextAuditLogId = (): number => auditLogIdSeq++

export function clearAuditLogs(): void {
  auditLogs.length = 0
}
