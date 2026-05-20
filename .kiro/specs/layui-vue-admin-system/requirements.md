# Requirements Document

## Introduction

本项目基于 Vue 3、TypeScript 与 layui-vue 组件库构建一套通用的后台管理系统（Admin System），提供常见管理类应用所需的基础能力，包括登录认证、用户管理、角色与权限管理、菜单管理、仪表盘、统一布局、路由导航、主题切换以及统一的 HTTP 请求与异常处理机制。系统目标是：让开发者基于本项目可以快速二次开发出具体业务的后台管理系统，并保持代码结构清晰、可维护、可扩展。

参考文档：layui-vue 官方入门文档（https://www.layui-vue.com/zh-CN/guide/getStarted）。
目标仓库（用于发布与同步）：
- GitHub：https://github.com/mhxy13867806343/layui-vue3-admin-ts.git
- Gitee：https://gitee.com/fangjiayu/layui-vue3-admin-ts.git

## Glossary

- **Admin_System**：本后台管理系统的整体应用，运行在浏览器端，由 Vue 3 + TypeScript + layui-vue 实现。
- **Scaffold**：项目脚手架模块，负责工程初始化、依赖配置、构建配置（Vite）、目录结构与基础约定。
- **Auth_Module**：认证模块，负责登录、登出、令牌（Token）管理与登录状态维护。
- **Token**：用户身份凭证字符串，由后端返回，存储在浏览器本地存储中，用于后续接口鉴权。
- **User_Module**：用户管理模块，负责用户的增、删、改、查与状态变更。
- **Role_Module**：角色管理模块，负责角色的增、删、改、查及角色与权限的绑定。
- **Permission_Module**：权限管理模块，负责权限项（菜单权限、按钮权限、接口权限）的定义与校验。
- **Menu_Module**：菜单管理模块，负责系统左侧导航菜单的配置、维护与渲染。
- **Dashboard_Module**：仪表盘模块，作为登录后的默认首页，展示概览信息与统计图表。
- **Layout_Module**：布局模块，提供固定的整体布局骨架（顶部 Header、左侧 Sidebar、主内容区 Content、面包屑、标签页）。
- **Router_Module**：路由模块，基于 vue-router 实现页面导航与路由守卫。
- **Theme_Module**：主题模块，提供至少明亮与暗黑两种主题，并允许切换主色。
- **HTTP_Client**：统一的 HTTP 请求客户端，基于 axios 封装，提供请求拦截、响应拦截与错误处理。
- **Error_Handler**：全局异常处理器，统一处理接口错误、运行时错误与未授权访问。
- **Storage_Service**：本地存储服务，封装 localStorage / sessionStorage，提供 Token、用户信息与个性化配置的读写。
- **Operator**：使用本系统的后台管理员（含超级管理员与普通管理员）。
- **Super_Admin**：拥有系统全部权限的超级管理员。
- **Permission_Code**：权限标识字符串（例如 `user:create`、`role:delete`），用于按钮级与接口级权限校验。

## Requirements

### Requirement 1: 项目脚手架与技术栈

**User Story:** 作为前端开发者，我希望项目具备清晰的脚手架与统一的技术栈配置，以便快速启动开发与构建。

#### Acceptance Criteria

1. THE Scaffold SHALL 使用 Vue 3、TypeScript、Vite 与 layui-vue 作为核心技术栈。
2. THE Scaffold SHALL 提供 `package.json`，并声明 `dev`、`build`、`preview`、`lint`、`type-check` 五个 npm 脚本命令。
3. WHEN 开发者执行 `npm install`，THE Scaffold SHALL 在不修改源码的前提下完成所有依赖安装。
4. WHEN 开发者执行 `npm run dev`，THE Scaffold SHALL 启动 Vite 开发服务器并监听指定端口（默认 5173）。
5. WHEN 开发者执行 `npm run build`，THE Scaffold SHALL 输出可部署的静态资源到 `dist` 目录。
6. THE Scaffold SHALL 在项目根目录提供 `tsconfig.json`，并启用 `strict` 严格模式。
7. THE Scaffold SHALL 在项目根目录提供 ESLint 与 Prettier 配置文件，约束代码风格。
8. THE Scaffold SHALL 在 `src` 下建立至少以下目录：`api`、`assets`、`components`、`layouts`、`router`、`store`、`styles`、`utils`、`views`、`types`。
9. THE Scaffold SHALL 在 `vite.config.ts` 中配置路径别名 `@` 指向 `src` 目录。
10. THE Scaffold SHALL 在入口文件中按 layui-vue 官方入门文档要求完成全局注册与样式引入。

