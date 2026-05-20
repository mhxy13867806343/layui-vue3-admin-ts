import { createI18n } from 'vue-i18n'
import { storage } from '@/utils/storage'
import zhCN from './zh-CN'
import enUS from './en-US'

export type LocaleCode = 'zh-CN' | 'en-US'

export const SUPPORTED_LOCALES: { value: LocaleCode; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
]

function detectInitialLocale(): LocaleCode {
  const saved = storage.get<LocaleCode>('locale')
  if (saved && SUPPORTED_LOCALES.some((l) => l.value === saved)) return saved
  const nav = (typeof navigator !== 'undefined' && navigator.language) || ''
  return nav.startsWith('en') ? 'en-US' : 'zh-CN'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export function setLocale(code: LocaleCode): void {
  // composition mode 下需要把 ref 直接 set
  ;(i18n.global.locale as unknown as { value: LocaleCode }).value = code
  storage.set('locale', code)
  document.documentElement.lang = code
}

/**
 * 项目级 t helper：在 setup 中调用获得「带 reactivity 的 t」与 locale。
 *
 * 实现细节：
 *   - 直接用 `i18n.global.locale` 作为 reactive ref（composition 模式下它已经是 ref）
 *   - t 包装一层 `i18n.global.t`，并在 wrapper 里读一次 locale.value 触发 reactivity
 *   - 这种写法不依赖 useI18n 的 useScope 行为，避开了 9.x 早期 useScope 的微妙差异
 */
export function useT() {
  const locale = i18n.global.locale as unknown as { value: LocaleCode }
  const t = (key: string, params?: Record<string, unknown>): string => {
    // 触发 reactivity tracking：访问 locale.value
    void locale.value
    return params
      ? (i18n.global.t as (k: string, p: Record<string, unknown>) => string)(key, params)
      : i18n.global.t(key)
  }
  return { t, locale }
}

/**
 * 渲染辅助：若 raw 以 'i18n:' 起始则查表，否则原样返回。
 * 注：返回普通字符串，不带 reactivity；因此**仅适合在非模板的命令式逻辑里使用**
 *     （例如 mock/router 的 title 计算）。模板内请使用 `useT()` 获取 t。
 */
export function t(raw: string): string {
  if (!raw) return raw
  if (raw.startsWith('i18n:')) {
    const key = raw.slice('i18n:'.length)
    return i18n.global.t(key)
  }
  return raw
}
