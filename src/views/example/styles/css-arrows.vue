<script setup lang="ts">
/**
 * CSS 样式展示 / styles/css-arrows
 *
 * 展示各种 CSS 箭头/三角形/特殊形状的样式代码
 * - Tabs 切换分类：箭头方向 / 气泡箭头 / 特殊形状 / 动画效果
 * - 每个样式卡片：预览 + CSS 代码 + HTML 代码 + 复制按钮
 */
import { ref } from 'vue'
import { layer } from '@layui/layui-vue'

type TabId = 'arrows' | 'bubbles' | 'shapes' | 'animations'
const activeTab = ref<TabId>('arrows')

interface StyleItem {
  name: string
  html: string
  css: string
}

async function onCopy(text: string, type: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    layer.msg(`${type} 复制成功 ✓`, { icon: 1 })
  } catch {
    layer.msg('复制失败，请手动复制', { icon: 2 })
  }
}

// ===== 箭头方向 =====
const arrows: StyleItem[] = [
  { name: '向上箭头', html: '<div class="arrow-up"></div>',
    css: `.arrow-up {\n  width: 0;\n  height: 0;\n  border-left: 10px solid transparent;\n  border-right: 10px solid transparent;\n  border-bottom: 14px solid #16baaa;\n}` },
  { name: '向下箭头', html: '<div class="arrow-down"></div>',
    css: `.arrow-down {\n  width: 0;\n  height: 0;\n  border-left: 10px solid transparent;\n  border-right: 10px solid transparent;\n  border-top: 14px solid #16baaa;\n}` },
  { name: '向左箭头', html: '<div class="arrow-left"></div>',
    css: `.arrow-left {\n  width: 0;\n  height: 0;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  border-right: 14px solid #16baaa;\n}` },
  { name: '向右箭头', html: '<div class="arrow-right"></div>',
    css: `.arrow-right {\n  width: 0;\n  height: 0;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  border-left: 14px solid #16baaa;\n}` },
  { name: '左上箭头', html: '<div class="arrow-top-left"></div>',
    css: `.arrow-top-left {\n  width: 0;\n  height: 0;\n  border-top: 14px solid #16baaa;\n  border-right: 14px solid transparent;\n}` },
  { name: '右上箭头', html: '<div class="arrow-top-right"></div>',
    css: `.arrow-top-right {\n  width: 0;\n  height: 0;\n  border-top: 14px solid #16baaa;\n  border-left: 14px solid transparent;\n}` },
  { name: '左下箭头', html: '<div class="arrow-bottom-left"></div>',
    css: `.arrow-bottom-left {\n  width: 0;\n  height: 0;\n  border-bottom: 14px solid #16baaa;\n  border-right: 14px solid transparent;\n}` },
  { name: '右下箭头', html: '<div class="arrow-bottom-right"></div>',
    css: `.arrow-bottom-right {\n  width: 0;\n  height: 0;\n  border-bottom: 14px solid #16baaa;\n  border-left: 14px solid transparent;\n}` },
  { name: 'V形箭头(向下)', html: '<div class="chevron-down"></div>',
    css: `.chevron-down {\n  width: 12px;\n  height: 12px;\n  border-right: 3px solid #16baaa;\n  border-bottom: 3px solid #16baaa;\n  transform: rotate(45deg);\n}` },
  { name: 'V形箭头(向右)', html: '<div class="chevron-right"></div>',
    css: `.chevron-right {\n  width: 12px;\n  height: 12px;\n  border-right: 3px solid #16baaa;\n  border-bottom: 3px solid #16baaa;\n  transform: rotate(-45deg);\n}` },
]