### Requirement 2: 登录认证

**User Story:** 作为管理员，我希望使用账号与密码登录系统，以便安全地访问后台功能。

#### Acceptance Criteria

1. THE Auth_Module SHALL 提供独立的登录页面，路径为 `/login`。
2. THE Auth_Module SHALL 在登录页面展示账号输入框、密码输入框与登录按钮。
3. WHEN 用户在登录页面提交空账号或空密码，THE Auth_Module SHALL 阻止请求发送，并在对应字段下方提示「账号不能为空」或「密码不能为空」。
4. WHEN 用户提交合法的登录表单，THE Auth_Module SHALL 调用登录接口并在请求期间禁用登录按钮。
5. WHEN 登录接口返回成功，THE Auth_Module SHALL 将返回的 Token 与用户基本信息保存到 Storage_Service，并跳转到 Dashboard 页面。
6. IF 登录接口返回失败，THEN THE Auth_Module SHALL 在登录页面以提示框形式展示后端返回的错误信息。
7. WHEN 用户点击登出按钮，THE Auth_Module SHALL 清除 Storage_Service 中的 Token 与用户信息，并跳转到登录页面。
8. WHILE 用户未登录（Storage_Service 中不存在有效 Token），THE Router_Module SHALL 阻止访问除 `/login` 与白名单外的任何页面，并重定向到 `/login`。
9. IF HTTP_Client 收到 HTTP 401 响应，THEN THE Auth_Module SHALL 清除 Token 并强制跳转到登录页面。
10. THE Auth_Module SHALL 在登录请求超过 10 秒未响应时取消该请求，并提示「登录请求超时，请稍后重试」。

### Requirement 3: HTTP 请求与错误处理

**User Story:** 作为前端开发者，我希望项目提供统一的 HTTP 客户端与错误处理机制，以便业务代码无需重复处理鉴权、错误与超时。

#### Acceptance Criteria

1. THE HTTP_Client SHALL 基于 axios 封装并以单例形式导出。
2. THE HTTP_Client SHALL 通过环境变量 `VITE_API_BASE_URL` 配置接口基础地址。
3. WHEN 发起任意请求，THE HTTP_Client SHALL 在请求头自动附加当前 Token（若存在）。
4. THE HTTP_Client SHALL 对所有请求设置默认超时时间 15 秒。
5. WHEN 接口返回业务错误码（非 0 / 非 200，依据后端约定），THE Error_Handler SHALL 以提示框形式展示错误信息，并将该错误以 Promise.reject 透传给调用方。
6. IF 请求过程中发生网络异常，THEN THE Error_Handler SHALL 提示「网络异常，请检查网络连接」。
7. IF 接口返回 HTTP 5xx，THEN THE Error_Handler SHALL 提示「服务异常，请稍后重试」。
8. THE HTTP_Client SHALL 提供 `get`、`post`、`put`、`delete` 四个泛型方法，并对响应数据进行类型推导。

### Requirement 4: 整体布局

**User Story:** 作为管理员，我希望系统具有统一且固定的布局，以便我在任何业务页面都能快速导航与切换。

#### Acceptance Criteria

1. THE Layout_Module SHALL 提供包含 Header、Sidebar、Content 三个区域的主布局组件。
2. THE Layout_Module SHALL 在 Header 区域展示系统名称、当前登录用户头像与下拉菜单（包含「个人中心」「修改密码」「退出登录」三个选项）。
3. THE Layout_Module SHALL 在 Sidebar 区域根据 Menu_Module 提供的菜单数据渲染左侧导航菜单。
4. WHEN 用户点击 Sidebar 折叠按钮，THE Layout_Module SHALL 在展开（默认 240px）与收起（64px，仅图标）两种状态间切换。
5. THE Layout_Module SHALL 在 Content 顶部展示面包屑导航，反映当前路由层级。
6. THE Layout_Module SHALL 在 Content 区域上方展示多标签页（Tabs），每打开一个新页面新增一个标签。
7. WHEN 用户点击某个标签页的关闭图标，THE Layout_Module SHALL 关闭该标签并切换到相邻标签。
8. WHERE 当前标签为唯一标签，THE Layout_Module SHALL 隐藏关闭图标以避免关闭后无可显示页面。
9. THE Layout_Module SHALL 在视口宽度小于 768 像素时自动折叠 Sidebar。

### Requirement 5: 路由与权限守卫

**User Story:** 作为管理员，我希望系统按照我的角色与权限渲染可访问的菜单与页面，以避免越权访问。

#### Acceptance Criteria

