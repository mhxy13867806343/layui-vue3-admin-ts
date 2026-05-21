# layui-vue3-admin-ts

An enterprise-grade admin scaffold built with Vue 3 + TypeScript + Vite + [layui-vue](https://www.layui-vue.com/zh-CN/guide/getStarted). Ready to use out of the box, friendly for secondary development.

> Repositories:
> - GitHub: https://github.com/mhxy13867806343/layui-vue3-admin-ts
> - Gitee: https://gitee.com/fangjiayu/layui-vue3-admin-ts

## ✨ Features

### Engineering

- **Vue 3.4 + TypeScript (strict) + Vite 5**
- **Path alias**: `@` → `src`
- **Auto-import**: `unplugin-auto-import` (vue / vue-router / pinia) + `@layui/unplugin-vue-components` (layui-vue on-demand)
- **Local Mock**: `vite-plugin-mock` with full `.ts` implementation, isomorphic with real APIs
- **Env separation**: `.env.development` / `.env.production` / `.env.example`
- **Quality gates**: ESLint + Prettier + `vue-tsc` + Vitest + fast-check
- **Conventional Commits** (see below)

### Core Capabilities

- **HTTP Client** (axios-based):
  - GET LRU cache (TTL + tag-based invalidation)
  - Request deduplication (GET/HEAD enabled by default)
  - Retry + exponential backoff (per-request `retry`/`retryOn`)
  - AbortController tag-based cancellation (auto-cancel on route change)
  - 401 single-flight refreshToken + auto-replay
  - nprogress bar (`silent` mode excluded)
  - Unified error normalization (biz code / 5xx / network / timeout)
- **State Management (Pinia)**: user / permission / app (theme, primary color, tabs, layout mode, visual mode, watermark, lock screen)
- **i18n (vue-i18n)**: zh-CN / en-US, menu titles support `i18n:<scope>.<key>` format
- **Permission**: `v-permission` directive + `hasPermission` utility + `Super_Admin` super role
- **Hooks**: `useTable` / `useDict` / `useEcho` / `useDownload`
- **Components**: `SearchForm` / `PageTable` / `PermissionTree` / `IconSelect` / `FileUpload`
- **Excel**: `exportExcel(rows, columns, fileName)` / `importExcel(file, schema)`

### Business Modules

- **Login / Register**: 5 layout templates (centered card / left illustration / right illustration / fullscreen bg / top banner), real-time switch + persistence + 768px auto-downgrade
- **Dashboard**: Greeting + 4 stat cards + skeleton + per-card retry + trend chart + shortcuts + activity log + todo list
- **User / Role / Menu Management**: Standard CRUD + pagination + dict echo + permission tree + tree-based menu
- **Notification Center**: Messages / Announcements / Todo tabs, unread badge + 60s polling
- **Settings Drawer**: Layout mode (side/top/mix), theme (light/dark), primary color palette, visual mode (normal/weak/gray), watermark, lock screen
- **Error Pages**: 403 / 404 / 500 + redirect transit
- **Permission Demo**: Button permission + page permission matrix with interactive checkboxes

## 🚀 Quick Start

> This project uses pnpm as the package manager. Please ensure pnpm >= 8 is installed.

```bash
pnpm install
pnpm dev          # Default: http://localhost:5173
```

Preset accounts (mock mode):

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `123456` | Super_Admin (all permissions) |
| `user` | `123456` | Basic_User (view only) |

## 🛠 Scripts

```bash
pnpm dev            # Vite dev server
pnpm build          # Type check + production build
pnpm preview        # Preview build output
pnpm lint           # ESLint
pnpm type-check     # vue-tsc strict type check
pnpm test           # Vitest single run
pnpm test:watch     # Vitest watch mode
pnpm test:coverage  # Coverage report
```

CI recommended order: `pnpm type-check && pnpm lint && pnpm test && pnpm build`

## ⚙️ Environment Variables

| Variable | Dev | Prod | Description |
| --- | --- | --- | --- |
| `VITE_USE_MOCK` | `true` | `false` | Enable vite-plugin-mock |
| `VITE_API_BASE_URL` | `/api` | Real backend URL | axios baseURL |
| `VITE_PORT` | `5173` | — | Dev server port |
| `VITE_PUBLIC_PATH` | `/` | `/` or subpath | Static asset prefix |

## 🔐 Auth & Permission

```ts
import { http } from '@/utils/http'

// silent: no error toast; retry=0; with cache
http.get<User>('/auth/userInfo', { silent: true, retry: 0 })

// Cache 5 min, invalidate by tag=['dict']
http.get('/dict/status', { cache: { ttl: 300_000, tags: ['dict'] } })

// Route change auto-cancels default tag='route' requests
http.get('/long-poll', { tag: 'long-poll' })
```

Button-level permission:

```vue
<lay-button v-permission="'user:create'">Add</lay-button>
<lay-button v-permission="['role:update', 'role:delete']">Action</lay-button>
```

## 🌍 i18n

Menu / route `meta.title` supports two formats:

```ts
{ meta: { title: '用户管理' } }            // Direct display
{ meta: { title: 'i18n:menu.systemUser' } } // Dictionary lookup
```

## 📦 Commit Convention

```
<type>(<scope>): <subject>

Types:
  feat       New feature
  fix        Bug fix
  docs       Documentation
  style      Code style (no logic change)
  refactor   Refactoring
  perf       Performance
  test       Tests
  build      Build / dependencies
  ci         CI config
  chore      Miscellaneous
  revert     Revert

Examples:
  feat(user): add Excel export to user list
  fix(http): prevent infinite loop in 401 replay
  docs(readme): add dict usage example
```

## 🤝 Contributing

1. Fork and create a branch: `feat/xxx` / `fix/xxx`
2. Pass locally: `pnpm type-check && pnpm lint && pnpm test`
3. Submit PR / MR with change description and test results

## 📄 License

[MIT](./LICENSE)
