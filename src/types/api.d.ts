export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface PageQuery {
  page: number
  pageSize: number
  keyword?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
