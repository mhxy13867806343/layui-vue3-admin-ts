/**
 * Storage Service
 *
 * 统一封装 localStorage / sessionStorage：
 * - 所有 key 自动加 `lva_` 前缀，避免污染同域其他应用
 * - get 失败时静默返回 null（绝不抛出），DEV 下输出 warn
 * - clear 仅清除 `lva_` 前缀的 key
 */

export type Driver = 'local' | 'session'

const PREFIX = 'lva_'

/** 暴露给测试与外部代码使用的前缀常量（与内部 PREFIX 同值） */
export const STORAGE_PREFIX = PREFIX

const drivers: Record<Driver, Storage> = {
  local: window.localStorage,
  session: window.sessionStorage,
}

const k = (key: string): string => `${PREFIX}${key}`

function get<T>(key: string, driver: Driver = 'local'): T | null {
  const raw = drivers[driver].getItem(k(key))
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch (e) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[storage] parse error', key, e)
    }
    return null
  }
}

function set<T>(key: string, value: T, driver: Driver = 'local'): void {
  drivers[driver].setItem(k(key), JSON.stringify(value))
}

function remove(key: string, driver: Driver = 'local'): void {
  drivers[driver].removeItem(k(key))
}

function clear(driver: Driver = 'local'): void {
  const s = drivers[driver]
  const keys: string[] = []
  for (let i = 0; i < s.length; i++) {
    const k0 = s.key(i)
    if (k0 && k0.startsWith(PREFIX)) keys.push(k0)
  }
  keys.forEach((k0) => s.removeItem(k0))
}

export const storage = { get, set, remove, clear }

export default storage
