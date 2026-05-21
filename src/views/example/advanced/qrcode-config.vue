<script setup lang="ts">
/**
 * 二维码配置 / advanced/qrcode-config
 *
 * - 左侧：内容、尺寸、容错级别、前景色、背景色、边距、装饰边框、Logo、自定义标题/描述
 * - 右侧：实时预览（卡片框+二维码+下载/复制/重置按钮）
 * - 顶部预设：简约 / 商务 / 渐变 / 节日 / 卡通
 */
import { onMounted, ref, watch, nextTick } from 'vue'
import { layer } from '@layui/layui-vue'
import QRCode from 'qrcode'

type BorderStyle = '无' | '简单' | '渐变' | '卡通'
type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

interface Preset {
  name: string
  fg: string
  bg: string
  border: BorderStyle
}

const PRESETS: Preset[] = [
  { name: '简约', fg: '#000000', bg: '#ffffff', border: '无' },
  { name: '商务', fg: '#1f2937', bg: '#f9fafb', border: '简单' },
  { name: '渐变', fg: '#16baaa', bg: '#ffffff', border: '渐变' },
  { name: '节日', fg: '#dc2626', bg: '#fef9c3', border: '简单' },
  { name: '卡通', fg: '#7c3aed', bg: '#fdf2f8', border: '卡通' },
]

// 默认值
const DEFAULTS = {
  content: 'https://github.com/mhxy13867806343/layui-vue3-admin-ts',
  size: 280,
  level: 'M' as ErrorLevel,
  fg: '#000000',
  bg: '#ffffff',
  margin: 4,
  border: '无' as BorderStyle,
  logoUrl: '',
  logoSize: 60,
  title: 'Layui Vue3 Admin',
  description: '扫码访问项目仓库',
}

const content = ref(DEFAULTS.content)
const size = ref(DEFAULTS.size)
const level = ref<ErrorLevel>(DEFAULTS.level)
const fg = ref(DEFAULTS.fg)
const bg = ref(DEFAULTS.bg)
const margin = ref(DEFAULTS.margin)
const border = ref<BorderStyle>(DEFAULTS.border)
const logoUrl = ref(DEFAULTS.logoUrl)
const logoSize = ref(DEFAULTS.logoSize)
const title = ref(DEFAULTS.title)
const description = ref(DEFAULTS.description)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderTimer: ReturnType<typeof setTimeout> | null = null

async function render(): Promise<void> {
  if (!canvasRef.value) return
  if (!content.value.trim()) {
    const ctx = canvasRef.value.getContext('2d')
    canvasRef.value.width = size.value
    canvasRef.value.height = size.value
    ctx?.clearRect(0, 0, size.value, size.value)
    return
  }
  try {
    await QRCode.toCanvas(canvasRef.value, content.value, {
      width: size.value,
      margin: margin.value,
      errorCorrectionLevel: level.value,
      color: { dark: fg.value, light: bg.value },
    })
    // 绘制 Logo
    if (logoUrl.value) {
      await drawLogo()
    }
  } catch (err) {
    console.warn('QR 生成失败：', err)
  }
}

function drawLogo(): Promise<void> {
  return new Promise((resolve) => {
    const canvas = canvasRef.value
    if (!canvas) return resolve()
    const ctx = canvas.getContext('2d')
    if (!ctx) return resolve()
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const half = logoSize.value / 2
      // 白色圆角背景
      const padding = 6
      ctx.fillStyle = '#fff'
      const r = 8
      const x = cx - half - padding
      const y = cy - half - padding
      const w = logoSize.value + padding * 2
      const h = logoSize.value + padding * 2
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
      ctx.fill()
      // 绘制 Logo 图片
      ctx.drawImage(img, cx - half, cy - half, logoSize.value, logoSize.value)
      resolve()
    }
    img.onerror = () => resolve()
    img.src = logoUrl.value
  })
}

