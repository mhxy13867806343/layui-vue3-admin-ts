/**
 * 兼容入口：保留 `import { http } from '@/utils/http'` 的旧路径。
 * 实际实现在 `./http/index.ts`。
 */
export * from './http/index'
export { http as default } from './http/index'
