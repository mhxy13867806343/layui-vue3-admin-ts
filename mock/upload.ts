/**
 * Mock：文件上传
 *
 * vite-plugin-mock 不真正消费 multipart 内容，这里仅模拟成功响应。
 */
import { guard, ok, type MockMethod } from './_utils'

const uploadMocks: MockMethod[] = [
  {
    url: '/api/upload',
    method: 'post',
    response: guard((req): unknown => {
      // body 在 mock 中可能是 FormData 也可能是 object，统一兜底
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (req as { body?: any }).body ?? {}
      const name = String(body?.name ?? `mock-file-${Date.now()}.bin`)
      const size = Number(body?.size ?? 1024)
      return ok({
        url: `/static/mock/${encodeURIComponent(name)}`,
        name,
        size,
      })
    }),
  },
]

export default uploadMocks
