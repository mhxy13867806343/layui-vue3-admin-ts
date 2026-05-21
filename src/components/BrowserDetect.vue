<template>
  <div v-if="showBanner" class="browser-detect-banner">
    <div class="browser-detect-content">
      <i class="layui-icon layui-icon-about" />
      <span class="browser-detect-text">为了更好的体验，建议使用 Chrome 或 Edge 浏览器</span>
      <div class="browser-detect-links">
        <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">下载 Chrome</a>
        <a href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer">下载 Edge</a>
      </div>
      <button class="browser-detect-close" @click="dismiss">
        <i class="layui-icon layui-icon-close" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const DISMISS_KEY = 'browser_detect_dismissed'
const showBanner = ref(false)

function isChomeOrEdge(): boolean {
  const ua = navigator.userAgent
  const isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua)
  const isEdge = /Edg\//.test(ua)
  return isChrome || isEdge
}

function dismiss() {
  showBanner.value = false
  sessionStorage.setItem(DISMISS_KEY, '1')
}

onMounted(() => {
  const dismissed = sessionStorage.getItem(DISMISS_KEY)
  if (!dismissed && !isChomeOrEdge()) {
    showBanner.value = true
  }
})
</script>

<style scoped>
.browser-detect-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border-bottom: 1px solid #f0c040;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.browser-detect-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.browser-detect-content > i {
  font-size: 18px;
  color: #e67e22;
}

.browser-detect-text {
  font-size: 14px;
  color: #856404;
}

.browser-detect-links {
  display: flex;
  gap: 12px;
}

.browser-detect-links a {
  font-size: 13px;
  color: #d35400;
  text-decoration: underline;
  white-space: nowrap;
}

.browser-detect-links a:hover {
  color: #e74c3c;
}

.browser-detect-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.browser-detect-close i {
  font-size: 16px;
  color: #856404;
}

.browser-detect-close:hover i {
  color: #e74c3c;
}
</style>
