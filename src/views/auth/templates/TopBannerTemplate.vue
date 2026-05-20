<script setup lang="ts">
/**
 * 模板 5：顶部 Banner + 下方居中表单
 */
defineProps<{ mode: 'login' | 'register' }>()
</script>

<template>
  <div class="auth-tpl-top">
    <header class="auth-tpl-top__banner">
      <div class="auth-tpl-top__brand">layui-vue Admin</div>
      <div class="auth-tpl-top__slogan">让后台开发更高效</div>
    </header>
    <main class="auth-tpl-top__main">
      <div class="auth-tpl-top__card">
        <h2 class="auth-tpl-top__title">
          {{ mode === 'login' ? '请登录' : '请注册' }}
        </h2>
        <slot name="form" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-tpl-top {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.auth-tpl-top__banner {
  height: 220px;
  padding: 48px 64px;
  background: linear-gradient(120deg, #36d1dc 0%, #5b86e5 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.auth-tpl-top__brand {
  font-size: 28px;
  font-weight: 700;
}
.auth-tpl-top__slogan {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.85;
}
.auth-tpl-top__main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 24px 64px;
}
.auth-tpl-top__card {
  width: 420px;
  max-width: 100%;
  margin-top: -64px;
  padding: 32px 28px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
.auth-tpl-top__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
</style>