1. THE Router_Module SHALL 基于 vue-router 4 实现，并采用 `history` 模式。
2. THE Router_Module SHALL 将路由划分为静态路由（登录页、404 等）与动态路由（业务页面）。
3. WHEN 用户登录成功，THE Router_Module SHALL 根据用户权限列表过滤动态路由后再调用 `addRoute` 注册。
4. IF 用户访问的路径未在已注册路由中，THEN THE Router_Module SHALL 跳转到 `/404` 页面。
5. IF 用户访问的路径在已注册路由中但其权限码不在用户权限列表中，THEN THE Router_Module SHALL 跳转到 `/403` 页面。
6. WHEN 用户登出，THE Router_Module SHALL 重置路由表，移除全部动态路由。
7. THE Router_Module SHALL 在每次路由切换前更新浏览器标签页标题为对应路由的 `meta.title`。

### Requirement 6: 仪表盘

**User Story:** 作为管理员，我希望登录后看到一个仪表盘页面，以便快速了解系统的整体概况。

#### Acceptance Criteria

1. THE Dashboard_Module SHALL 注册为路径 `/dashboard` 并作为登录后的默认页。
2. THE Dashboard_Module SHALL 展示至少以下内容：欢迎语（含当前用户昵称）、当前日期、四个统计卡片（用户数、角色数、菜单数、今日访问数）。
3. WHEN 仪表盘所需接口数据正在加载，THE Dashboard_Module SHALL 在对应区域展示骨架屏或加载占位。
4. IF 仪表盘任一统计接口请求失败，THEN THE Dashboard_Module SHALL 在该卡片内显示「加载失败，点击重试」并允许单独重试。

### Requirement 7: 用户管理

**User Story:** 作为超级管理员，我希望对系统中的用户进行增、删、改、查与状态管理，以便控制谁可以登录系统。

#### Acceptance Criteria

1. THE User_Module SHALL 提供用户列表页面，路径为 `/system/user`。
2. THE User_Module SHALL 在列表页支持按账号、昵称、状态进行筛选查询。
3. THE User_Module SHALL 在列表页提供分页器，默认每页 10 条，可选 10 / 20 / 50。
4. WHEN 操作员点击「新增」按钮，THE User_Module SHALL 弹出表单，包含账号、昵称、初始密码、所属角色、状态字段。
5. IF 新增表单中账号为空、长度不在 4–20 字符或包含非法字符（仅允许字母、数字、下划线），THEN THE User_Module SHALL 在该字段下方展示具体错误信息并阻止提交。
6. WHEN 新增表单提交成功，THE User_Module SHALL 关闭弹窗、刷新列表并提示「新增成功」。
7. WHEN 操作员对某条用户记录点击「编辑」，THE User_Module SHALL 弹出与新增结构一致的表单，并预填充该用户当前数据（不显示密码字段）。
8. WHEN 操作员对某条用户记录点击「重置密码」，THE User_Module SHALL 弹出二次确认框，确认后调用接口将密码重置为系统默认值并提示结果。
9. WHEN 操作员对某条用户记录点击「删除」，THE User_Module SHALL 弹出二次确认框，确认后调用删除接口并刷新列表。
10. WHERE 列表中某行用户为当前登录用户，THE User_Module SHALL 隐藏该行的「删除」按钮以防自删。

### Requirement 8: 角色管理

**User Story:** 作为超级管理员，我希望维护系统中的角色及其权限，以便对不同岗位授予不同的功能。

#### Acceptance Criteria

1. THE Role_Module SHALL 提供角色列表页面，路径为 `/system/role`。
2. THE Role_Module SHALL 在列表中展示角色编码、角色名称、描述、状态、创建时间与操作列。
3. WHEN 操作员点击「新增角色」，THE Role_Module SHALL 弹出包含角色编码、角色名称、描述、状态字段的表单。
4. IF 角色编码与系统内已存在的角色编码重复，THEN THE Role_Module SHALL 在编码字段下方提示「角色编码已存在」并阻止提交。
5. WHEN 操作员点击某角色的「分配权限」，THE Role_Module SHALL 弹出权限树，并按当前角色已有权限默认勾选。
6. WHEN 操作员在权限树中保存权限分配，THE Role_Module SHALL 调用接口保存并提示「权限分配成功」。
7. WHEN 操作员对某角色点击「删除」，THE Role_Module SHALL 弹出二次确认框，确认后调用删除接口并刷新列表。
8. IF 待删除角色仍被任意用户引用，THEN THE Role_Module SHALL 阻止删除并提示「该角色正在被使用，无法删除」。

### Requirement 9: 菜单管理

