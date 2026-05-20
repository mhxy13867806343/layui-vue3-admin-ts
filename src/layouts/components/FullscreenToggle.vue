<script setup lang="ts">
/**
 * FullscreenToggle —— 全屏切换按钮
 *
 * 使用 Document.fullscreen API；监听 fullscreenchange 同步图标。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useT } from '@/locales'

const isFs = ref<boolean>(false)
const { t: _t } = useT()
void _t // suppress unused

function syncState(): void {
  isFs.value = Boolean(document.fullscreenElement)
}

async function toggle(): Promise<void> {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch {
    /* 用户拒绝或浏览器不支持时静默 */
  }
}

onMounted(() => {
  syncState()
  document.addEventListener('fullscreenchange', syncState)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncState)
})

const iconClass = computed(() =>
  isFs.value ? 'layui-icon-screen-restore' : 'layui-icon-screen-full',
)
const titleAttr = computed(() => (isFs.value ? '退出全屏' : '全屏'))
</script>

<template>
  <button class="lva-fs-btn" :title="titleAttr" type="button" @click="toggle">
    <i class="layui-icon" :class="iconClass"></i>
  </button>
</template>

<style scoped>
.lva-fs-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 18px;
}
.lva-fs-btn:hover { background: var(--global-neutral-color-3, #f0f0f0); }
</style>
