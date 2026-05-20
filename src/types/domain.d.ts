export type Status = 0 | 1 // 0 禁用，1 启用

export interface User {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  status: Status
  roleCodes: string[] // 角色编码集合（外键到 Role.code）
  createdAt: string
  updatedAt?: string
}

export interface UserCreateRequest {
  username: string
  nickname: string
  password: string
  roleCodes: string[]
  status: Status
}

export interface UserUpdateRequest extends Omit<UserCreateRequest, 'password'> {
  id: number
}

export interface Role {
  id: number
  code: string // 唯一
  name: string
  description?: string
  status: Status
  createdAt: string
}

export interface Permission {
  code: string // 例如 user:create
  name: string
  type: 'menu' | 'button' | 'api'
}

export type MenuType = 'directory' | 'menu' | 'button' | 'group'

export interface Menu {
  id: number
  parentId: number | null
  name: string
  icon?: string
  type: MenuType
  path?: string // type=directory|menu 时必填
  component?: string // type=menu 时必填
  permission?: string // type=button 时必填
  sort: number
  visible: boolean
  children?: Menu[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

export interface UserMenusResponse {
  menus: Menu[]
  permissions: string[]
  roles: string[]
}

export interface TabItem {
  fullPath: string
  title: string
  closable: boolean
}