**User Story:** 作为超级管理员，我希望维护系统的菜单结构，以便控制左侧导航的展示与权限。

#### Acceptance Criteria

1. THE Menu_Module SHALL 提供菜单管理页面，路径为 `/system/menu`。
2. THE Menu_Module SHALL 以树形表格展示菜单层级，字段包含菜单名称、图标、路由路径、组件路径、权限码、排序、是否可见、操作。
3. WHEN 操作员点击「新增」或「在该项下新增子菜单」，THE Menu_Module SHALL 弹出菜单表单，并将上级菜单字段预填或预选。
4. IF 菜单类型为「目录」或「菜单」且路由路径为空，THEN THE Menu_Module SHALL 阻止提交并在路由路径字段下方提示「路由路径不能为空」。
5. IF 菜单类型为「按钮」，THEN THE Menu_Module SHALL 要求填写权限码且不要求路由路径与组件路径。
6. WHEN 操作员保存菜单后，THE Menu_Module SHALL 刷新菜单树并刷新当前用户左侧导航数据。
7. WHEN 操作员对某菜单点击「删除」且该菜单存在子节点，THE Menu_Module SHALL 阻止删除并提示「请先删除其子节点」。

### Requirement 10: 按钮级权限校验

**User Story:** 作为前端开发者，我希望以声明式的方式控制按钮的显示，以便页面按当前用户权限自动隐藏无权操作。

#### Acceptance Criteria

1. THE Permission_Module SHALL 提供 `v-permission` 指令，接受单个权限码字符串或权限码数组。
2. WHEN 元素绑定 `v-permission` 指令且当前用户权限列表不包含所声明的权限码，THE Permission_Module SHALL 将该元素从 DOM 中移除。
3. THE Permission_Module SHALL 提供 `hasPermission(code: string | string[]): boolean` 工具函数供脚本中显式判断使用。
4. WHERE 当前用户为 Super_Admin，THE Permission_Module SHALL 视所有权限码均通过校验。

### Requirement 11: 主题与外观

**User Story:** 作为管理员，我希望可以切换系统主题，以便在不同环境下获得舒适的视觉体验。

#### Acceptance Criteria

1. THE Theme_Module SHALL 提供「明亮」与「暗黑」两种主题，并默认使用「明亮」。
2. WHEN 操作员在 Header 切换主题按钮，THE Theme_Module SHALL 在 200 毫秒内将整体配色切换至所选主题。
3. THE Theme_Module SHALL 将所选主题持久化到 Storage_Service，并在下次进入系统时自动应用。
4. THE Theme_Module SHALL 提供主色配置入口，至少支持 5 个预设主色与自定义颜色选择。
5. WHEN 操作员变更主色，THE Theme_Module SHALL 同时更新 layui-vue 组件的主色变量。

### Requirement 12: 异常页与全局错误

**User Story:** 作为管理员，我希望遇到异常情况时看到友好的提示页面，以便我知道下一步操作。

#### Acceptance Criteria

1. THE Admin_System SHALL 提供 `/403`、`/404`、`/500` 三个异常页面，并展示对应错误说明与「返回首页」按钮。
2. WHEN 操作员在异常页面点击「返回首页」，THE Router_Module SHALL 跳转到 Dashboard 页面。
3. IF 应用在运行时抛出未捕获的 JavaScript 错误，THEN THE Error_Handler SHALL 通过 Vue 的 `app.config.errorHandler` 捕获并以提示框展示「页面发生异常，请刷新重试」。
4. THE Error_Handler SHALL 在开发环境将原始错误信息打印到控制台，在生产环境仅展示用户友好提示。

### Requirement 13: 本地存储

**User Story:** 作为前端开发者，我希望项目提供统一的本地存储封装，以便在不同模块间一致地读写持久化数据。

#### Acceptance Criteria

1. THE Storage_Service SHALL 同时支持 `localStorage` 与 `sessionStorage` 两种存储介质。
2. THE Storage_Service SHALL 提供 `get<T>(key)`、`set<T>(key, value)`、`remove(key)`、`clear()` 四个方法，并对值进行 JSON 序列化与反序列化。
3. THE Storage_Service SHALL 通过统一前缀（默认 `lva_`）隔离不同应用，避免与同域其他应用键名冲突。
4. IF 反序列化过程中数据格式异常，THEN THE Storage_Service SHALL 返回 `null` 并将错误打印到控制台（仅开发环境）。

### Requirement 14: 开发约定与代码质量

**User Story:** 作为团队成员，我希望项目具备一致的代码风格与基本质量保障，以便协作开发不产生风格冲突。

#### Acceptance Criteria

