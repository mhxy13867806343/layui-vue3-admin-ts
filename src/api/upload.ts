/**
 * 文件上传 API
 *
 * 后端约定：multipart/form-data，字段名 `file`；返回 { url, name, size }
 */
import { http, type RequestConfig } from '@/utils/http'

export interface UploadResp {
  url: string
  name: string
  size: number
}

export interface UploadOptions {
  onProgress?: (percent: number) => void
}

export function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResp> {
  const form = new FormData()
  form.append('file', file)
  const cfg: RequestConfig = {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const total = e.total ?? 0
      const loaded = e.loaded ?? 0
      const percent = total > 0 ? Math.floor((loaded / total) * 100) : 0
      options.onProgress?.(percent)
    },
  }
  return http.post<UploadResp>('/upload', form, cfg)
}
