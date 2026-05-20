<script setup lang="ts">
import { ref } from 'vue'
import libsData from './integration-data.json'

type TabKey = 'vue' | 'state' | 'http' | 'ui' | 'utils' | 'build'
const activeTab = ref<TabKey>('vue')

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'vue', label: 'Vue 生态', icon: 'layui-icon-app' },
  { key: 'state', label: '状态管理', icon: 'layui-icon-template' },
  { key: 'http', label: '网络请求', icon: 'layui-icon-website' },
  { key: 'ui', label: 'UI 框架', icon: 'layui-icon-component' },
  { key: 'utils', label: '工具库', icon: 'layui-icon-code-circle' },
  { key: 'build', label: '构建工具', icon: 'layui-icon-set' },
]

const libs = libsData as Record<TabKey, { title: string; intro: string; code: string }[]>
</script>

<template>
  <div class="lva-integ">
    <h2>第三方库集成指南</h2>
    <p class="lva-integ__desc">展示在 Vue 3 + TypeScript 项目中如何集成和使用各种第三方库的最佳实践。</p>

    <div class="lva-integ__tabs">
      <span v-for="t in tabs" :key="t.key" class="lva-integ__tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
        <i class="layui-icon" :class="t.icon" /> {{ t.label }}
      </span>
    </div>

    <div class="lva-integ__content">
      <div v-for="lib in libs[activeTab]" :key="lib.title" class="lva-integ__lib">
        <h3>{{ lib.title }}</h3>
        <p class="lva-integ__intro">{{ lib.intro }}</p>
        <pre class="lva-integ__code">{{ lib.code }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lva-integ { padding: 4px; }
.lva-integ h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-integ__desc { color: #666; font-size: 13px; margin-bottom: 16px; }
.lva-integ__tabs {
  display: flex; flex-wrap: wrap; gap: 0; margin-bottom: 16px;
  border-bottom: 1px solid #eee;
}
.lva-integ__tab {
  padding: 10px 16px; cursor: pointer; font-size: 13px; color: #666;
  border-bottom: 2px solid transparent; transition: all 0.2s;
  display: flex; align-items: center; gap: 6px;
}
.lva-integ__tab:hover { color: var(--global-primary-color, #16baaa); }
.lva-integ__tab.active { color: var(--global-primary-color, #16baaa); border-bottom-color: var(--global-primary-color, #16baaa); }
.lva-integ__content { display: flex; flex-direction: column; gap: 14px; }
.lva-integ__lib { background: #fff; padding: 20px 24px; border-radius: 4px; }
.lva-integ__lib h3 { font-size: 15px; font-weight: 600; margin: 0 0 6px; }
.lva-integ__intro { font-size: 13px; color: #666; margin: 0 0 12px; }
.lva-integ__code {
  background: #1e1e2e; color: #cdd6f4; padding: 16px 20px; border-radius: 6px;
  font-size: 12px; line-height: 1.6; overflow-x: auto; margin: 0; white-space: pre;
  font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
}
@media (max-width: 768px) {
  .lva-integ__tabs { overflow-x: auto; flex-wrap: nowrap; }
}
</style>