// ===== 气泡箭头 =====
const bubbles: StyleItem[] = [
  { name: '上方气泡', html: '<div class="bubble bubble-top">提示内容</div>',
    css: `.bubble {\n  position: relative;\n  background: #16baaa;\n  color: #fff;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-size: 13px;\n}\n.bubble-top::after {\n  content: '';\n  position: absolute;\n  bottom: -8px;\n  left: 50%;\n  transform: translateX(-50%);\n  border-left: 8px solid transparent;\n  border-right: 8px solid transparent;\n  border-top: 8px solid #16baaa;\n}` },
  { name: '下方气泡', html: '<div class="bubble bubble-bottom">提示内容</div>',
    css: `.bubble-bottom::after {\n  content: '';\n  position: absolute;\n  top: -8px;\n  left: 50%;\n  transform: translateX(-50%);\n  border-left: 8px solid transparent;\n  border-right: 8px solid transparent;\n  border-bottom: 8px solid #16baaa;\n}` },
  { name: '左侧气泡', html: '<div class="bubble bubble-left">提示内容</div>',
    css: `.bubble-left::after {\n  content: '';\n  position: absolute;\n  right: -8px;\n  top: 50%;\n  transform: translateY(-50%);\n  border-top: 8px solid transparent;\n  border-bottom: 8px solid transparent;\n  border-left: 8px solid #16baaa;\n}` },
  { name: '右侧气泡', html: '<div class="bubble bubble-right">提示内容</div>',
    css: `.bubble-right::after {\n  content: '';\n  position: absolute;\n  left: -8px;\n  top: 50%;\n  transform: translateY(-50%);\n  border-top: 8px solid transparent;\n  border-bottom: 8px solid transparent;\n  border-right: 8px solid #16baaa;\n}` },
]

// ===== 特殊形状 =====
const shapes: StyleItem[] = [
  { name: '圆形', html: '<div class="shape-circle"></div>',
    css: `.shape-circle {\n  width: 50px;\n  height: 50px;\n  background: #16baaa;\n  border-radius: 50%;\n}` },
  { name: '椭圆', html: '<div class="shape-oval"></div>',
    css: `.shape-oval {\n  width: 80px;\n  height: 50px;\n  background: #16baaa;\n  border-radius: 50%;\n}` },
  { name: '五角星', html: '<div class="shape-star"></div>',
    css: `.shape-star {\n  width: 0;\n  height: 0;\n  border-left: 25px solid transparent;\n  border-right: 25px solid transparent;\n  border-bottom: 18px solid #16baaa;\n  position: relative;\n}\n.shape-star::after {\n  content: '';\n  position: absolute;\n  top: 6px;\n  left: -25px;\n  width: 0;\n  height: 0;\n  border-left: 25px solid transparent;\n  border-right: 25px solid transparent;\n  border-top: 18px solid #16baaa;\n}` },
  { name: '心形', html: '<div class="shape-heart"></div>',
    css: `.shape-heart {\n  width: 50px;\n  height: 45px;\n  position: relative;\n}\n.shape-heart::before,\n.shape-heart::after {\n  content: '';\n  position: absolute;\n  top: 0;\n  width: 26px;\n  height: 40px;\n  background: #ff5722;\n  border-radius: 26px 26px 0 0;\n}\n.shape-heart::before {\n  left: 25px;\n  transform: rotate(-45deg);\n  transform-origin: 0 100%;\n}\n.shape-heart::after {\n  left: 0;\n  transform: rotate(45deg);\n  transform-origin: 100% 100%;\n}` },
  { name: '菱形', html: '<div class="shape-diamond"></div>',
    css: `.shape-diamond {\n  width: 40px;\n  height: 40px;\n  background: #16baaa;\n  transform: rotate(45deg);\n}` },
  { name: '平行四边形', html: '<div class="shape-parallelogram"></div>',
    css: `.shape-parallelogram {\n  width: 80px;\n  height: 40px;\n  background: #16baaa;\n  transform: skew(-20deg);\n}` },
  { name: '梯形', html: '<div class="shape-trapezoid"></div>',
    css: `.shape-trapezoid {\n  width: 0;\n  height: 0;\n  border-bottom: 40px solid #16baaa;\n  border-left: 20px solid transparent;\n  border-right: 20px solid transparent;\n  width: 60px;\n}` },
  { name: '六边形', html: '<div class="shape-hexagon"></div>',
    css: `.shape-hexagon {\n  width: 60px;\n  height: 34px;\n  background: #16baaa;\n  position: relative;\n}\n.shape-hexagon::before,\n.shape-hexagon::after {\n  content: '';\n  position: absolute;\n  width: 0;\n  border-left: 30px solid transparent;\n  border-right: 30px solid transparent;\n}\n.shape-hexagon::before {\n  top: -17px;\n  border-bottom: 17px solid #16baaa;\n}\n.shape-hexagon::after {\n  bottom: -17px;\n  border-top: 17px solid #16baaa;\n}` },
]

