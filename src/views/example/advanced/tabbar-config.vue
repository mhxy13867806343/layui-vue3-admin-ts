<script setup lang="ts">
/**
 * 底部导航配置 / advanced/tabbar-config
 *
 * 参考 Vant TabBar 组件的配置能力：
 * - 每项：icon(class/图片URL)、选中/未选中图标、标签、徽标、事件类型、路由路径
 * - 全局：visible、route模式、缓存、css/style、突出项、返回顶部
 * - 每项独立：css/style/index排序/缓存
 */
import { ref, computed, watch } from 'vue'
import { layer } from '@layui/layui-vue'

type IconType = 'class' | 'image'
type RouteMode = 'router' | 'switch'

interface TabBarItemConfig {
  id: number
  iconType: IconType
  icon: string
  activeIcon: string
  imageUrl: string
  activeImageUrl: string
  label: string
  badge: number
  activeColor: string
  eventType: string
  route: string
  scrollToTop: boolean
  raised: boolean
  cache: boolean
  index: number
  css: string
  style: string
}

interface GlobalConfig {
  visible: boolean
  routeMode: RouteMode
  cacheAll: boolean
  bgColor: string
  inactiveColor: string
  fontSize: number
  raisedIndex: number
  css: string
  style: string
}

let idSeq = 100

function createItem(overrides?: Partial<TabBarItemConfig>): TabBarItemConfig {
  idSeq++
  return {
    id: idSeq,
    iconType: 'class',
    icon: 'layui-icon-star',
    activeIcon: '',
    imageUrl: '',
    activeImageUrl: '',
    label: '新标签',
    badge: 0,
    activeColor: '#16baaa',
    eventType: 'navigate',
    route: '',
    scrollToTop: false,
    raised: false,
    cache: false,
    index: 0,
    css: '',
    style: '',
    ...overrides,
  }
}

const DEFAULT_ITEMS: TabBarItemConfig[] = [
  createItem({ id: 1, icon: 'layui-icon-home', label: '首页', route: 'pages/home/index', index: 0 }),
  createItem({ id: 2, icon: 'layui-icon-template-1', label: '分类', route: 'pages/category/index', index: 1 }),
  createItem({ id: 3, icon: 'layui-icon-dialogue', label: '消息', badge: 3, route: 'pages/message/index', index: 2 }),
  createItem({ id: 4, icon: 'layui-icon-username', label: '我的', route: 'pages/profile/index', index: 3 }),
]

const items = ref<TabBarItemConfig[]>(JSON.parse(JSON.stringify(DEFAULT_ITEMS)))
const activeIndex = ref(0)
const globalConfig = ref<GlobalConfig>({
  visible: true,
  routeMode: 'router',
  cacheAll: false,
  bgColor: '#ffffff',
  inactiveColor: '#999999',
  fontSize: 12,
  raisedIndex: -1,
  css: '',
  style: '',
})