1. WHEN 开发者执行 `npm run lint`，THE Scaffold SHALL 运行 ESLint 检查全部 `src` 下的 `.ts` 与 `.vue` 文件，并以非零退出码反映任一错误。
2. WHEN 开发者执行 `npm run type-check`，THE Scaffold SHALL 调用 `vue-tsc` 进行类型检查，并以非零退出码反映任一类型错误。
3. THE Scaffold SHALL 提供 Git 提交规范说明（提交信息遵循 Conventional Commits 规范）作为 README 中的章节。
4. THE Scaffold SHALL 在仓库根目录提供 `.gitignore`，至少忽略 `node_modules`、`dist`、`.DS_Store`、`*.local`。

### Requirement 15: 仓库与文档

**User Story:** 作为开源协作者，我希望仓库包含清晰的文档与双仓同步说明，以便快速上手并贡献代码。

#### Acceptance Criteria

1. THE Admin_System SHALL 在仓库根目录提供中文 `README.md`，至少包含：项目简介、技术栈、目录结构、本地开发、构建部署、目标仓库地址。
2. THE Admin_System SHALL 在 README.md 中同时列出 GitHub 与 Gitee 仓库地址：`https://github.com/mhxy13867806343/layui-vue3-admin-ts.git` 与 `https://gitee.com/fangjiayu/layui-vue3-admin-ts.git`。
3. THE Admin_System SHALL 在 README.md 中提供 layui-vue 入门参考链接 `https://www.layui-vue.com/zh-CN/guide/getStarted`。
4. THE Admin_System SHALL 在仓库根目录包含 `LICENSE` 文件并采用 MIT 许可证。
### Requirement 16: TypeScript Mock 数据服务

**User Story:** 作为前端开发者，我希望在没有真实后端的情况下使用本地 TypeScript Mock 服务返回所有接口数据，以便独立开发与演示。

#### Acceptance Criteria

1. THE Scaffold SHALL 在 `mock/` 目录下使用 TypeScript 文件（`.ts`）定义 Mock 数据与处理函数，禁止使用 `.js`、`.json` 单一格式承载逻辑。
2. THE Scaffold SHALL 通过 `vite-plugin-mock` 在开发环境（`npm run dev`）启用 Mock 服务，并在 `vite.config.ts` 中通过环境变量开关其启用与否。
3. THE Mock SHALL 至少覆盖以下接口：登录、登出、获取当前用户信息、获取用户菜单与权限、用户分页查询、用户增/改/删/重置密码、角色分页查询与增/改/删、角色权限分配、菜单分页与树查询及增/改/删、仪表盘四个统计接口。
4. WHEN 任意 Mock 接口被调用，THE Mock SHALL 返回统一的响应结构 `{ code: number; data: T; message: string }`，其中 `code === 0` 表示成功。
5. THE Mock SHALL 为列表类接口提供分页参数（`page`、`pageSize`）解析与按字段过滤的能力，并在返回中包含 `total` 字段。
6. THE Mock SHALL 为登录接口预置至少两个账号：`admin / 123456`（Super_Admin，全部权限）与 `user / 123456`（普通用户，仅基础查看权限）。
7. IF Mock 接口接收到无 Token 或非法 Token 的非登录请求，THEN THE Mock SHALL 返回 HTTP 401 与 `{ code: 401, message: '未登录或登录已过期' }`。
8. THE Scaffold SHALL 在 `.env.development` 中默认设置 `VITE_USE_MOCK=true`，在 `.env.production` 中默认设置 `VITE_USE_MOCK=false`。

### Requirement 17: 自动导入与组件按需注册

**User Story:** 作为前端开发者，我希望 layui-vue 的组件与常用 API 能自动导入，以减少模板文件中的重复 `import`。

#### Acceptance Criteria

1. THE Scaffold SHALL 在 `vite.config.ts` 中安装并启用 `unplugin-auto-import/vite` 与 `@layui/unplugin-vue-components/vite` 两个插件。
2. THE Scaffold SHALL 在两个插件的 `resolvers` 选项中均使用 `LayuiVueResolver()`（来自 `@layui/unplugin-vue-components/resolvers`）以实现 layui-vue 的自动导入与按需注册。
3. WHEN 开发者在 `.vue` 文件中直接使用任意 layui-vue 组件（例如 `<lay-button>`），THE Scaffold SHALL 在不写显式 `import` 的情况下完成组件注册并正确渲染。
4. THE Scaffold SHALL 将自动导入插件生成的类型声明输出到 `src/types/auto-imports.d.ts` 与 `src/types/components.d.ts`，并在 `tsconfig.json` 中纳入 `include` 范围。
5. THE Scaffold SHALL 将上述自动生成的 `*.d.ts` 文件从 `eslint` 与 `prettier` 的检查范围中排除。
6. WHILE 自动导入已启用，THE Scaffold SHALL 仍允许开发者显式 `import` 同名组件而不触发重复注册的运行时警告。
### Requirement 18: 登录与注册页布局模板切换