// ===== 动画效果 =====
const animations: StyleItem[] = [
  { name: '脉冲动画', html: '<div class="anim-pulse"></div>',
    css: `.anim-pulse {\n  width: 40px;\n  height: 40px;\n  background: #16baaa;\n  border-radius: 50%;\n  animation: pulse 1.5s infinite;\n}\n@keyframes pulse {\n  0% { transform: scale(1); opacity: 1; }\n  50% { transform: scale(1.3); opacity: 0.5; }\n  100% { transform: scale(1); opacity: 1; }\n}` },
  { name: '旋转加载', html: '<div class="anim-spin"></div>',
    css: `.anim-spin {\n  width: 30px;\n  height: 30px;\n  border: 3px solid #f0f0f0;\n  border-top: 3px solid #16baaa;\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n}\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}` },
  { name: '弹跳动画', html: '<div class="anim-bounce"></div>',
    css: `.anim-bounce {\n  width: 30px;\n  height: 30px;\n  background: #ff5722;\n  border-radius: 50%;\n  animation: bounce 0.6s infinite alternate;\n}\n@keyframes bounce {\n  to { transform: translateY(-20px); }\n}` },
  { name: '闪烁动画', html: '<div class="anim-blink">NEW</div>',
    css: `.anim-blink {\n  display: inline-block;\n  padding: 4px 10px;\n  background: #ff5722;\n  color: #fff;\n  border-radius: 4px;\n  font-size: 12px;\n  animation: blink 1s infinite;\n}\n@keyframes blink {\n  0%, 100% { opacity: 1; }\n  50% { opacity: 0.3; }\n}` },
  { name: '渐变边框', html: '<div class="anim-gradient-border">渐变</div>',
    css: `.anim-gradient-border {\n  padding: 12px 24px;\n  border-radius: 8px;\n  background: linear-gradient(#fff, #fff) padding-box,\n    linear-gradient(45deg, #16baaa, #ff5722, #a855f7, #16baaa) border-box;\n  border: 3px solid transparent;\n  animation: gradient-rotate 3s linear infinite;\n  background-size: 100% 100%, 300% 300%;\n}\n@keyframes gradient-rotate {\n  0% { background-position: 0 0, 0% 50%; }\n  50% { background-position: 0 0, 100% 50%; }\n  100% { background-position: 0 0, 0% 50%; }\n}` },
  { name: '打字机效果', html: '<div class="anim-typing">Hello World</div>',
    css: `.anim-typing {\n  font-family: monospace;\n  font-size: 16px;\n  overflow: hidden;\n  white-space: nowrap;\n  border-right: 2px solid #16baaa;\n  width: 11ch;\n  animation: typing 2s steps(11) infinite, blink-caret 0.5s step-end infinite alternate;\n}\n@keyframes typing {\n  from { width: 0; }\n  to { width: 11ch; }\n}\n@keyframes blink-caret {\n  50% { border-color: transparent; }\n}` },
]
</script>

