/**
 * useDownload —— Blob → a 链接下载
 *
 * 用法：
 *   const { downloadBlob, downloadUrl } = useDownload()
 *   downloadBlob(blob, 'user.xlsx')
 *   await downloadUrl('/api/files/abc', 'abc.zip')
 */
import { ref } from 'vue'
import { instance } from '@/utils/http'

interface DownloadProgress {
  loaded: number
  total: number
  percent: number
}

export interface UseDownloadReturn {
  loading: ReturnType<typeof ref<boolean>>
  progress: ReturnType<typeof ref<DownloadProgress>>
  downloadBlob(blob: Blob, fileName: string): void
  downloadUrl(url: string, fileName: string): Promise<void>
}

function triggerBrowserDownload(href: string, fileName: string): void {
  const a = document.createElement('a')
  a.href = href
  a.download = fileName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function useDownload(): UseDownloadReturn {
  const loading = ref<boolean>(false)
  const progress = ref<DownloadProgress>({ loaded: 0, total: 0, percent: 0 })

  function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob)
    triggerBrowserDownload(url, fileName)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function downloadUrl(url: string, fileName: string): Promise<void> {
    loading.value = true
    progress.value = { loaded: 0, total: 0, percent: 0 }
    try {
      const res = await instance.request<Blob>({
        method: 'get',
        url,
        responseType: 'blob',
        onDownloadProgress: (e) => {
          const total = e.total ?? 0
          const loaded = e.loaded ?? 0
          progress.value = {
            loaded,
            total,
            percent: total > 0 ? Math.floor((loaded / total) * 100) : 0,
          }
        },
      })
      downloadBlob(res.data, fileName)
    } finally {
      loading.value = false
    }
  }

  return { loading, progress, downloadBlob, downloadUrl }
}
