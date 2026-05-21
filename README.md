# layui-vue3-admin-ts

基于 Vue 3 + TypeScript + Vite + [layui-vue](https://www.layui-vue.com/zh-CN/guide/getStarted) 的企业级中后台管理脚手架。开箱即用，二次开发友好。

> 双仓地址：
> - GitHub：https://github.com/mhxy13867806343/layui-vue3-admin-ts
> - Gitee：https://gitee.com/fangjiayu/layui-vue3-admin-ts

## ✨ 特性

### 工程

- **Vue 3.4 + TypeScript（strict）+ Vite 5**
- **路径别名**：`@` → `src`
- **自动导入**：`unplugin-auto-import`（vue / vue-router / pinia）+ `@layui/unplugin-vue-components`（layui-vue 按需注册）
- **本地 Mock**：`vite-plugin-mock` + 全部 `.ts` 实现，与真实接口同构
- **环境变量分离**：`.env.development` / `.env.production` / `.env.example`
- **质量门禁**：ESLint + Prettier + `vue-tsc` + Vitest + fast-check
- **Conventional Commits** 提交规范（详见下方约定）

### 通用能力

- **HTTP 客户端**：基于 axios，提供
  - GET LRU 缓存（TTL + tags 失效）
  - 请求去重（GET/HEAD 默认开启）
  - 重试 + 指数退避（per-request `retry`/`retryOn`）
  - AbortController 标签取消（路由切换自动取消上一波请求）
  - 401 单飞 refreshToken + 自动重放
  - nprogress 进度条（`silent` 模式不计入）
  - 业务码 / 5xx / 网络 / 超时 统一归一化
- **状态管理（Pinia）**：user / permission / app（含主题、主色、Tabs、布局模式、视觉模式、水印、锁屏）
- **国际化（vue-i18n）**：zh-CN / en-US，菜单 title 支持 `i18n:<scope>.<key>` 格式
- **权限**：`v-permission` 指令 + `hasPermission` 工具 + `Super_Admin` 超级管理员
- **通用 Hooks**：`useTable` / `useDict` / `useEcho` / `useDownload`
- **公共组件**：`SearchForm` / `PageTable` / `PermissionTree` / `IconSelect` / `FileUpload`
- **Excel 导入导出**：`exportExcel(rows, columns, fileName)` / `importExcel(file, schema)`

### 业务模块

- **登录 / 注册**：5 套布局模板（居中卡片 / 左插画 / 右插画 / 整屏背景 / 顶部 Banner），`<lay-select>` 实时切换 + 持久化 + 768px 自动降级
- **仪表盘**：欢迎语 + 4 个统计卡片 + 骨架屏 + 单卡失败重试
- **用户 / 角色 / 菜单管理**：标准 CRUD + 分页 + 字典回显 + 权限分配树 + 树形菜单管理
- **通知中心**：消息 / 公告 / 待办 三 tab，未读徽章 + 60s 轮询
- **设置抽屉**：布局模式（side/top/mix）、主题（明/暗）、主色色板、视觉模式（normal/weak/gray）、水印、立即锁屏
- **异常页**：403 / 404 / 500 + redirect 中转

## 📁 目录结构

```
.
├── mock/                          # vite-plugin-mock 服务（全 TS）
│   ├── _utils.ts                  # ok / fail / paginate / guard
│   ├── _data/                     # 静态数据（users/roles/menus/permissions/notices/dicts）
│   ├── auth.ts notice.ts user.ts ...
├── src/
│   ├── api/                       # 业务 API 层
│   ├── components/                # 公共组件 (SearchForm / PageTable / FileUpload ...)
│   ├── directives/                # v-permission
│   ├── hooks/                     # useTable / useDict / useEcho / useDownload
│   ├── layouts/                   # BasicLayout / BlankLayout + 子组件
│   ├── locales/                   # zh-CN / en-US
│   ├── router/                    # routes.static / routes.async / guard
│   ├── store/                     # pinia + user / permission / app
│   ├── styles/                    # reset / theme / visual
│   ├── types/                     # api / domain / env / router / auth-template
│   ├── utils/                     # storage / permission / theme / error-handler / watermark / excel
│   │   └── http/                  # core / interceptors / cache / dedupe / retry / refresh / cancel / progress
│   └── views/                     # auth / dashboard / system/* / error / redirect
├── tests/
│   ├── setup.ts                   # vitest setup
│   └── properties/                # 属性测试（fast-check）
└── .kiro/specs/layui-vue-admin-system/
    ├── requirements.md design.md tasks.md
```

## 🚀 本地开发

> 本项目使用 pnpm 作为包管理器，请确保已安装 pnpm >= 8。

```bash
pnpm install
pnpm dev          # 默认 http://localhost:5173
```

预置账号（mock 模式）：

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| `admin` | `123456` | Super_Admin（全部权限） |
| `user` | `123456` | Basic_User（仅查看） |

## 🛠 脚本

```bash
pnpm dev            # Vite 开发服务器
pnpm build          # 类型检查 + 生产构建
pnpm preview        # 预览构建产物
pnpm lint           # ESLint
pnpm type-check     # vue-tsc 严格类型检查
pnpm test           # Vitest 一次性
pnpm test:watch     # Vitest 监听
pnpm test:coverage  # 覆盖率报告
```

CI 推荐顺序：`pnpm type-check && pnpm lint && pnpm test && pnpm build`，任一失败中断流水线。

## ⚙️ 环境变量

| 变量 | 开发期 | 生产期 | 说明 |
| --- | --- | --- | --- |
| `VITE_USE_MOCK` | `true` | `false` | 是否启用 vite-plugin-mock |
| `VITE_API_BASE_URL` | `/api` | 真实后端域名 | axios baseURL |
| `VITE_PORT` | `5173` | — | 开发端口 |
| `VITE_PUBLIC_PATH` | `/` | `/` 或子路径 | 静态资源前缀 |

## 🔐 鉴权与权限

```ts
import { http } from '@/utils/http'

// silent: 不弹错；retry=0 不重试；带缓存
http.get<User>('/auth/userInfo', { silent: true, retry: 0 })

// 缓存 5 分钟，按 tag=['dict'] 集中失效
http.get('/dict/status', { cache: { ttl: 300_000, tags: ['dict'] } })

// 路由切换会自动取消默认 tag='route' 的请求
http.get('/long-poll', { tag: 'long-poll' })
```

按钮级权限：

```vue
<lay-button v-permission="'user:create'">新增</lay-button>
<lay-button v-permission="['role:update', 'role:delete']">操作</lay-button>
```

## 🌍 国际化

菜单 / 路由 `meta.title` 支持两种写法：

```ts
{ meta: { title: '用户管理' } }            // 直接展示
{ meta: { title: 'i18n:menu.systemUser' } } // 走词典
```

## 📦 提交规范（Conventional Commits）

```
<type>(<scope>): <subject>

类型：
  feat       新功能
  fix        修复
  docs       文档
  style      不影响逻辑的代码风格
  refactor   重构
  perf       性能
  test       测试
  build      构建 / 依赖
  ci         CI 配置
  chore      其它（包含杂活）
  revert     回滚

示例：
  feat(user): 用户列表支持导出 Excel
  fix(http): 401 重放逻辑避免死循环
  docs(readme): 补充字典使用示例
```

## 🤝 贡献

1. Fork 后建分支：`feat/xxx` / `fix/xxx`
2. 本地通过 `pnpm type-check && pnpm lint && pnpm test`
3. 提交 PR / MR，描述变更点与测试结论

## 📄 License

[MIT](./LICENSE)
