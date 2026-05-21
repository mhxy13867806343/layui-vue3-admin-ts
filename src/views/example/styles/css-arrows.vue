<script setup lang="ts">
/**
 * CSS 样式集合 / styles/css-arrows
 *
 * - Tabs 切换：箭头方向 / 气泡箭头 / 特殊形状 / 动画效果
 * - 顶部颜色选择器，修改后预览和代码同步更新
 * - 每个卡片：预览 + CSS + HTML + 复制按钮
 */
import { ref, computed } from 'vue'
import { layer } from '@layui/layui-vue'

type TabId = 'arrows' | 'bubbles' | 'shapes' | 'animations'
const activeTab = ref<TabId>('arrows')
const mainColor = ref('#16baaa')
const borderColor = ref('#333333')
const showBorder = ref(true)

interface StyleDef {
  name: string
  html: (color: string) => string
  css: (color: string) => string
}

async function onCopy(text: string, type: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    layer.msg(`${type} 复制成功 ✓`, { icon: 1 })
  } catch { layer.msg('复制失败', { icon: 2 }) }
}

// ===== 箭头 =====
const arrowDefs: StyleDef[] = [
  { name: '向上箭头', html: () => '<div class="arrow-up"></div>',
    css: (c) => `.arrow-up {\n  width: 0;\n  height: 0;\n  border-left: 10px solid transparent;\n  border-right: 10px solid transparent;\n  border-bottom: 14px solid ${c};\n}` },
  { name: '向下箭头', html: () => '<div class="arrow-down"></div>',
    css: (c) => `.arrow-down {\n  width: 0;\n  height: 0;\n  border-left: 10px solid transparent;\n  border-right: 10px solid transparent;\n  border-top: 14px solid ${c};\n}` },
  { name: '向左箭头', html: () => '<div class="arrow-left"></div>',
    css: (c) => `.arrow-left {\n  width: 0;\n  height: 0;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  border-right: 14px solid ${c};\n}` },
  { name: '向右箭头', html: () => '<div class="arrow-right"></div>',
    css: (c) => `.arrow-right {\n  width: 0;\n  height: 0;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  border-left: 14px solid ${c};\n}` },
  { name: '左上箭头', html: () => '<div class="arrow-tl"></div>',
    css: (c) => `.arrow-tl {\n  width: 0;\n  height: 0;\n  border-top: 14px solid ${c};\n  border-right: 14px solid transparent;\n}` },
  { name: '右上箭头', html: () => '<div class="arrow-tr"></div>',
    css: (c) => `.arrow-tr {\n  width: 0;\n  height: 0;\n  border-top: 14px solid ${c};\n  border-left: 14px solid transparent;\n}` },
  { name: '左下箭头', html: () => '<div class="arrow-bl"></div>',
    css: (c) => `.arrow-bl {\n  width: 0;\n  height: 0;\n  border-bottom: 14px solid ${c};\n  border-right: 14px solid transparent;\n}` },
  { name: '右下箭头', html: () => '<div class="arrow-br"></div>',
    css: (c) => `.arrow-br {\n  width: 0;\n  height: 0;\n  border-bottom: 14px solid ${c};\n  border-left: 14px solid transparent;\n}` },
  { name: 'V形(向下)', html: () => '<div class="chevron-down"></div>',
    css: (c) => `.chevron-down {\n  width: 12px;\n  height: 12px;\n  border-right: 3px solid ${c};\n  border-bottom: 3px solid ${c};\n  transform: rotate(45deg);\n}` },
  { name: 'V形(向右)', html: () => '<div class="chevron-right"></div>',
    css: (c) => `.chevron-right {\n  width: 12px;\n  height: 12px;\n  border-right: 3px solid ${c};\n  border-bottom: 3px solid ${c};\n  transform: rotate(-45deg);\n}` },
]

