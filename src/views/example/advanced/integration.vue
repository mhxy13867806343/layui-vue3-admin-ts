<script setup lang="ts">
/**
 * 第三方库集成指南
 *
 * 展示在 Vue 3 项目中如何集成和使用各种第三方库的最佳实践。
 */
import { ref } from 'vue'

type TabKey = 'vue' | 'state' | 'http' | 'ui' | 'utils' | 'build'
const activeTab = ref<TabKey>('vue')

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'vue', label: 'Vue 生态', icon: 'layui-icon-app' },
  { key: 'state', label: '状态管理', icon: 'layui-icon-template' },
  { key: 'http', label: '网络请求', icon: 'layui-icon-website' },
  { key: 'ui', label: 'UI 框架', icon: 'layui-icon-component' },
  { key: 'utils', label: '工具库', icon: 'layui-icon-code-circle' },
  { key: 'build', label: '构建工具', icon: 'layui-icon-set' },
]
</script>

<template>
  <div class="lva-integ">
    <h2>第三方库集成指南</h2>
    <p class="lva-integ__desc">展示在 Vue 3 + TypeScript 项目中如何集成和使用各种第三方库的最佳实践。</p>

    <!-- Tab 导航 -->
    <div class="lva-integ__tabs">
      <span v-for="t in tabs" :key="t.key" class="lva-integ__tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
        <i class="layui-icon" :class="t.icon" /> {{ t.label }}
      </span>
    </div>

    <!-- Vue 生态 -->
    <section v-show="activeTab === 'vue'" class="lva-integ__content">
      <div class="lva-integ__lib">
        <h3>Vue Router 4</h3>
        <p class="lva-integ__intro">Vue 官方路由管理器，支持动态路由、路由守卫、懒加载。</p>
        <pre class="lva-integ__code">// 安装
npm install vue-router@4

// main.ts
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})
app.use(router)

// 组合式 API 使用
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
router.push('/dashboard')</pre>
      </div>
      <div class="lva-integ__lib">
        <h3>Vue I18n 9</h3>
        <p class="lva-integ__intro">国际化方案，支持组合式 API、按需加载语言包。</p>
        <pre class="lva-integ__code">// 安装
npm install vue-i18n@9

// locales/index.ts
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
export const i18n = createI18n({
  locale: 'zh-CN',
  messages: { 'zh-CN': zhCN, 'en-US': enUS }
})

// 组件中使用
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// 模板中: {{ t('auth.loginTitle') }}</pre>
      </div>
    </section>

    <!-- 状态管理 -->
    <section v-show="activeTab === 'state'" class="lva-integ__content">
      <div class="lva-integ__lib">
        <h3>Pinia</h3>
        <p class="lva-integ__intro">Vue 官方推荐的状态管理库，替代 Vuex。支持 TypeScript、组合式 API、DevTools。</p>
        <pre class="lva-integ__code">// 安装
npm install pinia

// store/modules/user.ts
import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => ({ token: '', userInfo: null }),
  actions: {
    async login(payload) {
      const res = await http.post('/auth/login', payload)
      this.token = res.token
    }
  }
})

// 组件中使用
const userStore = useUserStore()
await userStore.login({ username, password })</pre>
      </div>
    </section>

    <!-- 网络请求 -->
    <section v-show="activeTab === 'http'" class="lva-integ__content">
      <div class="lva-integ__lib">
        <h3>Axios</h3>
        <p class="lva-integ__intro">基于 Promise 的 HTTP 客户端，支持拦截器、取消请求、进度回调。</p>
        <pre class="lva-integ__code">// 安装
npm install axios

// utils/http/core.ts - 创建实例
import axios from 'axios'
export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

// 请求拦截器 - 注入 Token
instance.interceptors.request.use((config) => {
  const token = storage.get('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器 - 统一错误处理
instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) handleLogout()
    return Promise.reject(err)
  }
)</pre>
      </div>
    </section>

    <!-- UI 框架 -->
    <section v-show="activeTab === 'ui'" class="lva-integ__content">
      <div class="lva-integ__lib">
        <h3>layui-vue</h3>
        <p class="lva-integ__intro">layui 的 Vue 3 实现，提供丰富的企业级组件。</p>
        <pre class="lva-integ__code">// 安装
npm install @layui/layui-vue

// 按需引入（推荐，配合 unplugin）
npm install -D @layui/unplugin-vue-components

// vite.config.ts
import LayuiVueResolver from '@layui/unplugin-vue-components'
import Components from 'unplugin-vue-components/vite'
plugins: [
  Components({ resolvers: [LayuiVueResolver()] })
]

// 直接在模板中使用，无需手动 import
&lt;lay-button type="primary"&gt;按钮&lt;/lay-button&gt;
&lt;lay-table :columns="cols" :data-source="data" /&gt;</pre>
      </div>
      <div class="lva-integ__lib">
        <h3>ECharts + vue-echarts</h3>
        <p class="lva-integ__intro">按需引入 ECharts 图表，通过 vue-echarts 组件化使用。</p>
        <pre class="lva-integ__code">// 安装
