<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'
import { useT } from '@/locales'

const route = useRoute()
const { t } = useT()
const items = computed(() => {
  return route.matched
    .filter((r): r is RouteLocationMatched => Boolean(r.meta?.title))
    .map((r) => ({ title: r.meta?.title as string, path: r.path }))
})

function display(raw: string): string {
  if (!raw) return raw
  if (raw.startsWith('i18n:')) return t(raw.slice('i18n:'.length))
  return raw
}
</script>
<template>
  <lay-breadcrumb separator="/">
    <lay-breadcrumb-item v-for="it in items" :key="it.path">{{ display(it.title) }}</lay-breadcrumb-item>
  </lay-breadcrumb>
</template>