function scheduleRender(): void {
  if (renderTimer) clearTimeout(renderTimer)
  renderTimer = setTimeout(() => {
    void render()
  }, 200)
}

watch(
  [content, size, level, fg, bg, margin, logoUrl, logoSize],
  () => scheduleRender(),
  { deep: false },
)

function applyPreset(p: Preset): void {
  fg.value = p.fg
  bg.value = p.bg
  border.value = p.border
  layer.msg(`已应用「${p.name}」预设`, { icon: 1 })
}

function onDownload(): void {
  if (!canvasRef.value) return
  const url = canvasRef.value.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `qrcode-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  layer.msg('已下载 PNG', { icon: 1 })
}

async function onCopy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(content.value)
    layer.msg('已复制内容到剪贴板', { icon: 1 })
  } catch {
    layer.msg('复制失败，请检查浏览器权限', { icon: 2 })
  }
}

function onReset(): void {
  content.value = DEFAULTS.content
  size.value = DEFAULTS.size
  level.value = DEFAULTS.level
  fg.value = DEFAULTS.fg
  bg.value = DEFAULTS.bg
  margin.value = DEFAULTS.margin
  border.value = DEFAULTS.border
  logoUrl.value = DEFAULTS.logoUrl
  logoSize.value = DEFAULTS.logoSize
  title.value = DEFAULTS.title
  description.value = DEFAULTS.description
  layer.msg('已重置为默认值', { icon: 1 })
}

onMounted(() => {
  void nextTick(() => render())
})
</script>

<template>
  <div class="lva-qr-config">
    <!-- 预设 -->
    <div class="lva-qr-config__presets">
      <span class="lva-qr-config__presets-label">快速预设：</span>
      <button
        v-for="p in PRESETS"
        :key="p.name"
        class="lva-qr-config__preset"
        @click="applyPreset(p)"
      >{{ p.name }}</button>
    </div>

    <lay-row :space="16">
      <!-- 配置面板 -->
      <lay-col :md="12">
        <lay-card>
          <template #title>配置</template>
          <div class="lva-qr-config__form">
            <div class="lva-qr-config__field">
              <label>内容</label>
              <lay-textarea v-model="content" :rows="3" placeholder="请输入二维码内容（URL 或文本）" />
            </div>
            <div class="lva-qr-config__field">
              <label>尺寸：{{ size }}px</label>
              <lay-slider v-model="size" :min="100" :max="500" :step="10" />
            </div>
            <div class="lva-qr-config__field">
              <label>容错级别</label>
              <lay-select v-model="level" style="width: 100%">
                <lay-select-option value="L" label="L（约 7%）" />
                <lay-select-option value="M" label="M（约 15%）" />
                <lay-select-option value="Q" label="Q（约 25%）" />
                <lay-select-option value="H" label="H（约 30%）" />
              </lay-select>
            </div>
            <div class="lva-qr-config__row">
              <div class="lva-qr-config__field">
                <label>前景色</label>
                <input type="color" v-model="fg" class="lva-qr-config__color" />
              </div>
              <div class="lva-qr-config__field">
                <label>背景色</label>
                <input type="color" v-model="bg" class="lva-qr-config__color" />
              </div>
            </div>
            <div class="lva-qr-config__field">
              <label>边距：{{ margin }}</label>
              <lay-slider v-model="margin" :min="0" :max="20" :step="1" />
            </div>
            <div class="lva-qr-config__field">
              <label>装饰边框样式</label>
              <lay-select v-model="border" style="width: 100%">
                <lay-select-option value="无" label="无" />
                <lay-select-option value="简单" label="简单边框" />
                <lay-select-option value="渐变" label="渐变边框" />
                <lay-select-option value="卡通" label="卡通装饰" />
              </lay-select>
            </div>
            <div class="lva-qr-config__field">
              <label>中心 Logo URL（可选）</label>
              <lay-input v-model="logoUrl" placeholder="https://example.com/logo.png" />
            </div>
            <div v-if="logoUrl" class="lva-qr-config__field">
              <label>Logo 大小：{{ logoSize }}px</label>
              <lay-slider v-model="logoSize" :min="30" :max="120" :step="2" />
            </div>
            <div class="lva-qr-config__field">
              <label>自定义标题（卡片）</label>
              <lay-input v-model="title" placeholder="标题（如品牌名）" />
            </div>
            <div class="lva-qr-config__field">
              <label>自定义描述（卡片）</label>
              <lay-input v-model="description" placeholder="一句话描述" />
            </div>
          </div>
        </lay-card>
      </lay-col>

      <!-- 预览面板 -->
      <lay-col :md="12">
        <lay-card>
          <template #title>预览</template>
          <div class="lva-qr-preview-wrap">
            <div :class="['lva-qr-preview', `lva-qr-preview--${border}`]">
              <span v-if="border === '卡通'" class="lva-qr-preview__deco lva-qr-preview__deco--tl">✨</span>
              <span v-if="border === '卡通'" class="lva-qr-preview__deco lva-qr-preview__deco--tr">🎉</span>
              <span v-if="border === '卡通'" class="lva-qr-preview__deco lva-qr-preview__deco--bl">💖</span>
              <span v-if="border === '卡通'" class="lva-qr-preview__deco lva-qr-preview__deco--br">⭐</span>
              <div class="lva-qr-preview__inner">
                <div v-if="title" class="lva-qr-preview__title">{{ title }}</div>
                <canvas ref="canvasRef" />
                <div v-if="description" class="lva-qr-preview__desc">{{ description }}</div>
              </div>
            </div>

            <div class="lva-qr-preview__actions">
              <lay-button type="primary" @click="onDownload">下载 PNG</lay-button>
              <lay-button @click="onCopy">复制链接</lay-button>
              <lay-button @click="onReset">重置</lay-button>
            </div>
          </div>
        </lay-card>
      </lay-col>
    </lay-row>
  </div>
</template>

<style scoped>
.lva-qr-config { padding: 16px; }
.lva-qr-config__presets {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
}
.lva-qr-config__presets-label { font-size: 13px; color: #555; font-weight: 500; }
.lva-qr-config__preset {
  padding: 6px 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #555;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.lva-qr-config__preset:hover {
  border-color: #16baaa;
  color: #16baaa;
}

.lva-qr-config__form { display: flex; flex-direction: column; gap: 16px; padding: 12px 4px; }
.lva-qr-config__field { display: flex; flex-direction: column; gap: 6px; }
.lva-qr-config__field > label { font-size: 13px; color: #555; }
.lva-qr-config__row { display: flex; gap: 16px; }
.lva-qr-config__row .lva-qr-config__field { flex: 1; }
.lva-qr-config__color {
  width: 100%;
  height: 36px;
  padding: 2px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
}

.lva-qr-preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.lva-qr-preview {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lva-qr-preview__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.lva-qr-preview__title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.lva-qr-preview__desc {
  font-size: 13px;
  color: #888;
}

.lva-qr-preview--简单 {
  border: 2px solid #16baaa;
}
.lva-qr-preview--渐变 {
  padding: 4px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f7b733);
}
.lva-qr-preview--渐变 .lva-qr-preview__inner {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.lva-qr-preview--卡通 {
  border: 2px dashed #ffd700;
  background: #fffbeb;
}
.lva-qr-preview__deco {
  position: absolute;
  font-size: 22px;
}
.lva-qr-preview__deco--tl { top: -10px; left: -10px; }
.lva-qr-preview__deco--tr { top: -10px; right: -10px; }
.lva-qr-preview__deco--bl { bottom: -10px; left: -10px; }
.lva-qr-preview__deco--br { bottom: -10px; right: -10px; }

.lva-qr-preview__actions {
  display: flex;
  gap: 10px;
}
</style>
