<script setup lang="ts">
/**
 * 示例 - useDownload
 *
 * 演示通过 Blob 触发浏览器下载。
 */
import { useDownload } from '@/hooks/useDownload'

const { downloadBlob, loading, progress } = useDownload()

function onDownloadText(): void {
  const text = `# layui-vue Admin\n\n生成时间: ${new Date().toLocaleString()}\n演示 useDownload hook 的 Blob 下载能力。\n`
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, 'demo.txt')
}

function onDownloadJson(): void {
  const data = {
    name: 'layui-vue-admin',
    version: '0.0.1',
    items: [1, 2, 3],
    generatedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, 'demo.json')
}
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">useDownload</h2>
    <p class="lva-example__desc">封装 Blob 下载 + URL 下载,带加载态与进度。</p>

    <section class="lva-example__section">
      <div class="lva-example__row">
        <lay-button type="primary" @click="onDownloadText">下载 demo.txt</lay-button>
        <lay-button type="primary" @click="onDownloadJson">下载 demo.json</lay-button>
      </div>
      <div class="lva-example__row" style="margin-top: 12px">
        <span>状态:</span>
        <lay-badge :type="loading ? 'primary' : 'normal'">
          {{ loading ? `下载中 ${progress.percent}%` : '空闲' }}
        </lay-badge>
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
.lva-example__row {
  display: flex; align-items: center; gap: 10px; font-size: 13px;
}
</style>