const bubbleDefs: StyleDef[] = [
  { name: '上方气泡', html: () => '<div class="bubble bubble-top">提示内容</div>',
    css: (c) => `.bubble {\n  position: relative;\n  background: ${c};\n  color: #fff;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-size: 13px;\n}\n.bubble-top::after {\n  content: '';\n  position: absolute;\n  bottom: -8px;\n  left: 50%;\n  transform: translateX(-50%);\n  border-left: 8px solid transparent;\n  border-right: 8px solid transparent;\n  border-top: 8px solid ${c};\n}` },
  { name: '下方气泡', html: () => '<div class="bubble bubble-bottom">提示内容</div>',
    css: (c) => `.bubble-bottom::after {\n  content: '';\n  position: absolute;\n  top: -8px;\n  left: 50%;\n  transform: translateX(-50%);\n  border-left: 8px solid transparent;\n  border-right: 8px solid transparent;\n  border-bottom: 8px solid ${c};\n}` },
  { name: '左侧气泡', html: () => '<div class="bubble bubble-left">提示内容</div>',
    css: (c) => `.bubble-left::after {\n  content: '';\n  position: absolute;\n  right: -8px;\n  top: 50%;\n  transform: translateY(-50%);\n  border-top: 8px solid transparent;\n  border-bottom: 8px solid transparent;\n  border-left: 8px solid ${c};\n}` },
  { name: '右侧气泡', html: () => '<div class="bubble bubble-right">提示内容</div>',
    css: (c) => `.bubble-right::after {\n  content: '';\n  position: absolute;\n  left: -8px;\n  top: 50%;\n  transform: translateY(-50%);\n  border-top: 8px solid transparent;\n  border-bottom: 8px solid transparent;\n  border-right: 8px solid ${c};\n}` },
  { name: '搜索栏指示器(下三角)', html: () => '<div class="indicator-search">去哪儿</div>',
    css: (c) => `/* 搜索栏下方指示三角，常用于"当前选中"标记 */\n.indicator-search {\n  position: relative;\n  background: ${c};\n  color: #fff;\n  padding: 16px 28px;\n  font-size: 16px;\n  border-radius: 4px;\n  display: inline-block;\n}\n.indicator-search::after {\n  content: '';\n  position: absolute;\n  bottom: -10px;\n  left: 50%;\n  transform: translateX(-50%);\n  border-left: 12px solid transparent;\n  border-right: 12px solid transparent;\n  border-top: 10px solid ${c};\n}` },
  { name: '指示三角(纯三角)', html: () => '<div class="indicator-only"></div>',
    css: (c) => `/* 单独的下三角指示器（不带气泡） */\n.indicator-only {\n  width: 0;\n  height: 0;\n  border-left: 12px solid transparent;\n  border-right: 12px solid transparent;\n  border-top: 12px solid ${c};\n}` },
  { name: '描边气泡(上)', html: () => '<div class="bubble-border bubble-border-top">描边气泡</div>',
    css: (c) => `.bubble-border {\n  position: relative;\n  background: #fff;\n  color: #333;\n  padding: 8px 16px;\n  border: 2px solid ${c};\n  border-radius: 6px;\n  font-size: 13px;\n}\n.bubble-border-top::before,\n.bubble-border-top::after {\n  content: '';\n  position: absolute;\n  left: 50%;\n  transform: translateX(-50%);\n  border-left: 8px solid transparent;\n  border-right: 8px solid transparent;\n}\n.bubble-border-top::before {\n  bottom: -10px;\n  border-top: 10px solid ${c};\n}\n.bubble-border-top::after {\n  bottom: -7px;\n  border-top: 8px solid #fff;\n}` },
]

const shapeDefs: StyleDef[] = [
  { name: '圆形', html: () => '<div class="s-circle"></div>', css: (c) => `.s-circle {\n  width: 50px;\n  height: 50px;\n  background: ${c};\n  border-radius: 50%;\n}` },
  { name: '椭圆', html: () => '<div class="s-oval"></div>', css: (c) => `.s-oval {\n  width: 80px;\n  height: 50px;\n  background: ${c};\n  border-radius: 50%;\n}` },
  { name: '菱形', html: () => '<div class="s-diamond"></div>', css: (c) => `.s-diamond {\n  width: 40px;\n  height: 40px;\n  background: ${c};\n  transform: rotate(45deg);\n}` },
  { name: '平行四边形', html: () => '<div class="s-para"></div>', css: (c) => `.s-para {\n  width: 80px;\n  height: 40px;\n  background: ${c};\n  transform: skew(-20deg);\n}` },
  { name: '六边形', html: () => '<div class="s-hex"></div>', css: (c) => `.s-hex {\n  width: 60px;\n  height: 34px;\n  background: ${c};\n  position: relative;\n}\n.s-hex::before,\n.s-hex::after {\n  content: '';\n  position: absolute;\n  width: 0;\n  border-left: 30px solid transparent;\n  border-right: 30px solid transparent;\n}\n.s-hex::before {\n  top: -17px;\n  border-bottom: 17px solid ${c};\n}\n.s-hex::after {\n  bottom: -17px;\n  border-top: 17px solid ${c};\n}` },
  { name: '心形', html: () => '<div class="s-heart"></div>', css: (c) => `.s-heart {\n  width: 50px;\n  height: 45px;\n  position: relative;\n}\n.s-heart::before,\n.s-heart::after {\n  content: '';\n  position: absolute;\n  top: 0;\n  width: 26px;\n  height: 40px;\n  background: ${c};\n  border-radius: 26px 26px 0 0;\n}\n.s-heart::before {\n  left: 25px;\n  transform: rotate(-45deg);\n  transform-origin: 0 100%;\n}\n.s-heart::after {\n  left: 0;\n  transform: rotate(45deg);\n  transform-origin: 100% 100%;\n}` },
]

