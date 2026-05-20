/**
 * HTTP 核心 axios 实例
 *
 * 仅创建实例与导出常量，不安装任何拦截器；拦截器由 interceptors.ts 装配。
 */
import axios, { type AxiosInstance } from 'axios'

export const BASE_RETRY_DELAY = 300
export const MAX_RETRY_DELAY = 3000
export const DEFAULT_TIMEOUT = 15000

export const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
})
