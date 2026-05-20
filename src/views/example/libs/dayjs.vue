<script setup lang="ts">
/**
 * 示例 - dayjs
 *
 * 演示常见用法:格式化、相对时间、加减、对比、起止边界。
 */
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const now = ref<string>(dayjs().format('YYYY-MM-DD HH:mm:ss'))
function refresh(): void {
  now.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const samples = computed(() => {
  const d = dayjs()
  return [
    { label: '当前时间', value: d.format('YYYY-MM-DD HH:mm:ss') },
    { label: 'ISO 字符串', value: d.toISOString() },
    { label: '今天起始', value: d.startOf('day').format('YYYY-MM-DD HH:mm:ss') },
    { label: '今天结束', value: d.endOf('day').format('YYYY-MM-DD HH:mm:ss') },
    { label: '7 天前', value: d.subtract(7, 'day').format('YYYY-MM-DD') },
    { label: '30 天后', value: d.add(30, 'day').format('YYYY-MM-DD') },
    { label: '相对时间', value: dayjs('2026-01-01').from(d) },
    { label: '本月天数', value: String(d.daysInMonth()) },
  ]
})
</script>

<template>
  <div class="lva-example">
    <h2 class="lva-example__title">dayjs 时间处理</h2>
    <p class="lva-example__desc">轻量时间库,启用 relativeTime + zh-cn locale。</p>

    <section class="lva-example__section">
      <div class="lva-example__row">
        <span>当前: <strong>{{ now }}</strong></span>
        <lay-button size="sm" @click="refresh">刷新</lay-button>
      </div>
    </section>

    <section class="lva-example__section">
      <table class="lva-example__table">
        <tbody>
          <tr v-for="row in samples" :key="row.label">
            <td class="lva-example__td-label">{{ row.label }}</td>
            <td>{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
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
.lva-example__row { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.lva-example__table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.lva-example__table td {
  padding: 8px 12px; border-bottom: 1px solid #f0f1f5;
}
.lva-example__td-label { width: 140px; color: #666; }
</style>