const animDefs: StyleDef[] = [
  { name: '脉冲', html: () => '<div class="a-pulse"></div>', css: (c) => `.a-pulse {\n  width: 40px;\n  height: 40px;\n  background: ${c};\n  border-radius: 50%;\n  animation: pulse 1.5s infinite;\n}\n@keyframes pulse {\n  0% { transform: scale(1); opacity: 1; }\n  50% { transform: scale(1.3); opacity: 0.5; }\n  100% { transform: scale(1); opacity: 1; }\n}` },
  { name: '旋转加载', html: () => '<div class="a-spin"></div>', css: (c) => `.a-spin {\n  width: 30px;\n  height: 30px;\n  border: 3px solid #f0f0f0;\n  border-top: 3px solid ${c};\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n}\n@keyframes spin { to { transform: rotate(360deg); } }` },
  { name: '弹跳', html: () => '<div class="a-bounce"></div>', css: (c) => `.a-bounce {\n  width: 30px;\n  height: 30px;\n  background: ${c};\n  border-radius: 50%;\n  animation: bounce 0.6s infinite alternate;\n}\n@keyframes bounce { to { transform: translateY(-20px); } }` },
  { name: '打字机', html: () => '<div class="a-typing">Hello World</div>', css: (c) => `.a-typing {\n  font-family: monospace;\n  font-size: 16px;\n  overflow: hidden;\n  white-space: nowrap;\n  border-right: 2px solid ${c};\n  width: 11ch;\n  animation: typing 2s steps(11) infinite,\n    blink-caret 0.5s step-end infinite alternate;\n}\n@keyframes typing { from { width: 0; } to { width: 11ch; } }\n@keyframes blink-caret { 50% { border-color: transparent; } }` },
]

const currentDefs = computed(() => {
  if (activeTab.value === 'arrows') return arrowDefs
  if (activeTab.value === 'bubbles') return bubbleDefs
  if (activeTab.value === 'shapes') return shapeDefs
  return animDefs
})
</script>

