<script setup lang="ts">
/**
 * 示例 - useDict
 *
 * 拉取字典 + label/color 映射 + ready 标记。
 */
import { useDict } from '@/hooks/useDict'

const status = useDict('status')
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">useDict</h2>
    <p class="lva-example__desc">通过字典编码拉取选项,提供 label/color 工具函数与 ready 状态。</p>

    <section class="lva-example__section">
      <h3>原始 items</h3>
      <pre class="lva-example__pre">{{ status.items.value }}</pre>
    </section>

    <section class="lva-example__section">
      <h3>渲染演示</h3>
      <div class="lva-example__row">
        <span>状态值 1 → </span>
        <lay-badge type="primary">{{ status.label(1) }}</lay-badge>
      </div>
      <div class="lva-example__row">
        <span>状态值 0 → </span>
        <lay-badge>{{ status.label(0) }}</lay-badge>
      </div>
      <div class="lva-example__row">
        <span>就绪状态:</span>
        <lay-badge :type="status.ready.value ? 'primary' : 'normal'">
          {{ status.ready.value ? 'ready' : 'loading' }}
        </lay-badge>
        <lay-button size="sm" @click="status.reload">重新加载</lay-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lva-example { padding: 4px; }
.lva-example__title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-example__desc { color: #666; font-size: 13px; margin-bottom: 18px; }
.lva-example__section {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 14px;
}
.lva-example__section h3 { font-size: 14px; font-weight: 600; margin: 0 0 12px; }
.lva-example__row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px;
}
.lva-example__pre {
  background: #f7f8fa; padding: 12px; border-radius: 4px;
  font-size: 12px; margin: 0; overflow: auto;
}
</style>
