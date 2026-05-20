<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<template>
  <div class="lva-error-page">
    <div class="lva-error-page__code">404</div>
    <div class="lva-error-page__desc">抱歉，您访问的页面不存在。</div>
    <lay-button type="primary" @click="router.replace('/dashboard')">返回首页</lay-button>
  </div>
</template>
<style scoped>
.lva-error-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 12px; }
.lva-error-page__code { font-size: 96px; font-weight: 700; color: var(--global-primary-color, #16baaa); }
.lva-error-page__desc { font-size: 14px; color: #666; }
</style>