**User Story:** 作为产品体验设计师，我希望登录与注册页都内置 5 套不同的视觉布局模板，并允许通过下拉框（select）实时切换，以便针对不同场景挑选合适风格。

#### Glossary 增补

- **Auth_Template**：认证页（登录 / 注册）的视觉模板，包含整体版式、配图位置、表单容器位置与风格。
- **Auth_Template_Selector**：认证页右上角的模板切换组件，由 `<lay-select>` 实现，提供 5 个选项并实时切换。
- **Register_Module**：注册模块，提供独立注册页面，与 `Auth_Module` 对称。

#### Acceptance Criteria

1. THE Auth_Module SHALL 在登录页内置 5 套互不相同的 Auth_Template，分别为：
   - `centered-card`：屏幕居中的单卡片，背景渐变；
   - `split-left-illustration`：左半屏插画区，右半屏表单；
   - `split-right-illustration`：左半屏表单，右半屏插画区；
   - `fullscreen-bg`：整屏背景图 + 浮层透明卡片；
   - `top-banner`：顶部 banner 区 + 下方居中表单。
2. THE Register_Module SHALL 提供与 Auth_Module 完全对称的 5 套 Auth_Template，命名一致并且布局结构与登录页同名模板一致。
3. THE Auth_Module 与 Register_Module SHALL 在页面右上角放置 Auth_Template_Selector（基于 `<lay-select>`），选项标签为模板的中文名称，值为模板 key。
4. WHEN 用户在 Auth_Template_Selector 中选择任一选项，THE Auth_Module（或 Register_Module）SHALL 在 200ms 内将当前页面切换到所选模板，且表单数据与校验状态保持不变。
5. THE Auth_Module 与 Register_Module SHALL 将所选模板持久化到 Storage_Service（key：`lva_auth_login_template` 与 `lva_auth_register_template`），并在下次进入对应页面时自动应用。
6. WHERE 视口宽度小于 768 像素，THE Auth_Module 与 Register_Module SHALL 自动将 `split-left-illustration` 与 `split-right-illustration` 模板降级为 `centered-card`，避免双栏挤压；模板选择器仍可用，再次切换时按用户实际选择渲染。
7. THE Register_Module SHALL 提供独立路由 `/register`，并被加入路由白名单（与 `/login` 同等待遇），未登录用户可直接访问。
8. THE Register_Module SHALL 在表单中提供「账号、昵称、密码、确认密码」四个字段；账号正则与用户管理保持一致（`^[A-Za-z0-9_]{4,20}$`），密码长度 6–20，确认密码必须等于密码，否则字段下方提示「两次输入的密码不一致」。
9. THE Register_Module SHALL 在登录页底部展示「还没账号？立即注册」链接，跳转到 `/register`；同样地，注册页底部展示「已有账号？立即登录」链接，跳转到 `/login`。
10. THE Auth_Module 与 Register_Module SHALL 通过同一份 `AuthFrame.vue` 渲染壳与模板，避免每个模板复制一份表单；模板仅决定壳的版式，表单本身复用为 `LoginForm.vue` / `RegisterForm.vue`。

### Requirement 19: HTTP 客户端高级能力

**User Story:** 作为前端开发者，我希望 HTTP 客户端不只是裸 axios 包装，还要具备重试、去重、取消、缓存、进度条、静默模式与 Token 刷新等企业级能力，避免业务侧重复造轮子。

#### Glossary 增补

- **Request_Cache**：以「method+url+params 序列化」为 key 的内存缓存层，遵循 LRU + TTL 双策略。
- **Request_Dedupe**：进行中相同 key 的请求复用同一个 Promise，避免短时间内同一端点的重复发送。
- **Request_Cancel**：基于 `AbortController`，允许在路由切换或组件卸载时取消挂起请求。
- **Refresh_Flow**：401 出现时透明刷新 Token 后重放原请求的流程，进行中并发 401 复用同一刷新 Promise。
- **Silent_Request**：标记为 `silent=true` 的请求在错误时不弹出全局 layer.msg，由调用方自行处理。

#### Acceptance Criteria

