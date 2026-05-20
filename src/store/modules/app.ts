import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { applyPrimaryColor, applyTheme, DEFAULT_PRIMARY, type ThemeMode } from '@/utils/theme'
import type { TabItem } from '@/types/domain'

/** 布局模式 */
export type LayoutMode = 'side' | 'top' | 'mix'

/** 视觉模式 */
export type VisualMode = 'normal' | 'weak' | 'gray'

export interface WatermarkConfig {
  enabled: boolean
  text: string
}

export interface AppState {
  theme: ThemeMode
  primary: string
  sidebarCollapsed: boolean
  tabs: TabItem[]
  activeTab: string
  layoutMode: LayoutMode
  visualMode: VisualMode
  watermark: WatermarkConfig
  /** 仅运行期：锁屏状态 */
  locked: boolean
}

export function isCloseVisible(tabs: TabItem[]): boolean {
  return tabs.length > 1
}

export function closeTabReducer(
  tabs: TabItem[],
  activePath: string,
  closingPath: string,
): { tabs: TabItem[]; activePath: string } {
  if (tabs.length <= 1) {
    return { tabs: [...tabs], activePath }
  }
  const idx = tabs.findIndex((t) => t.fullPath === closingPath)
  if (idx < 0) return { tabs: [...tabs], activePath }
  const nextTabs = tabs.filter((t) => t.fullPath !== closingPath)
  if (closingPath !== activePath) {
    return { tabs: nextTabs, activePath }
  }
  // 关闭的是激活标签：右邻居优先，否则左邻居
  const right = tabs[idx + 1]
  const left = tabs[idx - 1]
  const nextActive = right ? right.fullPath : left ? left.fullPath : nextTabs[0]?.fullPath ?? ''
  return { tabs: nextTabs, activePath: nextActive }
}

/** 应用视觉模式：切换 <html> 类名 */
function applyVisual(mode: VisualMode): void {
  const root = document.documentElement
  root.classList.remove('visual-weak', 'visual-gray')
  if (mode === 'weak') root.classList.add('visual-weak')
  else if (mode === 'gray') root.classList.add('visual-gray')
}

const DEFAULT_WATERMARK: WatermarkConfig = { enabled: false, text: 'layui-vue Admin' }

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: (storage.get<ThemeMode>('app_theme') as ThemeMode) ?? 'light',
    primary: storage.get<string>('app_primary') ?? DEFAULT_PRIMARY,
    sidebarCollapsed: storage.get<boolean>('app_sidebar_collapsed') ?? false,
    tabs: [],
    activeTab: '',
    layoutMode: storage.get<LayoutMode>('app_layout') ?? 'side',
    visualMode: storage.get<VisualMode>('app_visual') ?? 'normal',
    watermark: storage.get<WatermarkConfig>('app_watermark') ?? { ...DEFAULT_WATERMARK },
    locked: false,
  }),
  actions: {
    setTheme(t: ThemeMode) {
      this.theme = t
      applyTheme(t)
      storage.set('app_theme', t)
    },
    setPrimary(c: string) {
      this.primary = c
      applyPrimaryColor(c)
      storage.set('app_primary', c)
    },
    setSidebarCollapsed(v: boolean) {
      this.sidebarCollapsed = v
      storage.set('app_sidebar_collapsed', v)
    },
    setTabs(tabs: TabItem[]) {
      this.tabs = tabs
    },
    setActiveTab(p: string) {
      this.activeTab = p
    },
    addTab(tab: TabItem) {
      if (this.tabs.find((t) => t.fullPath === tab.fullPath)) {
        this.activeTab = tab.fullPath
        return
      }
      this.tabs.push(tab)
      this.activeTab = tab.fullPath
    },
    closeTab(fullPath: string): { activePath: string } {
      const next = closeTabReducer(this.tabs, this.activeTab, fullPath)
      this.tabs = next.tabs
      this.activeTab = next.activePath
      return { activePath: next.activePath }
    },
    setLayoutMode(m: LayoutMode) {
      this.layoutMode = m
      storage.set('app_layout', m)
    },
    setVisualMode(m: VisualMode) {
      this.visualMode = m
      applyVisual(m)
      storage.set('app_visual', m)
    },
    setWatermark(cfg: Partial<WatermarkConfig>) {
      this.watermark = { ...this.watermark, ...cfg }
      storage.set('app_watermark', this.watermark)
    },
    lock() {
      this.locked = true
    },
    /** 解锁：与 sessionStorage 中暂存的密码比对（mock 容错：空时直接放行） */
    unlock(input: string): boolean {
      const expected = sessionStorage.getItem('lva_lock_pw') ?? ''
      if (expected.length === 0) {
        // 未配置（可能因刷新页面丢失）：在 mock 阶段允许任意非空字符串
        if (input.length > 0) {
          this.locked = false
          return true
        }
        return false
      }
      if (input === expected) {
        this.locked = false
        return true
      }
      return false
    },
  },
})

/** 启动时同步 visual 类名（main.ts 调用） */
export function syncInitialVisual(): void {
  const stored = (storage.get<VisualMode>('app_visual') ?? 'normal') as VisualMode
  applyVisual(stored)
}
