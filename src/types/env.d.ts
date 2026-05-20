/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK: 'true' | 'false'
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT?: string
  readonly VITE_PUBLIC_PATH?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
