<script setup lang="ts">
/**
 * 模板 2：左半屏插画 + 右半屏表单
 *
 * 插画用纯 CSS + emoji 实现，避免外部图片依赖。
 */
defineProps<{ mode: 'login' | 'register' }>()
</script>

<template>
  <div class="auth-tpl-split-l">
    <aside class="auth-tpl-split-l__aside">
      <div class="auth-tpl-split-l__illustration">
        <div class="auth-tpl-split-l__circle auth-tpl-split-l__circle--lg" />
        <div class="auth-tpl-split-l__circle auth-tpl-split-l__circle--md" />
        <div class="auth-tpl-split-l__emoji">🚀</div>
      </div>
      <div class="auth-tpl-split-l__caption">
        <div class="auth-tpl-split-l__cap-title">layui-vue Admin</div>
        <div class="auth-tpl-split-l__cap-sub">企业级中后台管理脚手架</div>
      </div>
    </aside>
    <main class="auth-tpl-split-l__main">
      <div class="auth-tpl-split-l__card">
        <h2 class="auth-tpl-split-l__title">
          {{ mode === 'login' ? '账号登录' : '快速注册' }}
        </h2>
        <slot name="form" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-tpl-split-l {
  display: flex;
  min-height: 100vh;
}
.auth-tpl-split-l__aside {
  flex: 1;
  background: linear-gradient(160deg, #1e9fff 0%, #16baaa 100%);
  color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  overflow: hidden;
}
.auth-tpl-split-l__illustration {
  position: relative;
  flex: 1;
}
.auth-tpl-split-l__circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}
.auth-tpl-split-l__circle--lg {
  width: 320px;
  height: 320px;
  top: 60px;
  left: 80px;
}
.auth-tpl-split-l__circle--md {
  width: 180px;
  height: 180px;
  bottom: 40px;
  right: 60px;
  background: rgba(255, 255, 255, 0.1);
}
.auth-tpl-split-l__emoji {
  position: absolute;
  font-size: 92px;
  top: 35%;
  left: 40%;
}
.auth-tpl-split-l__cap-title {
  font-size: 28px;
  font-weight: 700;
}
.auth-tpl-split-l__cap-sub {
  margin-top: 6px;
  font-size: 14px;
  opacity: 0.85;
}
.auth-tpl-split-l__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 24px;
}
.auth-tpl-split-l__card {
  width: 380px;
  max-width: 100%;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
.auth-tpl-split-l__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
</style>
