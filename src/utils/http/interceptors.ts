/**
 * Axios 实例级拦截器
 *
 * 仅安装与 axios pipeline 自然契合的两个：注入 Authorization、错误透传。
 * 业务侧的缓存 / 去重 / 重试 / 取消 / 进度 / refresh 由 index.ts 高层包装实现，
 * 这样可以做到「缓存命中即短路」「单飞 Promise 复用」。
 */
import { instance } from './core'

instance.interceptors.request.use(async (config) => {
  // 动态 import 避免与 store 形成循环依赖
  const { useUserStore } = await import('@/store/modules/user')
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${userStore.token}`
  }
  return config
})

instance.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
)

export {}
