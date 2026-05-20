<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, isCloseVisible } from '@/store/modules/app'
import type { TabItem } from '@/types/domain'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

watch(
  () => route.fullPath,
  (fullPath) => {
    if (!fullPath || fullPath.startsWith('/redirect')) return
    if (route.meta?.title) {
      const tab: TabItem = {
        fullPath,
        title: route.meta.title as string,
        closable: true,
      }
      appStore.addTab(tab)
    }
  },
  { immediate: true },
)

function activate(tab: TabItem) {
  appStore.setActiveTab(tab.fullPath)
  router.push(tab.fullPath)
}

function close(tab: TabItem) {
  if (!isCloseVisible(appStore.tabs)) return
  const { activePath } = appStore.closeTab(tab.fullPath)
  if (activePath && activePath !== route.fullPath) {
    router.push(activePath)
  }
}
</script>
<template>
  <div class="lva-tabs-view">
    <span
      v-for="t in appStore.tabs"
      :key="t.fullPath"
      class="lva-tabs-view__tab"
      :class="{ 'is-active': t.fullPath === appStore.activeTab }"
      @click="activate(t)"
    >
      {{ t.title }}
      <i
        v-if="isCloseVisible(appStore.tabs)"
        class="layui-icon layui-icon-close lva-tabs-view__close"
        @click.stop="close(t)"
      ></i>
    </span>
  </div>
</template>
<style scoped>
.lva-tabs-view { display: flex; gap: 6px; flex-wrap: wrap; }
.lva-tabs-view__tab { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--global-neutral-color-2, #fff); border: 1px solid var(--global-neutral-color-3, #e6e6e6); border-radius: 4px; cursor: pointer; font-size: 13px; }
.lva-tabs-view__tab.is-active { color: var(--global-primary-color, #16baaa); border-color: var(--global-primary-color, #16baaa); }
.lva-tabs-view__close { font-size: 12px; }
</style>