<template>
  <div class="lva-css">
    <h2>CSS 样式集合</h2>
    <p class="lva-css__desc">常用 CSS 箭头、气泡、形状、动画的代码片段，点击复制即可使用。</p>

    <lay-tab v-model="activeTab">
      <lay-tab-item title="🔺 箭头方向" id="arrows" />
      <lay-tab-item title="💬 气泡箭头" id="bubbles" />
      <lay-tab-item title="⬟ 特殊形状" id="shapes" />
      <lay-tab-item title="✨ 动画效果" id="animations" />
    </lay-tab>

    <div class="lva-css__grid">
      <template v-if="activeTab === 'arrows'">
        <div v-for="item in arrows" :key="item.name" class="lva-css__card">
          <div class="lva-css__preview"><div v-html="item.html" :style="item.css.replace(/\.[^{]+\{/g, '').replace(/\}/g, '').replace(/\n/g, '')" /></div>
          <div class="lva-css__name">{{ item.name }}</div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>CSS</span><button @click="onCopy(item.css, 'CSS')">复制</button></div>
            <pre class="lva-css__code">{{ item.css }}</pre>
          </div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>HTML</span><button @click="onCopy(item.html, 'HTML')">复制</button></div>
            <pre class="lva-css__code lva-css__code--html">{{ item.html }}</pre>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'bubbles'">
        <div v-for="item in bubbles" :key="item.name" class="lva-css__card">
          <div class="lva-css__preview"><div v-html="item.html" /></div>
          <div class="lva-css__name">{{ item.name }}</div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>CSS</span><button @click="onCopy(item.css, 'CSS')">复制</button></div>
            <pre class="lva-css__code">{{ item.css }}</pre>
          </div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>HTML</span><button @click="onCopy(item.html, 'HTML')">复制</button></div>
            <pre class="lva-css__code lva-css__code--html">{{ item.html }}</pre>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'shapes'">
        <div v-for="item in shapes" :key="item.name" class="lva-css__card">
          <div class="lva-css__preview"><div v-html="item.html" /></div>
          <div class="lva-css__name">{{ item.name }}</div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>CSS</span><button @click="onCopy(item.css, 'CSS')">复制</button></div>
            <pre class="lva-css__code">{{ item.css }}</pre>
          </div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>HTML</span><button @click="onCopy(item.html, 'HTML')">复制</button></div>
            <pre class="lva-css__code lva-css__code--html">{{ item.html }}</pre>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'animations'">
        <div v-for="item in animations" :key="item.name" class="lva-css__card">
          <div class="lva-css__preview"><div v-html="item.html" /></div>
          <div class="lva-css__name">{{ item.name }}</div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>CSS</span><button @click="onCopy(item.css, 'CSS')">复制</button></div>
            <pre class="lva-css__code">{{ item.css }}</pre>
          </div>
          <div class="lva-css__code-section">
            <div class="lva-css__code-header"><span>HTML</span><button @click="onCopy(item.html, 'HTML')">复制</button></div>
            <pre class="lva-css__code lva-css__code--html">{{ item.html }}</pre>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.lva-css { padding: 16px; }
