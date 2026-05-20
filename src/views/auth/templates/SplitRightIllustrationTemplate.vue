<script setup lang="ts">
/**
 * 模板 3：左半屏表单 + 右半屏插画
 *
 * 与 SplitLeft 对称，仅交换左右；色调换为暖色系作差异化。
 */
defineProps<{ mode: 'login' | 'register' }>()
</script>

<template>
  <div class="auth-tpl-split-r">
    <main class="auth-tpl-split-r__main">
      <div class="auth-tpl-split-r__card">
        <h2 class="auth-tpl-split-r__title">
          {{ mode === 'login' ? 'Welcome Back' : 'Sign Up' }}
        </h2>
        <p class="auth-tpl-split-r__sub">
          {{ mode === 'login' ? '使用您的账号登录系统' : '创建一个新的账号' }}
        </p>
        <slot name="form" />
      </div>
    </main>
    <aside class="auth-tpl-split-r__aside">
      <div class="auth-tpl-split-r__diamond" />
      <div class="auth-tpl-split-r__diamond auth-tpl-split-r__diamond--sm" />
      <div class="auth-tpl-split-r__caption">
        <div class="auth-tpl-split-r__cap-title">高效协作 · 极致体验</div>
        <div class="auth-tpl-split-r__cap-sub">Powered by Vue 3 + layui-vue</div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.auth-tpl-split-r {
  display: flex;
  min-height: 100vh;
}
.auth-tpl-split-r__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 24px;
}
.auth-tpl-split-r__card {
  width: 380px;
  max-width: 100%;
}
.auth-tpl-split-r__title {
  font-size: 26px;
  font-weight: 700;
}
.auth-tpl-split-r__sub {
  margin: 6px 0 24px;
  font-size: 13px;
  color: #888;
}
.auth-tpl-split-r__aside {
  flex: 1;
  position: relative;
  background: linear-gradient(140deg, #ff7e5f 0%, #feb47b 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px;
  overflow: hidden;
}
.auth-tpl-split-r__diamond {
  position: absolute;
  width: 280px;
  height: 280px;
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(45deg);
  top: 60px;
  right: -60px;
  border-radius: 36px;
}
.auth-tpl-split-r__diamond--sm {
  width: 140px;
  height: 140px;
  bottom: 80px;
  left: -40px;
  background: rgba(255, 255, 255, 0.08);
}
.auth-tpl-split-r__cap-title {
  font-size: 22px;
  font-weight: 700;
}
.auth-tpl-split-r__cap-sub {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.85;
}
</style>
