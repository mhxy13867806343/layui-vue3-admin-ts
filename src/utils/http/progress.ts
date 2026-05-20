/**
 * 全局进度条
 *
 * - 非 silent 请求开始时计数++，结束时计数--
 * - 计数为 0 时关闭进度条
 */
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.1 })

let pending = 0

export function progressStart(): void {
  pending++
  NProgress.start()
}

export function progressDone(): void {
  pending = Math.max(0, pending - 1)
  if (pending === 0) NProgress.done()
}

export function progressForceDone(): void {
  pending = 0
  NProgress.done()
}