.lva-css h2 { margin: 0 0 4px; font-size: 20px; color: #333; }
.lva-css__desc { margin: 0 0 16px; color: #888; font-size: 13px; }
.lva-css__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 16px; }
.lva-css__card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; }
.lva-css__preview { display: flex; align-items: center; justify-content: center; min-height: 80px; padding: 20px; background: #f9fafb; border-bottom: 1px solid #f0f0f0; }
.lva-css__name { padding: 10px 14px; font-size: 14px; font-weight: 600; color: #333; border-bottom: 1px solid #f5f5f5; }
.lva-css__code-section { padding: 0; }
.lva-css__code-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 14px; background: #f8f9fa; border-bottom: 1px solid #f0f0f0; }
.lva-css__code-header span { font-size: 12px; font-weight: 600; color: #666; }
.lva-css__code-header button { padding: 3px 10px; border: 1px solid #e5e7eb; border-radius: 4px; background: #fff; font-size: 11px; color: #16baaa; cursor: pointer; transition: all 0.2s; }
.lva-css__code-header button:hover { background: #16baaa; color: #fff; border-color: #16baaa; }
.lva-css__code { margin: 0; padding: 10px 14px; font-size: 12px; font-family: ui-monospace, 'SF Mono', monospace; color: #333; background: #fafafa; overflow-x: auto; white-space: pre-wrap; word-break: break-all; line-height: 1.6; border-bottom: 1px solid #f0f0f0; }
.lva-css__code--html { background: #f0faf8; color: #0d6e5e; }

/* 实际渲染的箭头样式 */
:deep(.arrow-up) { width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 14px solid #16baaa; }
:deep(.arrow-down) { width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 14px solid #16baaa; }
:deep(.arrow-left) { width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 14px solid #16baaa; }
:deep(.arrow-right) { width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 14px solid #16baaa; }
:deep(.arrow-top-left) { width: 0; height: 0; border-top: 14px solid #16baaa; border-right: 14px solid transparent; }
:deep(.arrow-top-right) { width: 0; height: 0; border-top: 14px solid #16baaa; border-left: 14px solid transparent; }
:deep(.arrow-bottom-left) { width: 0; height: 0; border-bottom: 14px solid #16baaa; border-right: 14px solid transparent; }
:deep(.arrow-bottom-right) { width: 0; height: 0; border-bottom: 14px solid #16baaa; border-left: 14px solid transparent; }
:deep(.chevron-down) { width: 12px; height: 12px; border-right: 3px solid #16baaa; border-bottom: 3px solid #16baaa; transform: rotate(45deg); }
:deep(.chevron-right) { width: 12px; height: 12px; border-right: 3px solid #16baaa; border-bottom: 3px solid #16baaa; transform: rotate(-45deg); }
/* 气泡 */
:deep(.bubble) { position: relative; background: #16baaa; color: #fff; padding: 8px 16px; border-radius: 6px; font-size: 13px; }
:deep(.bubble-top)::after { content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #16baaa; }
:deep(.bubble-bottom)::after { content: ''; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid #16baaa; }
:deep(.bubble-left)::after { content: ''; position: absolute; right: -8px; top: 50%; transform: translateY(-50%); border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 8px solid #16baaa; }
:deep(.bubble-right)::after { content: ''; position: absolute; left: -8px; top: 50%; transform: translateY(-50%); border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-right: 8px solid #16baaa; }
/* 形状 */
:deep(.shape-circle) { width: 50px; height: 50px; background: #16baaa; border-radius: 50%; }
:deep(.shape-oval) { width: 80px; height: 50px; background: #16baaa; border-radius: 50%; }
:deep(.shape-diamond) { width: 40px; height: 40px; background: #16baaa; transform: rotate(45deg); }
:deep(.shape-parallelogram) { width: 80px; height: 40px; background: #16baaa; transform: skew(-20deg); }
:deep(.shape-star) { width: 0; height: 0; border-left: 25px solid transparent; border-right: 25px solid transparent; border-bottom: 18px solid #16baaa; position: relative; }
:deep(.shape-star)::after { content: ''; position: absolute; top: 6px; left: -25px; width: 0; height: 0; border-left: 25px solid transparent; border-right: 25px solid transparent; border-top: 18px solid #16baaa; }
:deep(.shape-heart) { width: 50px; height: 45px; position: relative; }
:deep(.shape-heart)::before, :deep(.shape-heart)::after { content: ''; position: absolute; top: 0; width: 26px; height: 40px; background: #ff5722; border-radius: 26px 26px 0 0; }
:deep(.shape-heart)::before { left: 25px; transform: rotate(-45deg); transform-origin: 0 100%; }
:deep(.shape-heart)::after { left: 0; transform: rotate(45deg); transform-origin: 100% 100%; }
:deep(.shape-hexagon) { width: 60px; height: 34px; background: #16baaa; position: relative; }
:deep(.shape-hexagon)::before, :deep(.shape-hexagon)::after { content: ''; position: absolute; width: 0; border-left: 30px solid transparent; border-right: 30px solid transparent; }
:deep(.shape-hexagon)::before { top: -17px; border-bottom: 17px solid #16baaa; }
:deep(.shape-hexagon)::after { bottom: -17px; border-top: 17px solid #16baaa; }
:deep(.shape-trapezoid) { width: 60px; height: 0; border-bottom: 40px solid #16baaa; border-left: 20px solid transparent; border-right: 20px solid transparent; }
/* 动画 */
:deep(.anim-pulse) { width: 40px; height: 40px; background: #16baaa; border-radius: 50%; animation: pulse 1.5s infinite; }
:deep(.anim-spin) { width: 30px; height: 30px; border: 3px solid #f0f0f0; border-top: 3px solid #16baaa; border-radius: 50%; animation: spin 0.8s linear infinite; }
:deep(.anim-bounce) { width: 30px; height: 30px; background: #ff5722; border-radius: 50%; animation: bounce 0.6s infinite alternate; }
:deep(.anim-blink) { display: inline-block; padding: 4px 10px; background: #ff5722; color: #fff; border-radius: 4px; font-size: 12px; animation: blink 1s infinite; }
:deep(.anim-gradient-border) { padding: 12px 24px; border-radius: 8px; background: linear-gradient(#fff, #fff) padding-box, linear-gradient(45deg, #16baaa, #ff5722, #a855f7, #16baaa) border-box; border: 3px solid transparent; font-size: 14px; }
:deep(.anim-typing) { font-family: monospace; font-size: 16px; overflow: hidden; white-space: nowrap; border-right: 2px solid #16baaa; width: 11ch; animation: typing 2s steps(11) infinite, blink-caret 0.5s step-end infinite alternate; }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bounce { to { transform: translateY(-20px); } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes typing { from { width: 0; } to { width: 11ch; } }
@keyframes blink-caret { 50% { border-color: transparent; } }
</style>
