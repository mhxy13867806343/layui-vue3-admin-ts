<script setup lang="ts">
/**
 * 200 操作成功页面
 *
 * - 成功图标
 * - 描述文字
 * - 返回首页 / 查看详情按钮
 * - 5秒自动跳转倒计时
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(5)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      router.replace('/dashboard')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function goHome(): void {
  if (timer) clearInterval(timer)
  router.replace('/dashboard')
}

function goDetail(): void {
  if (timer) clearInterval(timer)
  router.replace('/profile')
}
</script>

<template>
  <div class="lva-success-page">
    <div class="lva-success-page__icon">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="56" fill="none" stroke="#52c41a" stroke-width="4" />
        <path d="M35 60 L52 77 L85 44" fill="none" stroke="#52c41a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <h1 class="lva-success-page__title">操作成功</h1>
    <p class="lva-success-page__desc">您的操作已成功完成，相关数据已更新。</p>
    <p class="lva-success-page__countdown">{{ countdown }} 秒后自动返回首页</p>
    <div class="lva-success-page__actions">
      <lay-button type="primary" @click="goHome">返回首页</lay-button>
      <lay-button @click="goDetail">查看详情</lay-button>
    </div>
  </div>
</template>

<style scoped>
.lva-success-page {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; gap: 12px;
}
.lva-success-page__icon { margin-bottom: 8px; }
.lva-success-page__title { font-size: 24px; font-weight: 600; color: #333; margin: 0; }
.lva-success-page__desc { font-size: 14px; color: #666; margin: 0; }
.lva-success-page__countdown { font-size: 13px; color: #999; margin: 4px 0 16px; }
.lva-success-page__actions { display: flex; gap: 12px; }
</style>