<template>
  <div class="lva-css">
    <h2>CSS 样式集合</h2>
    <p class="lva-css__desc">常用 CSS 箭头、气泡、形状、动画代码片段。选择颜色后预览和代码同步更新，点击复制即可使用。</p>

    <!-- 颜色选择器 -->
    <div class="lva-css__color-bar">
      <div class="lva-css__color-group">
        <span>主题颜色：</span>
        <input type="color" v-model="mainColor" class="lva-css__color-picker" />
        <span class="lva-css__color-value">{{ mainColor }}</span>
      </div>
      <div class="lva-css__color-group">
        <span>边框：</span>
        <lay-switch v-model="showBorder" size="sm" />
        <input v-if="showBorder" type="color" v-model="borderColor" class="lva-css__color-picker" />
        <span v-if="showBorder" class="lva-css__color-value">{{ borderColor }}</span>
      </div>
      <div class="lva-css__color-presets">
        <span class="lva-css__preset-label">快选：</span>
        <span v-for="c in ['#16baaa','#ff5722','#1e9fff','#a855f7','#f59e0b','#ec4899','#333333','#07c160','#ffffff']" :key="c" class="lva-css__color-dot" :style="{ background: c, borderColor: c === '#ffffff' ? '#ddd' : 'transparent' }" :title="c" @click="mainColor = c" />
      </div>
    </div>

    <lay-tab v-model="activeTab">
      <lay-tab-item title="🔺 箭头方向" id="arrows" />
      <lay-tab-item title="💬 气泡箭头" id="bubbles" />
      <lay-tab-item title="⬟ 特殊形状" id="shapes" />
      <lay-tab-item title="✨ 动画效果" id="animations" />
    </lay-tab>

    <div class="lva-css__grid">
      <div v-for="item in currentDefs" :key="item.name" class="lva-css__card">
        <!-- 预览 -->
        <div class="lva-css__preview" :style="{ outline: showBorder ? `1px dashed ${borderColor}` : 'none' }" v-html="item.html(mainColor)" />
        <div class="lva-css__name">{{ item.name }}</div>
        <!-- CSS -->
        <div class="lva-css__code-section">
          <div class="lva-css__code-header"><span>CSS</span><button @click="onCopy(item.css(mainColor), 'CSS')">复制</button></div>
          <pre class="lva-css__code">{{ item.css(mainColor) }}</pre>
        </div>
        <!-- HTML -->
        <div class="lva-css__code-section">
          <div class="lva-css__code-header"><span>HTML</span><button @click="onCopy(item.html(mainColor), 'HTML')">复制</button></div>
          <pre class="lva-css__code lva-css__code--html">{{ item.html(mainColor) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-css { padding: 16px; }
.lva-css h2 { margin: 0 0 4px; font-size: 20px; color: #333; }
.lva-css__desc { margin: 0 0 16px; color: #888; font-size: 13px; }

.lva-css__color-bar { display: flex; align-items: center; gap: 20px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.lva-css__color-group { display: flex; align-items: center; gap: 8px; }
.lva-css__color-group > span:first-child { font-size: 13px; color: #555; font-weight: 500; }
.lva-css__color-picker { width: 40px; height: 32px; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; padding: 2px; background: #fff; }
.lva-css__color-value { font-size: 12px; color: #888; font-family: monospace; min-width: 60px; }
.lva-css__color-presets { display: flex; align-items: center; gap: 6px; }
.lva-css__preset-label { font-size: 12px; color: #888; }
.lva-css__color-dot { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; }
.lva-css__color-dot:hover { transform: scale(1.2); border-color: #16baaa !important; }

.lva-css__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
.lva-css__card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; }
.lva-css__preview { display: flex; align-items: center; justify-content: center; min-height: 80px; padding: 20px; background: #f9fafb; border-bottom: 1px solid #f0f0f0; }
.lva-css__name { padding: 10px 14px; font-size: 14px; font-weight: 600; color: #333; border-bottom: 1px solid #f5f5f5; }
.lva-css__code-section { }
.lva-css__code-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 14px; background: #f8f9fa; border-bottom: 1px solid #f0f0f0; }
.lva-css__code-header span { font-size: 12px; font-weight: 600; color: #666; }
.lva-css__code-header button { padding: 3px 10px; border: 1px solid #e5e7eb; border-radius: 4px; background: #fff; font-size: 11px; color: #16baaa; cursor: pointer; transition: all 0.2s; }
.lva-css__code-header button:hover { background: #16baaa; color: #fff; border-color: #16baaa; }
.lva-css__code { margin: 0; padding: 10px 14px; font-size: 12px; font-family: ui-monospace, monospace; color: #333; background: #fafafa; overflow-x: auto; white-space: pre-wrap; word-break: break-all; line-height: 1.6; border-bottom: 1px solid #f0f0f0; }
.lva-css__code--html { background: #f0faf8; color: #0d6e5e; }

/* 预览区实际渲染 */
:deep(.arrow-up) { width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 14px solid v-bind(mainColor); }
:deep(.arrow-down) { width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 14px solid v-bind(mainColor); }
:deep(.arrow-left) { width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 14px solid v-bind(mainColor); }
:deep(.arrow-right) { width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 14px solid v-bind(mainColor); }
:deep(.arrow-tl) { width: 0; height: 0; border-top: 14px solid v-bind(mainColor); border-right: 14px solid transparent; }
:deep(.arrow-tr) { width: 0; height: 0; border-top: 14px solid v-bind(mainColor); border-left: 14px solid transparent; }
:deep(.arrow-bl) { width: 0; height: 0; border-bottom: 14px solid v-bind(mainColor); border-right: 14px solid transparent; }
:deep(.arrow-br) { width: 0; height: 0; border-bottom: 14px solid v-bind(mainColor); border-left: 14px solid transparent; }
:deep(.chevron-down) { width: 12px; height: 12px; border-right: 3px solid v-bind(mainColor); border-bottom: 3px solid v-bind(mainColor); transform: rotate(45deg); }
:deep(.chevron-right) { width: 12px; height: 12px; border-right: 3px solid v-bind(mainColor); border-bottom: 3px solid v-bind(mainColor); transform: rotate(-45deg); }
:deep(.bubble) { position: relative; background: v-bind(mainColor); color: #fff; padding: 8px 16px; border-radius: 6px; font-size: 13px; }
:deep(.bubble-top)::after { content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid v-bind(mainColor); }
:deep(.bubble-bottom)::after { content: ''; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid v-bind(mainColor); }
:deep(.bubble-left)::after { content: ''; position: absolute; right: -8px; top: 50%; transform: translateY(-50%); border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 8px solid v-bind(mainColor); }
:deep(.bubble-right)::after { content: ''; position: absolute; left: -8px; top: 50%; transform: translateY(-50%); border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-right: 8px solid v-bind(mainColor); }
:deep(.indicator-search) { position: relative; background: v-bind(mainColor); color: #fff; padding: 16px 28px; font-size: 16px; border-radius: 4px; display: inline-block; }
:deep(.indicator-search)::after { content: ''; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 10px solid v-bind(mainColor); }
:deep(.indicator-only) { width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 12px solid v-bind(mainColor); }
:deep(.bubble-border) { position: relative; background: #fff; color: #333; padding: 8px 16px; border: 2px solid v-bind(mainColor); border-radius: 6px; font-size: 13px; }
:deep(.bubble-border-top)::before, :deep(.bubble-border-top)::after { content: ''; position: absolute; left: 50%; transform: translateX(-50%); border-left: 8px solid transparent; border-right: 8px solid transparent; }
:deep(.bubble-border-top)::before { bottom: -10px; border-top: 10px solid v-bind(mainColor); }
:deep(.bubble-border-top)::after { bottom: -7px; border-top: 8px solid #fff; }
:deep(.s-circle) { width: 50px; height: 50px; background: v-bind(mainColor); border-radius: 50%; }
:deep(.s-oval) { width: 80px; height: 50px; background: v-bind(mainColor); border-radius: 50%; }
:deep(.s-diamond) { width: 40px; height: 40px; background: v-bind(mainColor); transform: rotate(45deg); }
:deep(.s-para) { width: 80px; height: 40px; background: v-bind(mainColor); transform: skew(-20deg); }
:deep(.s-hex) { width: 60px; height: 34px; background: v-bind(mainColor); position: relative; }
:deep(.s-hex)::before, :deep(.s-hex)::after { content: ''; position: absolute; width: 0; border-left: 30px solid transparent; border-right: 30px solid transparent; }
:deep(.s-hex)::before { top: -17px; border-bottom: 17px solid v-bind(mainColor); }
:deep(.s-hex)::after { bottom: -17px; border-top: 17px solid v-bind(mainColor); }
:deep(.s-heart) { width: 50px; height: 45px; position: relative; }
:deep(.s-heart)::before, :deep(.s-heart)::after { content: ''; position: absolute; top: 0; width: 26px; height: 40px; background: v-bind(mainColor); border-radius: 26px 26px 0 0; }
:deep(.s-heart)::before { left: 25px; transform: rotate(-45deg); transform-origin: 0 100%; }
:deep(.s-heart)::after { left: 0; transform: rotate(45deg); transform-origin: 100% 100%; }
:deep(.a-pulse) { width: 40px; height: 40px; background: v-bind(mainColor); border-radius: 50%; animation: pulse 1.5s infinite; }
:deep(.a-spin) { width: 30px; height: 30px; border: 3px solid #f0f0f0; border-top: 3px solid v-bind(mainColor); border-radius: 50%; animation: spin 0.8s linear infinite; }
:deep(.a-bounce) { width: 30px; height: 30px; background: v-bind(mainColor); border-radius: 50%; animation: bounce 0.6s infinite alternate; }
:deep(.a-typing) { font-family: monospace; font-size: 16px; overflow: hidden; white-space: nowrap; border-right: 2px solid v-bind(mainColor); width: 11ch; animation: typing 2s steps(11) infinite, blink-caret 0.5s step-end infinite alternate; }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bounce { to { transform: translateY(-20px); } }
@keyframes typing { from { width: 0; } to { width: 11ch; } }
@keyframes blink-caret { 50% { border-color: transparent; } }
</style>
