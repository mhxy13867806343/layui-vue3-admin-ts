/**
 * 认证相关 API
 *
 * baseURL = `/api`（见 vite env），因此调用时 url 不带 `/api` 前缀。
 */
import { http } from '@/utils/http'
import type {
  LoginRequest,
  LoginResponse,
  User,
  UserMenusResponse,
} from '@/types/domain'

/** 登录：用户名 + 密码，返回 token + refreshToken + 用户信息 */
export const login = (payload: LoginRequest) =>
  http.post<LoginResponse>('/auth/login', payload)

/** 刷新 token：使用 refreshToken 换取新的 token + refreshToken */
export const refresh = (refreshToken: string) =>
  http.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken })

/** 登出：服务端撤销 token（mock 仅返回成功） */
export const logout = () => http.post<null>('/auth/logout')

/** 获取当前登录用户信息 */
export const getUserInfo = () => http.get<User>('/auth/userInfo')

/** 获取当前用户的菜单 / 权限码 / 角色码 */
export const getUserMenus = () => http.get<UserMenusResponse>('/auth/menus')

/** 注册请求体 */
export interface RegisterRequest {
  username: string
  nickname: string
  password: string
}

/** 注册：成功后返回与登录同结构（用于注册后自动登录） */
export const register = (payload: RegisterRequest) =>
  http.post<LoginResponse>('/auth/register', payload)