1. THE HTTP_Client SHALL 支持 GET / HEAD 等幂等方法的自动重试，默认最多 2 次，重试条件为「网络异常 / 5xx / `ECONNABORTED`」，重试间隔采用指数退避（基线 300ms，最大 3000ms）。
2. THE HTTP_Client SHALL 支持单次请求级别覆盖：`retry: number`、`retryDelay: number | (attempt) => number`、`retryOn: (err) => boolean`，覆盖优先于全局默认。
3. THE HTTP_Client SHALL 提供请求去重：当 `dedupe: true`（GET 默认开启）且存在同 key 的进行中请求，THE HTTP_Client SHALL 直接复用其 Promise 而不发起新请求。
4. THE HTTP_Client SHALL 暴露 `cancelByTag(tag)`、`cancelAll()` 与 per-request 的 `signal` / `abortKey` 选项，并在 vue-router `beforeEach` 中默认调用 `cancelByTag('route')` 取消上一路由发起的请求。
5. THE HTTP_Client SHALL 提供 GET 缓存：`cache: { ttl: number; key?: string; tags?: string[] }`，默认 TTL=0（不缓存）；`http.cacheInvalidate(tags?: string[])` 可按 tag 失效；缓存上限默认 100 条 LRU。
6. THE HTTP_Client SHALL 通过 `nprogress` 暴露全局加载条；并发请求计数为 0 时关闭进度条；`silent=true` 的请求不计入计数也不触发 layer.msg。
7. THE HTTP_Client SHALL 实现 Refresh_Flow：401 触发时优先尝试调用 `/auth/refresh`，成功则用新 Token 重放原请求；并发多个 401 共享同一 refresh Promise；失败则触发现有清空鉴权态 + 跳转 `/login` 流程。
8. THE HTTP_Client SHALL 暴露 `addRequestInterceptor` / `addResponseInterceptor` 注册接口，并提供 `useHttpLogger()` 在 DEV 下打印 `[HTTP] METHOD URL status timeMs` 日志，PROD 默认关闭。
9. THE HTTP_Client SHALL 在 `RequestConfig` 上额外支持 `silent`、`showError`（覆盖默认错误提示）、`returnRaw`（直接返回 ApiResponse 壳而不是 unwrap data）、`mock`（强制启用/禁用 mock 路径），并保持类型推导与现有 `get/post/put/delete` 兼容。

### Requirement 20: 国际化（i18n）

**User Story:** 作为面向国际客户的前端开发者，我希望系统支持中英两语切换，所有页面文案、菜单标题、表单校验提示均能翻译。

#### Acceptance Criteria

1. THE Admin_System SHALL 集成 `vue-i18n@9`，提供 `zh-CN`、`en-US` 两套词典作为基线。
2. THE Admin_System SHALL 在 Header 区放置语言切换器（`<lay-dropdown>`），切换后 200ms 内全站文案刷新。
3. THE Admin_System SHALL 将所选语言持久化到 Storage_Service（key：`lva_locale`），并在下次进入系统时自动应用；浏览器 `navigator.language` 优先回退用于首次访问。
4. THE Menu_Module SHALL 在 `RouteMeta.title` 与菜单 `name` 字段允许传入「i18n key」格式 `i18n:<scope>.<id>`，渲染层自动调用 `t(key)`；纯文本（非 `i18n:` 前缀）保持原样。
5. THE Auth_Module 与 Form 组件 SHALL 将所有用户可见文案（占位、按钮、错误提示）以 i18n key 提供；缺词时回退到 `zh-CN`。

### Requirement 21: 通知中心

**User Story:** 作为管理员，我希望从 Header 看到一个铃铛入口，点开后能看到消息 / 公告 / 待办三类通知，并能逐条或批量标记已读。

#### Acceptance Criteria

1. THE Admin_System SHALL 在 Header 增加铃铛图标 `<NotificationCenter>`，未读总数大于 0 时展示红色徽章。
2. THE NotificationCenter SHALL 在弹层中提供 `<lay-tab>` 三个 tab：「消息」「公告」「待办」，每个 tab 展示分页列表与「全部已读」按钮。
3. THE NotificationCenter SHALL 通过 `/api/notice/list?type=...` 拉取数据，支持 `markRead(id)` 与 `markAllRead(type)`，Mock 中预置至少 5 条数据每类。
4. WHEN 用户点击单条通知，THE NotificationCenter SHALL 标记该条为已读，并刷新徽章数。
5. WHILE 通知列表为空，THE NotificationCenter SHALL 在该 tab 内显示「暂无通知」占位。

### Requirement 22: 设置抽屉 / 锁屏 / 水印 / 色弱 / 灰度

