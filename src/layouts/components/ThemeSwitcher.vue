<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import { PRESET_PRIMARIES } from '@/utils/theme'

const appStore = useAppStore()
function toggleTheme() {
  appStore.setTheme(appStore.theme === 'dark' ? 'light' : 'dark')
}
</script>
<template>
  <div class="lva-theme-switcher">
    <button
      class="lva-theme-switcher__btn"
      :title="appStore.theme === 'dark' ? '切换为明亮' : '切换为暗黑'"
      @click="toggleTheme"
    >
      <i
        class="layui-icon"
        :class="appStore.theme === 'dark' ? 'layui-icon-light' : 'layui-icon-moon'"
      ></i>
    </button>
    <lay-dropdown trigger="click">
      <button class="lva-theme-switcher__btn" title="主色">
        <span class="lva-theme-switcher__swatch" :style="{ background: appStore.primary }"></span>
      </button>
      <template #content>
        <div class="lva-theme-switcher__panel">
          <span
            v-for="c in PRESET_PRIMARIES"
            :key="c"
            class="lva-theme-switcher__color"
            :class="{ 'is-active': c === appStore.primary }"
            :style="{ background: c }"
            @click="appStore.setPrimary(c)"
          />
          <input
            type="color"
            :value="appStore.primary"
            @input="(e) => appStore.setPrimary((e.target as HTMLInputElement).value)"
          />
        </div>
      </template>
    </lay-dropdown>
  </div>
</template>
<style scoped>
.lva-theme-switcher { display: inline-flex; align-items: center; gap: 8px; }
.lva-theme-switcher__btn { background: transparent; border: none; cursor: pointer; padding: 4px 6px; border-radius: 4px; }
.lva-theme-switcher__btn:hover { background: var(--global-neutral-color-3, #f0f0f0); }
.lva-theme-switcher__swatch { display: inline-block; width: 16px; height: 16px; border-radius: 3px; border: 1px solid var(--global-neutral-color-3, #ddd); }
.lva-theme-switcher__panel { display: flex; align-items: center; gap: 8px; padding: 8px; }
.lva-theme-switcher__color { display: inline-block; width: 18px; height: 18px; border-radius: 3px; cursor: pointer; border: 2px solid transparent; }
.lva-theme-switcher__color.is-active { border-color: #000; }
</style>
