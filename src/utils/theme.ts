/**
 * 主题与主色工具
 *
 * 主题切换基于「CSS 变量 + body 类名」双轨：
 * - 暗黑/明亮：通过 `<html>` 的 `class="dark"` 与 `data-theme` 属性
 * - 主色：写入 layui-vue 的主色 CSS 变量（--global-primary-color / --global-checked-color）
 */

export const THEME_LIGHT = 'light'
export const THEME_DARK = 'dark'

export type ThemeMode = typeof THEME_LIGHT | typeof THEME_DARK

/** 默认主色 */
export const DEFAULT_PRIMARY = '#16baaa'

/** 预设色板 */
export const PRESET_PRIMARIES: readonly string[] = [
  '#16baaa',
  '#1e9fff',
  '#ff5722',
  '#ffb800',
  '#5fb878',
]

/** 切换暗黑/明亮主题：写 html.class 与 data-theme */
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement
  root.classList.toggle('dark', mode === THEME_DARK)
  root.dataset.theme = mode
}

/** 设置主色：同时写入 layui-vue 主色派生变量 */
export function applyPrimaryColor(hex: string): void {
  const root = document.documentElement
  root.style.setProperty('--global-primary-color', hex)
  root.style.setProperty('--global-checked-color', hex)
}
