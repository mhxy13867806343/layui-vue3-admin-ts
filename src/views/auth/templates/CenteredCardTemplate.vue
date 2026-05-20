<script setup lang="ts">
/**
 * 模板 1：居中卡片 + 渐变背景
 *
 * 视觉：背景 135° 渐变，中央 420px 圆角卡片承载表单。
 */
defineProps<{ mode: 'login' | 'register' }>()
</script>

<template>
  <div class="auth-tpl-centered">
    <div class="auth-tpl-centered__card">
      <div class="auth-tpl-centered__title">
        {{ mode === 'login' ? '欢迎登录' : '账号注册' }}
      </div>
      <div class="auth-tpl-centered__subtitle">layui-vue Admin</div>
      <div class="auth-tpl-centered__body">
        <slot name="form" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-tpl-centered {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #16baaa 0%, #1e9fff 100%);
  padding: 24px;
}
.auth-tpl-centered__card {
  width: 420px;
  max-width: 100%;
  padding: 32px 28px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.auth-tpl-centered__title {
  font-size: 22px;
  font-weight: 600;
  color: #222;
}
.auth-tpl-centered__subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #888;
}
.auth-tpl-centered__body {
  margin-top: 24px;
}
</style>
