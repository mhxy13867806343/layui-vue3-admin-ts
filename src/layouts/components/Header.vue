<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import LocaleSwitcher from './LocaleSwitcher.vue'
import NotificationCenter from './NotificationCenter.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import FullscreenToggle from './FullscreenToggle.vue'
import UserDropdown from './UserDropdown.vue'
import SettingsDrawer from './SettingsDrawer.vue'

const appStore = useAppStore()
const settingsVisible = ref<boolean>(false)
function toggle() {
  appStore.setSidebarCollapsed(!appStore.sidebarCollapsed)
}
function openSettings() {
  settingsVisible.value = true
}
</script>
<template>
  <div class="lva-header">
    <div class="lva-header__left">
      <button class="lva-header__collapse" @click="toggle">
        <i
          class="layui-icon"
          :class="appStore.sidebarCollapsed ? 'layui-icon-spread-left' : 'layui-icon-shrink-right'"
        ></i>
      </button>
      <span class="lva-header__title">layui-vue Admin</span>
    </div>
    <div class="lva-header__right">
      <NotificationCenter />
      <FullscreenToggle />
      <LocaleSwitcher />
      <ThemeSwitcher />
      <button class="lva-header__icon-btn" title="系统设置" @click="openSettings">
        <i class="layui-icon layui-icon-set"></i>
      </button>
      <UserDropdown />
    </div>
    <SettingsDrawer v-model="settingsVisible" />
  </div>
</template>
<style scoped>
.lva-header { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 16px; background: var(--global-neutral-color-2, #fff); border-bottom: 1px solid var(--global-neutral-color-3, #e6e6e6); }
.lva-header__left { display: flex; align-items: center; gap: 12px; }
.lva-header__collapse { background: transparent; border: none; cursor: pointer; font-size: 18px; padding: 4px; }
.lva-header__title { font-weight: 600; }
.lva-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
  white-space: nowrap;
}
.lva-header__icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 18px;
}
.lva-header__icon-btn:hover { background: var(--global-neutral-color-3, #f0f0f0); }
</style>
