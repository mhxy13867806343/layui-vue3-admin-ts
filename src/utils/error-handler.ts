/**
 * 全局错误归一化
 *
 * - 通过 app.config.errorHandler 捕获 Vue 组件内异常
 * - 通过 window unhandledrejection 监听未捕获的 Promise reject
 * - DEV 下打印控制台细节，生产环境只弹 layer.msg 友好提示
 */
import type { App } from 'vue'
import { layer } from '@layui/layui-vue'

export function setupErrorHandler(app: App): void {
  app.config.errorHandler = (err, _instance, info) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[GlobalError]', info, err)
    }
    layer.msg('页面发生异常，请刷新重试', { icon: 2 })
  }

  window.addEventListener('unhandledrejection', (e) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[UnhandledRejection]', e.reason)
    }
  })
}
