import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    icon?: string
    permission?: string | string[]
    keepAlive?: boolean
    hidden?: boolean
  }
}
export {}
