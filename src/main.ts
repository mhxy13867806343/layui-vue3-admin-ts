import { createApp } from 'vue'
import LayuiVue from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'
import 'nprogress/nprogress.css'
import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import { setupDirectives } from '@/directives'
import { setupErrorHandler } from '@/utils/error-handler'
import { applyTheme, applyPrimaryColor } from '@/utils/theme'
import { storage } from '@/utils/storage'
import { syncInitialVisual } from '@/store/modules/app'
import { i18n } from '@/locales'
import './styles/index.scss'

// 启动前同步主题与主色，避免首屏闪烁
const initialTheme = storage.get<'light' | 'dark'>('app_theme') ?? 'light'
const initialPrimary = storage.get<string>('app_primary') ?? '#16baaa'
applyTheme(initialTheme)
applyPrimaryColor(initialPrimary)
syncInitialVisual()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(LayuiVue)
setupDirectives(app)
setupErrorHandler(app)
app.mount('#app')
