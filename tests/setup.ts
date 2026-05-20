/**
 * Vitest 全局 setup
 *
 * - 每个测试文件运行前清理 localStorage/sessionStorage，避免互相污染
 * - 全局禁用 console.warn 噪声（仅在断言失败时影响输出）
 */
import { afterEach, beforeEach } from 'vitest'

beforeEach(() => {
  try {
    window.localStorage.clear()
    window.sessionStorage.clear()
  } catch {
    /* jsdom 环境 */
  }
})

afterEach(() => {
  /* noop */
})
