import type { App } from 'vue'
import { permission } from './permission'

/**
 * 全局指令安装入口
 *
 * 在 main.ts 中调用：
 *   import { setupDirectives } from '@/directives'
 *   setupDirectives(app)
 *
 * 注：本次（Task 8.1）仅实现指令本体；main.ts 注册留到 Wave 7 与路由一起接入。
 */
export function setupDirectives(app: App): void {
  app.directive('permission', permission)
}

export { permission }