npm install echarts vue-echarts

// 按需引入
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent])

// 模板中
import VChart from 'vue-echarts'
&lt;VChart :option="chartOption" autoresize /&gt;</pre>
      </div>
    </section>

    <!-- 工具库 -->
    <section v-show="activeTab === 'utils'" class="lva-integ__content">
      <div class="lva-integ__lib">
        <h3>lodash-es</h3>
        <p class="lva-integ__intro">ES Module 版本的 lodash，支持 tree-shaking，按需引入不增加包体积。</p>
        <pre class="lva-integ__code">// 安装（注意用 lodash-es 而非 lodash）
npm install lodash-es
npm install -D @types/lodash-es

// 按需引入（tree-shakeable）
import { debounce, throttle, cloneDeep } from 'lodash-es'

// 在 Vue 组件中使用防抖
const debouncedSearch = debounce((keyword: string) => {
  fetchResults(keyword)
}, 300)

// 在 onBeforeUnmount 中取消
onBeforeUnmount(() => debouncedSearch.cancel())</pre>
      </div>
      <div class="lva-integ__lib">
        <h3>Day.js</h3>
        <p class="lva-integ__intro">轻量级日期处理库（2KB），API 兼容 Moment.js。</p>
        <pre class="lva-integ__code">// 安装
npm install dayjs

// 使用
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

dayjs().format('YYYY-MM-DD HH:mm:ss')  // 2024-01-15 14:30:00
dayjs('2024-01-01').fromNow()           // 2 周前
dayjs().add(7, 'day').format('MM/DD')   // 01/22</pre>
      </div>
      <div class="lva-integ__lib">
        <h3>xlsx</h3>
        <p class="lva-integ__intro">纯前端 Excel 读写，支持 .xlsx/.xls/.csv 格式。</p>
        <pre class="lva-integ__code">// 安装
npm install xlsx

// 导出
import * as XLSX from 'xlsx'
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
// 触发下载...

// 解析
const wb = XLSX.read(arrayBuffer, { type: 'array' })
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])</pre>
      </div>
    </section>

    <!-- 构建工具 -->
    <section v-show="activeTab === 'build'" class="lva-integ__content">
      <div class="lva-integ__lib">
        <h3>Vite 5</h3>
        <p class="lva-integ__intro">下一代前端构建工具，极速冷启动、HMR、按需编译。</p>
        <pre class="lva-integ__code">// vite.config.ts 常用配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } }
  },
  build: {
    rollupOptions: {
      output: { manualChunks: { vue: ['vue', 'vue-router', 'pinia'] } }
    }
  }
})</pre>
      </div>
      <div class="lva-integ__lib">
        <h3>Vitest + fast-check</h3>
        <p class="lva-integ__intro">Vite 原生测试框架 + 属性测试（Property-Based Testing）。</p>
        <pre class="lva-integ__code">// 安装
npm install -D vitest @vue/test-utils fast-check jsdom

// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  }
})

// 属性测试示例
import fc from 'fast-check'
it('clearAuth always resets state', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    (token) => {
      store.token = token
      store.clearAuth()
      expect(store.token).toBe('')
    }
  ))
})</pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lva-integ { padding: 4px; }
.lva-integ h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-integ__desc { color: #666; font-size: 13px; margin-bottom: 16px; }

.lva-integ__tabs {
  display: flex; flex-wrap: wrap; gap: 0; margin-bottom: 16px;
  border-bottom: 1px solid #eee; padding-bottom: 0;
}
.lva-integ__tab {
  padding: 10px 16px; cursor: pointer; font-size: 13px; color: #666;
  border-bottom: 2px solid transparent; transition: all 0.2s;
  display: flex; align-items: center; gap: 6px;
}
.lva-integ__tab:hover { color: var(--global-primary-color, #16baaa); }
.lva-integ__tab.active { color: var(--global-primary-color, #16baaa); border-bottom-color: var(--global-primary-color, #16baaa); }

.lva-integ__content { display: flex; flex-direction: column; gap: 14px; }
.lva-integ__lib { background: #fff; padding: 20px 24px; border-radius: 4px; }
.lva-integ__lib h3 { font-size: 15px; font-weight: 600; margin: 0 0 6px; }
.lva-integ__intro { font-size: 13px; color: #666; margin: 0 0 12px; }
.lva-integ__code {
  background: #1e1e2e; color: #cdd6f4; padding: 16px 20px; border-radius: 6px;
  font-size: 12px; line-height: 1.6; overflow-x: auto; margin: 0; white-space: pre;
  font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
}

@media (max-width: 768px) {
  .lva-integ__tabs { overflow-x: auto; flex-wrap: nowrap; }
}
</style>