const currentTime = ref('')
function updateTime(): void {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
updateTime()
setInterval(updateTime, 60_000)

const canAdd = computed(() => items.value.length < 5)
const canRemove = computed(() => items.value.length > 2)
const activeItem = computed(() => items.value[activeIndex.value])

function addItem(): void {
  if (!canAdd.value) { layer.msg('最多添加 5 个导航项', { icon: 2 }); return }
  items.value.push(createItem({ index: items.value.length }))
  layer.msg('已添加导航项', { icon: 1 })
}

function removeItem(index: number): void {
  if (!canRemove.value) { layer.msg('至少保留 2 个导航项', { icon: 2 }); return }
  items.value.splice(index, 1)
  if (activeIndex.value >= items.value.length) activeIndex.value = items.value.length - 1
  if (globalConfig.value.raisedIndex >= items.value.length) globalConfig.value.raisedIndex = -1
}

function moveUp(idx: number): void {
  if (idx <= 0) return
  const t = items.value[idx]; items.value[idx] = items.value[idx - 1]; items.value[idx - 1] = t
  items.value = [...items.value]
  if (activeIndex.value === idx) activeIndex.value = idx - 1
  else if (activeIndex.value === idx - 1) activeIndex.value = idx
}

function moveDown(idx: number): void {
  if (idx >= items.value.length - 1) return
  const t = items.value[idx]; items.value[idx] = items.value[idx + 1]; items.value[idx + 1] = t
  items.value = [...items.value]
  if (activeIndex.value === idx) activeIndex.value = idx + 1
  else if (activeIndex.value === idx + 1) activeIndex.value = idx
}

function onTabClick(idx: number): void {
  activeIndex.value = idx
  const item = items.value[idx]
  if (item.scrollToTop) layer.msg('已返回顶部 ↑', { icon: 1 })
  if (globalConfig.value.routeMode === 'router' && item.route) {
    layer.msg(`路由跳转: ${item.route}`, { icon: 0 })
  }
}

// 预设模板
interface Preset { name: string; items: Partial<TabBarItemConfig>[]; global: Partial<GlobalConfig> }
const PRESETS: Preset[] = [
  { name: '电商', items: [
    { icon: 'layui-icon-home', label: '首页', route: 'pages/home/index' },
    { icon: 'layui-icon-template-1', label: '分类', route: 'pages/category/index' },
    { icon: 'layui-icon-cart-simple', label: '购物车', badge: 2, raised: true, route: 'pages/cart/index' },
    { icon: 'layui-icon-username', label: '我的', route: 'pages/profile/index' },
  ], global: { bgColor: '#ffffff', inactiveColor: '#999', fontSize: 12, raisedIndex: 2 } },
  { name: '社交', items: [
    { icon: 'layui-icon-dialogue', label: '消息', badge: 5, route: 'pages/chat/index' },
    { icon: 'layui-icon-friends', label: '联系人', route: 'pages/contacts/index' },
    { icon: 'layui-icon-find-fill', label: '发现', route: 'pages/discover/index' },
    { icon: 'layui-icon-username', label: '我', route: 'pages/me/index' },
  ], global: { bgColor: '#ffffff', inactiveColor: '#999', fontSize: 12, raisedIndex: -1 } },
  { name: '工具', items: [
    { icon: 'layui-icon-home', label: '主页', route: 'pages/home/index' },
    { icon: 'layui-icon-set', label: '工具', route: 'pages/tools/index' },
    { icon: 'layui-icon-username', label: '我的', route: 'pages/me/index' },
  ], global: { bgColor: '#f5f5f5', inactiveColor: '#aaa', fontSize: 11, raisedIndex: -1 } },
  { name: '新闻', items: [
    { icon: 'layui-icon-read', label: '头条', route: 'pages/news/index' },
    { icon: 'layui-icon-video', label: '视频', route: 'pages/video/index' },
    { icon: 'layui-icon-location', label: '本地', route: 'pages/local/index' },
    { icon: 'layui-icon-username', label: '我的', route: 'pages/me/index' },
  ], global: { bgColor: '#fff', inactiveColor: '#999', fontSize: 12, raisedIndex: -1 } },
  { name: '音乐', items: [
    { icon: 'layui-icon-find-fill', label: '发现', route: 'pages/discover/index' },
    { icon: 'layui-icon-radio', label: '播客', route: 'pages/podcast/index' },
    { icon: 'layui-icon-username', label: '我的', route: 'pages/me/index' },
    { icon: 'layui-icon-friends', label: '社区', route: 'pages/community/index' },
    { icon: 'layui-icon-search', label: '搜索', route: 'pages/search/index' },
  ], global: { bgColor: '#1a1a1a', inactiveColor: '#888', fontSize: 11, raisedIndex: -1 } },
]

function applyPreset(p: Preset): void {
  items.value = p.items.map((item, i) => createItem({ ...item, index: i, activeColor: '#16baaa' }))
  globalConfig.value = { ...globalConfig.value, ...p.global }
  activeIndex.value = 0
  layer.msg(`已应用「${p.name}」模板`, { icon: 1 })
}

// 生成配置 JSON
const configJson = computed(() => {
  return JSON.stringify({
    global: {
      visible: globalConfig.value.visible,
      routeMode: globalConfig.value.routeMode,
      cacheAll: globalConfig.value.cacheAll,
      raisedIndex: globalConfig.value.raisedIndex,
      css: globalConfig.value.css || undefined,
      style: globalConfig.value.style || undefined,
    },
    items: items.value.map((it, idx) => ({
      index: idx,
      icon: it.iconType === 'class' ? it.icon : it.imageUrl,
      activeIcon: it.iconType === 'class' ? (it.activeIcon || it.icon) : (it.activeImageUrl || it.imageUrl),
      label: it.label,
      badge: it.badge || undefined,
      route: it.route || undefined,
      scrollToTop: it.scrollToTop || undefined,
      raised: it.raised || undefined,
      cache: it.cache || undefined,
      css: it.css || undefined,
      style: it.style || undefined,
    })),
  }, null, 2)
})

function onCopyConfig(): void {
  navigator.clipboard.writeText(configJson.value).then(() => {
    layer.msg('配置 JSON 已复制', { icon: 1 })
  }).catch(() => { layer.msg('复制失败', { icon: 2 }) })
}

const EVENT_TYPES = [
  { label: '页面跳转', value: 'navigate' },
  { label: '重定向', value: 'redirect' },
  { label: '返回', value: 'back' },
  { label: '自定义事件', value: 'custom' },
]
</script>

<template>
  <div class="lva-tabbar-config">
    <!-- 预设 -->
    <div class="lva-tabbar-config__presets">
      <span class="lva-tabbar-config__presets-label">预设模板：</span>
      <button v-for="p in PRESETS" :key="p.name" class="lva-tabbar-config__preset-btn" @click="applyPreset(p)">{{ p.name }}</button>
    </div>

    <div class="lva-tabbar-config__body">
      <!-- 左侧配置 -->
      <div class="lva-tabbar-config__panel">
        <!-- 全局设置 -->
        <lay-card>
          <template #title>全局设置 (Global)</template>
          <div class="lva-tabbar-config__global">
            <div class="lva-tabbar-config__row2">
              <div class="lva-tabbar-config__field">
                <label>global.visible 是否展示</label>
                <lay-switch v-model="globalConfig.visible" />
              </div>
              <div class="lva-tabbar-config__field">
                <label>global.cacheAll 全缓存</label>
                <lay-switch v-model="globalConfig.cacheAll" />
              </div>
            </div>
            <div class="lva-tabbar-config__row2">
              <div class="lva-tabbar-config__field">
                <label>global.route 跳转模式</label>
                <lay-select v-model="globalConfig.routeMode" style="width:100%">
                  <lay-select-option value="router" label="路由模式 (pages/xxx)" />
                  <lay-select-option value="switch" label="切换模式 (组件切换)" />
                </lay-select>
              </div>
              <div class="lva-tabbar-config__field">
                <label>global.raisedIndex 突出项</label>
                <lay-select v-model="globalConfig.raisedIndex" style="width:100%">
                  <lay-select-option :value="-1" label="无突出" />
                  <lay-select-option v-for="(_, idx) in items" :key="idx" :value="idx" :label="`第 ${idx + 1} 项`" />
                </lay-select>
              </div>
            </div>
            <div class="lva-tabbar-config__row2">
              <div class="lva-tabbar-config__field">
                <label>背景色</label>
                <input type="color" v-model="globalConfig.bgColor" class="lva-tabbar-config__color" />
              </div>
              <div class="lva-tabbar-config__field">
                <label>未激活颜色</label>
                <input type="color" v-model="globalConfig.inactiveColor" class="lva-tabbar-config__color" />
              </div>
            </div>
            <div class="lva-tabbar-config__field">
              <label>字体大小：{{ globalConfig.fontSize }}px</label>
              <lay-slider v-model="globalConfig.fontSize" :min="10" :max="16" :step="1" />
            </div>
            <div class="lva-tabbar-config__field">
              <label>global.css（对象式，如 background-color:red;border:1px solid #ccc）</label>
              <lay-input v-model="globalConfig.css" placeholder="background-color:#fff;border-top:1px solid #eee" />
            </div>
            <div class="lva-tabbar-config__field">
              <label>global.style（行内样式字符串）</label>
              <lay-input v-model="globalConfig.style" placeholder="padding:8px 0;box-shadow:0 -2px 6px rgba(0,0,0,.05)" />
            </div>
          </div>
        </lay-card>

        <!-- 导航项配置 -->
        <lay-card style="margin-top:16px">
          <template #title>导航项配置（最少2个，最多5个）</template>
          <div class="lva-tabbar-config__panel-content">
            <lay-button type="primary" size="sm" :disabled="!canAdd" @click="addItem">
              <i class="layui-icon layui-icon-add-1" /> 添加导航项
            </lay-button>
            <div class="lva-tabbar-config__items">
              <div v-for="(item, idx) in items" :key="item.id" class="lva-tabbar-config__item-card">
                <div class="lva-tabbar-config__item-header">
                  <span class="lva-tabbar-config__item-index">#{{ idx + 1 }} {{ item.label }}</span>
                  <div class="lva-tabbar-config__item-actions">
                    <button class="lva-tabbar-config__icon-btn" :disabled="idx===0" @click="moveUp(idx)"><i class="layui-icon layui-icon-up" /></button>
                    <button class="lva-tabbar-config__icon-btn" :disabled="idx===items.length-1" @click="moveDown(idx)"><i class="layui-icon layui-icon-down" /></button>
                    <button class="lva-tabbar-config__icon-btn lva-tabbar-config__icon-btn--danger" :disabled="!canRemove" @click="removeItem(idx)"><i class="layui-icon layui-icon-delete" /></button>
                  </div>
                </div>
                <div class="lva-tabbar-config__item-fields">
                  <div class="lva-tabbar-config__field">
                    <label>图标类型</label>
                    <lay-select v-model="item.iconType" size="sm" style="width:100%">
                      <lay-select-option value="class" label="图标类名" />
                      <lay-select-option value="image" label="图片URL" />
                    </lay-select>
                  </div>
                  <div class="lva-tabbar-config__field" v-if="item.iconType==='class'">
                    <label>未选中图标</label>
                    <lay-input v-model="item.icon" placeholder="layui-icon-home" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field" v-if="item.iconType==='class'">
                    <label>选中图标（可空=同上）</label>
                    <lay-input v-model="item.activeIcon" placeholder="留空则同未选中" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field" v-if="item.iconType==='image'">
                    <label>未选中图片URL</label>
                    <lay-input v-model="item.imageUrl" placeholder="https://..." size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field" v-if="item.iconType==='image'">
                    <label>选中图片URL</label>
                    <lay-input v-model="item.activeImageUrl" placeholder="https://..." size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>标签文字</label>
                    <lay-input v-model="item.label" placeholder="首页" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>徽标数</label>
                    <lay-input-number v-model="item.badge" :min="0" :max="99" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>激活颜色</label>
                    <input type="color" v-model="item.activeColor" class="lva-tabbar-config__color" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>事件类型</label>
                    <lay-select v-model="item.eventType" size="sm" style="width:100%">
                      <lay-select-option v-for="e in EVENT_TYPES" :key="e.value" :value="e.value" :label="e.label" />
                    </lay-select>
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>路由路径 (pages/xxx/index)</label>
                    <lay-input v-model="item.route" placeholder="pages/home/index" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>点击返回顶部</label>
                    <lay-switch v-model="item.scrollToTop" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>是否突出</label>
                    <lay-switch v-model="item.raised" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>是否缓存</label>
                    <lay-switch v-model="item.cache" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>排序 index</label>
                    <lay-input-number v-model="item.index" :min="0" :max="items.length-1" size="sm" />
                  </div>
                </div>
                <div class="lva-tabbar-config__item-extra">
                  <div class="lva-tabbar-config__field">
                    <label>options.css（该项独立样式对象）</label>
                    <lay-input v-model="item.css" placeholder="font-weight:bold;opacity:0.9" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>options.style（该项行内样式）</label>
                    <lay-input v-model="item.style" placeholder="margin-top:-10px" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </lay-card>

        <!-- 配置输出 -->
        <lay-card style="margin-top:16px">
          <template #title>配置输出 (JSON)</template>
          <div class="lva-tabbar-config__output">
            <pre class="lva-tabbar-config__json">{{ configJson }}</pre>
            <lay-button type="primary" size="sm" @click="onCopyConfig">复制配置</lay-button>
          </div>
        </lay-card>
      </div>

      <!-- 右侧手机预览 -->
      <div class="lva-tabbar-config__preview">
        <div class="lva-phone" v-if="globalConfig.visible">
          <div class="lva-phone__status">
            <span>{{ currentTime }}</span>
            <div class="lva-phone__status-icons">
              <i class="layui-icon layui-icon-cellphone-fine" />
              <span class="lva-phone__battery"><span class="lva-phone__battery-fill" /></span>
            </div>
          </div>
          <div class="lva-phone__content">
            <div class="lva-phone__content-placeholder">
              <i v-if="activeItem?.iconType==='class'" :class="['layui-icon', activeItem?.icon]" style="font-size:48px;color:#ddd" />
              <img v-else-if="activeItem?.imageUrl" :src="activeItem.imageUrl" style="width:48px;height:48px;object-fit:contain" />
              <p>{{ activeItem?.label }} 页面</p>
              <p v-if="activeItem?.route" style="font-size:11px;color:#bbb">{{ activeItem.route }}</p>
              <p v-if="activeItem?.cache || globalConfig.cacheAll" style="font-size:11px;color:#16baaa">✓ 已缓存</p>
            </div>
          </div>
          <div class="lva-phone__tabbar" :style="[globalConfig.style, { background: globalConfig.bgColor }]">
            <div
              v-for="(item, idx) in items"
              :key="item.id"
              :class="['lva-phone__tabbar-item', { raised: idx === globalConfig.raisedIndex || item.raised }]"
              :style="[item.style, { color: idx === activeIndex ? item.activeColor : globalConfig.inactiveColor, fontSize: globalConfig.fontSize + 'px' }]"
              @click="onTabClick(idx)"
            >
              <div class="lva-phone__tabbar-icon-wrap">
                <template v-if="item.iconType==='class'">
                  <i :class="['layui-icon', idx === activeIndex ? (item.activeIcon || item.icon) : item.icon]" />
                </template>
                <template v-else>
                  <img :src="idx === activeIndex ? (item.activeImageUrl || item.imageUrl) : item.imageUrl" class="lva-phone__tabbar-img" />
                </template>
                <span v-if="item.badge > 0" class="lva-phone__tabbar-badge">{{ item.badge > 99 ? '99+' : item.badge }}</span>
              </div>
              <span class="lva-phone__tabbar-label">{{ item.label }}</span>
            </div>
          </div>
          <div class="lva-phone__safe-area" :style="{ background: globalConfig.bgColor }">
            <span class="lva-phone__home-bar" />
          </div>
        </div>
        <div v-else class="lva-phone lva-phone--hidden">
          <div class="lva-phone__content" style="min-height:600px">
            <div class="lva-phone__content-placeholder">
              <p>TabBar 已隐藏 (global.visible = false)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-tabbar-config { padding: 16px; }
.lva-tabbar-config__presets { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; }
.lva-tabbar-config__presets-label { font-size: 13px; color: #555; font-weight: 500; }
.lva-tabbar-config__preset-btn { padding: 6px 16px; border-radius: 16px; background: #fff; border: 1px solid #e5e7eb; color: #555; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.lva-tabbar-config__preset-btn:hover { border-color: #16baaa; color: #16baaa; }
.lva-tabbar-config__body { display: flex; gap: 24px; align-items: flex-start; }
.lva-tabbar-config__panel { flex: 1; min-width: 0; }
.lva-tabbar-config__panel-content { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
.lva-tabbar-config__items { display: flex; flex-direction: column; gap: 12px; }
.lva-tabbar-config__item-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fafafa; }
.lva-tabbar-config__item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.lva-tabbar-config__item-index { font-size: 13px; font-weight: 600; color: #333; }
.lva-tabbar-config__item-actions { display: flex; gap: 4px; }
.lva-tabbar-config__icon-btn { width: 28px; height: 28px; border: 1px solid #e5e7eb; border-radius: 4px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #666; transition: all 0.2s; }
.lva-tabbar-config__icon-btn:hover:not(:disabled) { border-color: #16baaa; color: #16baaa; }
.lva-tabbar-config__icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.lva-tabbar-config__icon-btn--danger:hover:not(:disabled) { border-color: #ff5722; color: #ff5722; }
.lva-tabbar-config__item-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.lva-tabbar-config__item-extra { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed #e5e7eb; padding-top: 8px; }
.lva-tabbar-config__field { display: flex; flex-direction: column; gap: 4px; }
.lva-tabbar-config__field > label { font-size: 11px; color: #888; }
.lva-tabbar-config__row2 { display: flex; gap: 12px; }
.lva-tabbar-config__row2 .lva-tabbar-config__field { flex: 1; }
.lva-tabbar-config__color { width: 100%; height: 32px; padding: 2px; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; }
.lva-tabbar-config__global { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
.lva-tabbar-config__output { display: flex; flex-direction: column; gap: 8px; }
.lva-tabbar-config__json { background: #1a1a2e; color: #4ade80; padding: 12px; border-radius: 6px; font-size: 12px; max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-all; margin: 0; }
/* 手机预览 */
.lva-tabbar-config__preview { flex-shrink: 0; position: sticky; top: 20px; }
.lva-phone { width: 390px; border-radius: 36px; background: #1a1a1a; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden; display: flex; flex-direction: column; }
.lva-phone--hidden { opacity: 0.5; }
.lva-phone__status { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 4px; color: #fff; font-size: 14px; font-weight: 600; }
.lva-phone__status-icons { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.lva-phone__battery { display: inline-block; width: 22px; height: 11px; border: 1px solid #fff; border-radius: 3px; position: relative; margin-left: 2px; }
.lva-phone__battery::after { content: ''; position: absolute; top: 3px; right: -3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
.lva-phone__battery-fill { display: block; width: 80%; height: 100%; background: #4ade80; border-radius: 2px; }
.lva-phone__content { flex: 1; min-height: 480px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
.lva-phone__content-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #bbb; font-size: 14px; }
.lva-phone__content-placeholder p { margin: 0; }
.lva-phone__tabbar { display: flex; justify-content: space-around; align-items: flex-end; padding: 8px 0 4px; border-top: 1px solid #eee; }
.lva-phone__tabbar-item { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; transition: all 0.2s; padding: 4px 8px; user-select: none; }
.lva-phone__tabbar-item.raised { transform: translateY(-12px); background: #fff; border-radius: 50% 50% 8px 8px; padding: 10px 12px 6px; box-shadow: 0 -4px 12px rgba(0,0,0,.1); }
.lva-phone__tabbar-item .layui-icon { font-size: 22px; }
.lva-phone__tabbar-icon-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.lva-phone__tabbar-img { width: 24px; height: 24px; object-fit: contain; }
.lva-phone__tabbar-badge { position: absolute; top: -6px; right: -10px; min-width: 16px; height: 16px; line-height: 16px; padding: 0 4px; border-radius: 8px; background: #ff4d4f; color: #fff; font-size: 10px; text-align: center; }
.lva-phone__tabbar-label { font-size: inherit; }
.lva-phone__safe-area { padding: 8px 0 12px; text-align: center; }
.lva-phone__home-bar { display: block; width: 130px; height: 4px; background: #333; border-radius: 2px; margin: 0 auto; }
</style>
