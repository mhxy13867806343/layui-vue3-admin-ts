<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="lva-error-page">
    <h1 class="lva-error-page__code">400</h1>
    <p class="lva-error-page__desc">错误请求，服务器无法理解该请求</p>
    <lay-button type="primary" @click="router.replace('/dashboard')">返回首页</lay-button>
  </div>
</template>

<style scoped>
.lva-error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}
.lva-error-page__code {
  font-size: 96px;
  font-weight: 700;
  color: #ddd;
  margin: 0;
}
.lva-error-page__desc {
  font-size: 16px;
  color: #666;
  margin: 12px 0 24px;
}
</style>
