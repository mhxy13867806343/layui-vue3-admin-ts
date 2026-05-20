/**
 * 认证页布局模板（登录 / 注册共享）
 *
 * - 5 套互不相同的视觉版式
 * - 切换：右上角 `<lay-select>`
 * - 持久化：`lva_auth_login_template` / `lva_auth_register_template`
 * - 768px 以下双栏模板（split-left / split-right）在渲染层降级为 centered-card，
 *   不修改持久化值，避免大屏切回时丢失用户选择
 */
export type AuthTemplateKey =
  | 'centered-card'
  | 'split-left-illustration'
  | 'split-right-illustration'
  | 'fullscreen-bg'
  | 'top-banner'

export interface AuthTemplateOption {
  label: string
  value: AuthTemplateKey
  desc?: string
}

export const AUTH_TEMPLATE_OPTIONS: AuthTemplateOption[] = [
  { label: '居中卡片', value: 'centered-card', desc: '屏幕居中的单卡片 + 渐变背景' },
  { label: '左插画 / 右表单', value: 'split-left-illustration', desc: '左半屏插画区，右半屏表单' },
  { label: '右插画 / 左表单', value: 'split-right-illustration', desc: '左半屏表单，右半屏插画区' },
  { label: '整屏背景图', value: 'fullscreen-bg', desc: '整屏背景图 + 浮层透明卡片' },
  { label: '顶部 Banner', value: 'top-banner', desc: '顶部 Banner 区 + 下方居中表单' },
]

export const DEFAULT_AUTH_TEMPLATE: AuthTemplateKey = 'centered-card'

/** 双栏模板集合：用于小屏降级判断 */
export const SPLIT_TEMPLATES: ReadonlySet<AuthTemplateKey> = new Set<AuthTemplateKey>([
  'split-left-illustration',
  'split-right-illustration',
])

/** Storage key 类型 */
export type AuthTemplateStorageKey =
  | 'auth_login_template'
  | 'auth_register_template'
