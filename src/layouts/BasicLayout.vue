<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import TabsView from './components/TabsView.vue'
import Watermark from './components/Watermark.vue'
import LockScreen from './components/LockScreen.vue'

const appStore = useAppStore()

const mq = window.matchMedia('(max-width: 768px)')
const isNarrow = ref<boolean>(false)

function handleMQ(e: MediaQueryListEvent | MediaQueryList) {
  isNarrow.value = e.matches
  if (e.matches) appStore.setSidebarCollapsed(true)
}

onMounted(() => {
  handleMQ(mq)
  mq.addEventListener('change', handleMQ)
})
onBeforeUnmount(() => mq.removeEventListener('change', handleMQ))

/** 视口 < 768px 时强制 side 模式（即便 store 里是 top/mix） */
const effectiveLayoutMode = computed(() => (isNarrow.value ? 'side' : appStore.layoutMode))
</script>

<template>
  <!-- side：左 sidebar + 右上 header -->
  <div
    v-if="effectiveLayoutMode === 'side'"
    class="lva-layout"
    :class="{ 'is-collapsed': appStore.sidebarCollapsed }"
  >
    <Sidebar class="lva-layout__sidebar" />
    <div class="lva-layout__main">
      <Header class="lva-layout__header" />
      <div class="lva-layout__content">
        <Breadcrumb class="lva-layout__breadcrumb" />
        <TabsView class="lva-layout__tabs" />
        <div class="lva-layout__view">
          <Watermark
            v-if="appStore.watermark.enabled && appStore.watermark.text"
            :text="appStore.watermark.text"
          />
          <router-view />
        </div>
      </div>
    </div>
    <LockScreen />
  </div>

  <!-- top：顶部 header（含菜单条）+ 全宽内容 -->
  <div v-else-if="effectiveLayoutMode === 'top'" class="lva-layout-top">
    <Header class="lva-layout-top__header" />
    <Sidebar class="lva-layout-top__menu" />
    <div class="lva-layout-top__content">
      <Breadcrumb />
      <TabsView />
      <div class="lva-layout-top__view">
        <Watermark
          v-if="appStore.watermark.enabled && appStore.watermark.text"
          :text="appStore.watermark.text"
        />
        <router-view />
      </div>
    </div>
    <LockScreen />
  </div>

  <!-- mix：顶部 header + 左侧菜单（与 side 视觉接近，但 header 全宽） -->
  <div
    v-else
    class="lva-layout-mix"
    :class="{ 'is-collapsed': appStore.sidebarCollapsed }"
  >
    <Header class="lva-layout-mix__header" />
    <div class="lva-layout-mix__body">
      <Sidebar class="lva-layout-mix__sidebar" />
      <div class="lva-layout-mix__content">
        <Breadcrumb />
        <TabsView />
        <div class="lva-layout-mix__view">
          <Watermark
            v-if="appStore.watermark.enabled && appStore.watermark.text"
            :text="appStore.watermark.text"
          />
          <router-view />
        </div>
      </div>
    </div>
    <LockScreen />
  </div>
</template>

<style scoped>
/* ===== side 模式 ===== */
.lva-layout { display: flex; min-height: 100vh; background: var(--global-neutral-color-1, #f5f7fa); }
.lva-layout__sidebar { flex: 0 0 240px; width: 240px; transition: width 0.2s ease; }
.lva-layout.is-collapsed .lva-layout__sidebar { flex: 0 0 64px; width: 64px; }
.lva-layout__main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.lva-layout__content { padding: 12px 16px 24px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
.lva-layout__view {
  position: relative;
  background: var(--global-neutral-color-2, #fff);
  padding: 16px;
  min-height: 0;
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
}

/* ===== top 模式 ===== */
.lva-layout-top {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--global-neutral-color-1, #f5f7fa);
}
.lva-layout-top__header { flex: 0 0 56px; }
.lva-layout-top__menu { flex: 0 0 auto; max-height: 220px; overflow: auto; }
.lva-layout-top__content { padding: 12px 16px 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
.lva-layout-top__view {
  position: relative;
  flex: 1;
  background: var(--global-neutral-color-2, #fff);
  padding: 16px;
  border-radius: 4px;
  overflow: hidden;
}

/* ===== mix 模式 ===== */
.lva-layout-mix { min-height: 100vh; display: flex; flex-direction: column; background: var(--global-neutral-color-1, #f5f7fa); }
.lva-layout-mix__header { flex: 0 0 56px; }
.lva-layout-mix__body { flex: 1; display: flex; min-height: 0; }
.lva-layout-mix__sidebar { flex: 0 0 240px; width: 240px; transition: width 0.2s ease; }
.lva-layout-mix.is-collapsed .lva-layout-mix__sidebar { flex: 0 0 64px; width: 64px; }
.lva-layout-mix__content { flex: 1; padding: 12px 16px 24px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.lva-layout-mix__view {
  position: relative;
  flex: 1;
  background: var(--global-neutral-color-2, #fff);
  padding: 16px;
  border-radius: 4px;
  overflow: hidden;
}
</style>
