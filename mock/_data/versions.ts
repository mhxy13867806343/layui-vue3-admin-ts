/**
 * 版本管理 Mock 数据
 */

export type VersionType = 'major' | 'minor' | 'patch'
export type VersionStatus = 'published' | 'draft' | 'deprecated'

export interface Version {
  id: number
  /** 版本号 e.g. v1.2.0 */
  version: string
  /** 版本类型：主版本 / 次版本 / 补丁 */
  type: VersionType
  /** 更新摘要（一句话） */
  summary: string
  /** 详细更新内容（多行） */
  content: string
  /** 发布日期 YYYY-MM-DD */
  publishDate: string
  /** 状态 */
  status: VersionStatus
  /** 是否强制更新 */
  forceUpdate: boolean
  /** 下载链接 */
  downloadUrl: string
  /** 创建时间 */
  createdAt: string
}

let versionIdSeq = 6
export const nextVersionId = (): number => versionIdSeq++

export const versions: Version[] = [
  {
    id: 1,
    version: 'v1.0.0',
    type: 'major',
    summary: '首个正式版本发布',
    content: '1. 项目初始化\n2. 基础框架搭建\n3. 用户登录功能',
    publishDate: '2024-01-01',
    status: 'published',
    forceUpdate: false,
    downloadUrl: 'https://example.com/v1.0.0',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    version: 'v1.1.0',
    type: 'minor',
    summary: '新增角色与菜单管理功能',
    content: '1. 新增角色管理\n2. 新增菜单管理\n3. 修复登录超时问题',
    publishDate: '2024-02-15',
    status: 'published',
    forceUpdate: false,
    downloadUrl: 'https://example.com/v1.1.0',
    createdAt: '2024-02-15 10:00:00',
  },
  {
    id: 3,
    version: 'v1.2.0',
    type: 'minor',
    summary: '新增字典管理与系统设置',
    content: '1. 新增字典管理\n2. 新增系统设置\n3. 优化表格性能',
    publishDate: '2024-03-20',
    status: 'published',
    forceUpdate: true,
    downloadUrl: 'https://example.com/v1.2.0',
    createdAt: '2024-03-20 10:00:00',
  },
  {
    id: 4,
    version: 'v1.2.1',
    type: 'patch',
    summary: '修复若干已知问题',
    content: '1. 修复权限校验问题\n2. 优化页面加载速度',
    publishDate: '2024-04-10',
    status: 'draft',
    forceUpdate: false,
    downloadUrl: '',
    createdAt: '2024-04-10 10:00:00',
  },
]