**User Story:** 作为管理员，我希望一个统一入口快速切换布局风格、视觉模式、锁定屏幕并可配置全局水印。

#### Glossary 增补

- **Layout_Mode**：布局模式枚举，至少包含 `side`（左右两栏，默认）、`top`（顶部导航 + 全宽内容）、`mix`（顶部导航 + 二级 sidebar）。
- **Visual_Mode**：视觉模式枚举，包含 `normal`（默认）、`weak`（色弱：CSS `filter: invert(80%) hue-rotate(180deg)` 简化方案）、`gray`（灰度：CSS `filter: grayscale(1)`）。
- **Lock_Screen**：屏幕锁定。锁定后整屏遮罩，需输入解锁密码（同当前用户登录密码）。
- **Watermark**：在主内容区右下角铺设的低透明度水印。

#### Acceptance Criteria

1. THE Layout_Module SHALL 在 Header 增加齿轮图标，点击后从右侧弹出设置抽屉 `<SettingsDrawer>`。
2. THE SettingsDrawer SHALL 提供以下分组：
   - 「布局」：Layout_Mode 三选一；
   - 「主题」：复用已有主题切换 + 主色色板 + 视觉模式（normal / weak / gray）；
   - 「界面」：水印开关 + 水印文本输入；
   - 「安全」：「立即锁屏」按钮。
3. THE Layout_Module SHALL 将 Layout_Mode、Visual_Mode、水印设置一并持久化（key：`lva_app_layout`、`lva_app_visual`、`lva_app_watermark`）。
4. WHEN 用户点击「立即锁屏」，THE Lock_Screen SHALL 全屏覆盖并隐藏现有内容；解锁需输入与当前用户密码相同的字符串（mock 校验：登录时把 `password` 临时缓存到 sessionStorage，登出时清除）。
5. WHEN 视觉模式切换为 `weak` 或 `gray`，THE Layout_Module SHALL 在 `<html>` 根节点添加对应类名 `.visual-weak` / `.visual-gray`，CSS 利用 `filter` 实现整体效果。
6. WHEN 水印开关开启且文本非空，THE Watermark SHALL 在主内容区铺设由 canvas 生成的重复水印。
7. THE Layout_Module SHALL 在视口宽度 < 768px 时锁定 Layout_Mode 为 `side`，避免 `top` / `mix` 在小屏挤压。

### Requirement 23: 通用 Hooks 与字典

**User Story:** 作为业务开发者，我希望脚手架提供一组开箱即用的复合 Hook，让分页表格、字典渲染、ID 回显、文件下载这些重复逻辑只写一次。

#### Acceptance Criteria

1. THE Scaffold SHALL 提供 `useTable<T>(loader: (params) => Promise<PageResult<T>>, options?)`：返回 `{ list, total, loading, page, pageSize, query, search, reset, refresh, remove }`，并在 page/pageSize/query 变化时自动重载。
2. THE Scaffold SHALL 提供 `useDict(code: string)`：返回 `{ items, label }`；`label(value)` 回显字典中的中文名；首次调用时拉取 `/api/dict/:code` 并写入内存缓存（属于 Request_Cache 同源）。
3. THE Scaffold SHALL 提供 `useEcho<T>(loader, idField)`：批量 id 通过同一次接口聚合查询，避免 N+1；常用于表格列展示用户/角色名称。
4. THE Scaffold SHALL 提供 `useDownload()`：包装文件下载（Blob → a 链接），支持自定义文件名与进度回调。
5. THE Scaffold SHALL 在 mock 中提供 `/api/dict/:code` 的至少两类字典：`status`（启用/禁用）、`menuType`（目录/菜单/按钮）。

### Requirement 24: 文件上传与 Excel 导入 / 导出

**User Story:** 作为业务开发者，我希望脚手架内置统一的上传组件与列表导出 / 导入能力。

#### Acceptance Criteria

1. THE Scaffold SHALL 提供 `<FileUpload>` 组件，包装 `<lay-upload>` 并扩展：分片上传开关、文件大小限制、扩展名白名单、上传进度回调；底层使用 `http.post` 并自动附加 `Content-Type: multipart/form-data`。
2. THE Scaffold SHALL 提供 `exportExcel(rows, columns, fileName)` 工具，基于 `xlsx` 包；列定义复用 `PageTableColumn` 结构。
3. THE Scaffold SHALL 提供 `importExcel(file, schema)` 工具：返回 `{ rows, errors }`；错误数组按行号列出字段级问题。
4. THE User_Module 列表页 SHALL 提供「导出」按钮（导出当前筛选的全量结果）作为该能力的演示。
