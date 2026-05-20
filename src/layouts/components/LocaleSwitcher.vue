<script setup lang="ts">
import { computed } from 'vue'
import { i18n, setLocale, SUPPORTED_LOCALES, type LocaleCode } from '@/locales'

const current = computed(() => i18n.global.locale.value as LocaleCode)
const label = computed(() => SUPPORTED_LOCALES.find((l) => l.value === current.value)?.label ?? '')
function pick(code: LocaleCode) {
  setLocale(code)
}
</script>
<template>
  <lay-dropdown trigger="click">
    <span class="lva-locale-switcher__trigger">
      <i class="layui-icon layui-icon-website"></i>
      <span>{{ label }}</span>
    </span>
    <template #content>
      <lay-dropdown-menu>
        <lay-dropdown-menu-item
          v-for="o in SUPPORTED_LOCALES"
          :key="o.value"
          @click="pick(o.value)"
        >
          {{ o.label }}
        </lay-dropdown-menu-item>
      </lay-dropdown-menu>
    </template>
  </lay-dropdown>
</template>
<style scoped>
.lva-locale-switcher__trigger { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; cursor: pointer; border-radius: 4px; }
.lva-locale-switcher__trigger:hover { background: var(--global-neutral-color-3, #f0f0f0); }
</style>
