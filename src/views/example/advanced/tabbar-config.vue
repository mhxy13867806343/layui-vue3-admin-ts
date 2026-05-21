<script setup lang="ts">
/**
 * 底部导航配置 / advanced/tabbar-config
 *
 * - 左侧：配置面板（导航项管理 + 全局设置 + 预设模板）
 * - 右侧：手机外壳实时预览 TabBar 效果
 */
import { ref, computed } from 'vue'
import { layer } from '@layui/layui-vue'

interface TabBarItem {
  id: number
  icon: string
  label: string
  badge: number
  activeColor: string
}

interface GlobalSettings {
  bgColor: string
  inactiveColor: string
  fontSize: number
}

let idSeq = 100

const DEFAULT_ITEMS: TabBarItem[] = [
  { id: 1, icon: 'layui-icon-home', label: '首页', badge: 0, activeColor: '#16baaa' },
  { id: 2, icon: 'layui-icon-template-1', label: '分类', badge: 0, activeColor: '#16baaa' },
  { id: 3, icon: 'layui-icon-dialogue', label: '消息', badge: 3, activeColor: '#16baaa' },
  { id: 4, icon: 'layui-icon-username', label: '我的', badge: 0, activeColor: '#16baaa' },
]

const items = ref<TabBarItem[]>(JSON.parse(JSON.stringify(DEFAULT_ITEMS)))
const activeIndex = ref(0)
const globalSettings = ref<GlobalSettings>({
  bgColor: '#ffffff',
  inactiveColor: '#999999',
  fontSize: 12,
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

function addItem(): void {
  if (!canAdd.value) {
    layer.msg('最多添加 5 个导航项', { icon: 2 })
    return
  }
  idSeq++
  items.value.push({
    id: idSeq,
    icon: 'layui-icon-star',
    label: '新标签',
    badge: 0,
    activeColor: '#16baaa',
  })
  layer.msg('已添加导航项', { icon: 1 })
}

function removeItem(index: number): void {
  if (!canRemove.value) {
    layer.msg('至少保留 2 个导航项', { icon: 2 })
    return
  }
  items.value.splice(index, 1)
  if (activeIndex.value >= items.value.length) {
    activeIndex.value = items.value.length - 1
  }
  layer.msg('已删除', { icon: 1 })
}

function moveUp(index: number): void {
  if (index <= 0) return
  const temp = items.value[index]
  items.value[index] = items.value[index - 1]
  items.value[index - 1] = temp
  items.value = [...items.value]
  if (activeIndex.value === index) activeIndex.value = index - 1
  else if (activeIndex.value === index - 1) activeIndex.value = index
}

function moveDown(index: number): void {
  if (index >= items.value.length - 1) return
  const temp = items.value[index]
  items.value[index] = items.value[index + 1]
  items.value[index + 1] = temp
  items.value = [...items.value]
  if (activeIndex.value === index) activeIndex.value = index + 1
  else if (activeIndex.value === index + 1) activeIndex.value = index
}

function onTabClick(index: number): void {
  activeIndex.value = index
}

// 预设模板
interface Preset {
  name: string
  items: Omit<TabBarItem, 'id'>[]
  settings: GlobalSettings
}

const PRESETS: Preset[] = [
  {
    name: '电商',
    items: [
      { icon: 'layui-icon-home', label: '首页', badge: 0, activeColor: '#ff5722' },
      { icon: 'layui-icon-template-1', label: '分类', badge: 0, activeColor: '#ff5722' },
      { icon: 'layui-icon-cart-simple', label: '购物车', badge: 2, activeColor: '#ff5722' },
      { icon: 'layui-icon-username', label: '我的', badge: 0, activeColor: '#ff5722' },
    ],
    settings: { bgColor: '#ffffff', inactiveColor: '#999999', fontSize: 12 },
  },
  {
    name: '社交',
    items: [
      { icon: 'layui-icon-dialogue', label: '消息', badge: 5, activeColor: '#1e88e5' },
      { icon: 'layui-icon-friends', label: '联系人', badge: 0, activeColor: '#1e88e5' },
      { icon: 'layui-icon-find-fill', label: '发现', badge: 0, activeColor: '#1e88e5' },
      { icon: 'layui-icon-username', label: '我', badge: 0, activeColor: '#1e88e5' },
    ],
    settings: { bgColor: '#ffffff', inactiveColor: '#999999', fontSize: 12 },
  },
  {
    name: '工具',
    items: [
      { icon: 'layui-icon-home', label: '主页', badge: 0, activeColor: '#16baaa' },
      { icon: 'layui-icon-set', label: '工具', badge: 0, activeColor: '#16baaa' },
      { icon: 'layui-icon-username', label: '我的', badge: 0, activeColor: '#16baaa' },
    ],
    settings: { bgColor: '#f5f5f5', inactiveColor: '#aaaaaa', fontSize: 11 },
  },
  {
    name: '新闻',
    items: [
      { icon: 'layui-icon-read', label: '头条', badge: 0, activeColor: '#d32f2f' },
      { icon: 'layui-icon-video', label: '视频', badge: 0, activeColor: '#d32f2f' },
      { icon: 'layui-icon-location', label: '本地', badge: 0, activeColor: '#d32f2f' },
      { icon: 'layui-icon-username', label: '我的', badge: 0, activeColor: '#d32f2f' },
    ],
    settings: { bgColor: '#ffffff', inactiveColor: '#999999', fontSize: 12 },
  },
  {
    name: '音乐',
    items: [
      { icon: 'layui-icon-find-fill', label: '发现', badge: 0, activeColor: '#e91e63' },
      { icon: 'layui-icon-radio', label: '播客', badge: 0, activeColor: '#e91e63' },
      { icon: 'layui-icon-username', label: '我的', badge: 0, activeColor: '#e91e63' },
      { icon: 'layui-icon-friends', label: '社区', badge: 0, activeColor: '#e91e63' },
      { icon: 'layui-icon-search', label: '搜索', badge: 0, activeColor: '#e91e63' },
    ],
    settings: { bgColor: '#1a1a1a', inactiveColor: '#888888', fontSize: 11 },
  },
]

function applyPreset(preset: Preset): void {
  idSeq += preset.items.length
  items.value = preset.items.map((item, i) => ({ ...item, id: idSeq - preset.items.length + i }))
  globalSettings.value = { ...preset.settings }
  activeIndex.value = 0
  layer.msg(`已应用「${preset.name}」模板`, { icon: 1 })
}

const activeItem = computed(() => items.value[activeIndex.value])
</script>

<template>
  <div class="lva-tabbar-config">
    <!-- 预设模板 -->
    <div class="lva-tabbar-config__presets">
      <span class="lva-tabbar-config__presets-label">预设模板：</span>
      <button
        v-for="p in PRESETS"
        :key="p.name"
        class="lva-tabbar-config__preset-btn"
        @click="applyPreset(p)"
      >{{ p.name }}</button>
    </div>

    <div class="lva-tabbar-config__body">
      <!-- 左侧配置面板 -->
      <div class="lva-tabbar-config__panel">
        <lay-card>
          <template #title>导航项配置</template>
          <div class="lva-tabbar-config__panel-content">
            <lay-button type="primary" size="sm" :disabled="!canAdd" @click="addItem">
              <i class="layui-icon layui-icon-add-1" /> 添加导航项
            </lay-button>

            <div class="lva-tabbar-config__items">
              <div
                v-for="(item, idx) in items"
                :key="item.id"
                class="lva-tabbar-config__item-card"
              >
                <div class="lva-tabbar-config__item-header">
                  <span class="lva-tabbar-config__item-index">#{{ idx + 1 }}</span>
                  <div class="lva-tabbar-config__item-actions">
                    <button
                      class="lva-tabbar-config__icon-btn"
                      :disabled="idx === 0"
                      title="上移"
                      @click="moveUp(idx)"
                    ><i class="layui-icon layui-icon-up" /></button>
                    <button
                      class="lva-tabbar-config__icon-btn"
                      :disabled="idx === items.length - 1"
                      title="下移"
                      @click="moveDown(idx)"
                    ><i class="layui-icon layui-icon-down" /></button>
                    <button
                      class="lva-tabbar-config__icon-btn lva-tabbar-config__icon-btn--danger"
                      :disabled="!canRemove"
                      title="删除"
                      @click="removeItem(idx)"
                    ><i class="layui-icon layui-icon-delete" /></button>
                  </div>
                </div>
                <div class="lva-tabbar-config__item-fields">
                  <div class="lva-tabbar-config__field">
                    <label>图标</label>
                    <lay-input v-model="item.icon" placeholder="layui-icon-home" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>标签</label>
                    <lay-input v-model="item.label" placeholder="标签文字" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>徽标</label>
                    <lay-input-number v-model="item.badge" :min="0" :max="99" size="sm" />
                  </div>
                  <div class="lva-tabbar-config__field">
                    <label>激活颜色</label>
                    <input type="color" v-model="item.activeColor" class="lva-tabbar-config__color-input" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </lay-card>

        <lay-card style="margin-top: 16px">
          <template #title>全局设置</template>
          <div class="lva-tabbar-config__global">
            <div class="lva-tabbar-config__field">
              <label>背景色</label>
              <input type="color" v-model="globalSettings.bgColor" class="lva-tabbar-config__color-input" />
            </div>
            <div class="lva-tabbar-config__field">
              <label>未激活颜色</label>
              <input type="color" v-model="globalSettings.inactiveColor" class="lva-tabbar-config__color-input" />
            </div>
            <div class="lva-tabbar-config__field">
              <label>字体大小：{{ globalSettings.fontSize }}px</label>
              <lay-slider v-model="globalSettings.fontSize" :min="10" :max="16" :step="1" />
            </div>
          </div>
        </lay-card>
      </div>

      <!-- 右侧手机预览 -->
      <div class="lva-tabbar-config__preview">
        <div class="lva-phone">
          <!-- 状态栏 -->
          <div class="lva-phone__status">
            <span class="lva-phone__time">{{ currentTime }}</span>
            <div class="lva-phone__status-icons">
              <i class="layui-icon layui-icon-cellphone-fine" />
              <i class="layui-icon layui-icon-website" />
              <span class="lva-phone__battery">
                <span class="lva-phone__battery-fill" />
              </span>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="lva-phone__content">
            <div class="lva-phone__content-placeholder">
              <i :class="['layui-icon', activeItem?.icon]" style="font-size: 48px; color: #ddd" />
              <p>{{ activeItem?.label }} 页面内容</p>
            </div>
          </div>

          <!-- TabBar -->
          <div class="lva-phone__tabbar" :style="{ background: globalSettings.bgColor }">
            <div
              v-for="(item, idx) in items"
              :key="item.id"
              class="lva-phone__tabbar-item"
              :style="{
                color: idx === activeIndex ? item.activeColor : globalSettings.inactiveColor,
                fontSize: globalSettings.fontSize + 'px',
              }"
              @click="onTabClick(idx)"
            >
              <div class="lva-phone__tabbar-icon-wrap">
                <i :class="['layui-icon', item.icon]" />
                <span v-if="item.badge > 0" class="lva-phone__tabbar-badge">{{ item.badge > 99 ? '99+' : item.badge }}</span>
              </div>
              <span class="lva-phone__tabbar-label">{{ item.label }}</span>
            </div>
          </div>

          <!-- 底部安全区 -->
          <div class="lva-phone__safe-area" :style="{ background: globalSettings.bgColor }">
            <span class="lva-phone__home-bar" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-tabbar-config {
  padding: 16px;
}

.lva-tabbar-config__presets {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
}
.lva-tabbar-config__presets-label { font-size: 13px; color: #555; font-weight: 500; }
.lva-tabbar-config__preset-btn {
  padding: 6px 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #555;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.lva-tabbar-config__preset-btn:hover {
  border-color: #16baaa;
  color: #16baaa;
}

.lva-tabbar-config__body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.lva-tabbar-config__panel {
  flex: 1;
  min-width: 0;
}

.lva-tabbar-config__panel-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.lva-tabbar-config__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lva-tabbar-config__item-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
}

.lva-tabbar-config__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.lva-tabbar-config__item-index {
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.lva-tabbar-config__item-actions {
  display: flex;
  gap: 4px;
}

.lva-tabbar-config__icon-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}
.lva-tabbar-config__icon-btn:hover:not(:disabled) {
  border-color: #16baaa;
  color: #16baaa;
}
.lva-tabbar-config__icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.lva-tabbar-config__icon-btn--danger:hover:not(:disabled) {
  border-color: #ff5722;
  color: #ff5722;
}

.lva-tabbar-config__item-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.lva-tabbar-config__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lva-tabbar-config__field > label {
  font-size: 12px;
  color: #888;
}

.lva-tabbar-config__color-input {
  width: 100%;
  height: 32px;
  padding: 2px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
}

.lva-tabbar-config__global {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

/* 手机预览 */
.lva-tabbar-config__preview {
  flex-shrink: 0;
  position: sticky;
  top: 20px;
}

.lva-phone {
  width: 390px;
  border-radius: 36px;
  background: #1a1a1a;
  padding: 6px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.lva-phone__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.lva-phone__status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.lva-phone__battery {
  display: inline-block;
  width: 22px;
  height: 11px;
  border: 1px solid #fff;
  border-radius: 3px;
  position: relative;
  margin-left: 2px;
}
.lva-phone__battery::after {
  content: '';
  position: absolute;
  top: 3px;
  right: -3px;
  width: 2px;
  height: 5px;
  background: #fff;
  border-radius: 0 1px 1px 0;
}
.lva-phone__battery-fill {
  display: block;
  width: 80%;
  height: 100%;
  background: #4ade80;
  border-radius: 2px;
}

.lva-phone__content {
  flex: 1;
  min-height: 520px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lva-phone__content-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #bbb;
  font-size: 14px;
}
.lva-phone__content-placeholder p {
  margin: 0;
}

.lva-phone__tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0 4px;
  border-top: 1px solid #eee;
}

.lva-phone__tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px 8px;
  user-select: none;
}
.lva-phone__tabbar-item .layui-icon {
  font-size: 22px;
}

.lva-phone__tabbar-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lva-phone__tabbar-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  text-align: center;
  font-weight: 500;
}

.lva-phone__tabbar-label {
  font-size: inherit;
}

.lva-phone__safe-area {
  padding: 8px 0 12px;
  text-align: center;
}
.lva-phone__home-bar {
  display: block;
  width: 130px;
  height: 4px;
  background: #333;
  border-radius: 2px;
  margin: 0 auto;
}
</style>
