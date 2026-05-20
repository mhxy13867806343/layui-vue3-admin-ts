<script setup lang="ts">
/**
 * 模板 4：整屏背景图 + 浮层透明卡片
 *
 * 背景使用 CSS 渐变 + 装饰几何代替图片，防止外链失败；
 * 卡片以毛玻璃效果（backdrop-filter）叠加在背景之上。
 */
defineProps<{ mode: 'login' | 'register' }>()
</script>

<template>
  <div class="auth-tpl-fs">
    <div class="auth-tpl-fs__bg">
      <div class="auth-tpl-fs__shape auth-tpl-fs__shape--a" />
      <div class="auth-tpl-fs__shape auth-tpl-fs__shape--b" />
      <div class="auth-tpl-fs__shape auth-tpl-fs__shape--c" />
    </div>
    <div class="auth-tpl-fs__card">
      <div class="auth-tpl-fs__title">
        {{ mode === 'login' ? '账号登录' : '账号注册' }}
      </div>
      <div class="auth-tpl-fs__hint">
        {{ mode === 'login' ? '登录以访问后台管理系统' : '提交资料以注册新账号' }}
      </div>
      <div class="auth-tpl-fs__body">
        <slot name="form" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-tpl-fs {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.auth-tpl-fs__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, #2c3e50 0%, #4ca1af 100%);
  z-index: 0;
}
.auth-tpl-fs__shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
}
.auth-tpl-fs__shape--a { width: 360px; height: 360px; background: #16baaa; top: -80px; left: -60px; }
.auth-tpl-fs__shape--b { width: 280px; height: 280px; background: #ff5722; bottom: -80px; right: -40px; }
.auth-tpl-fs__shape--c { width: 200px; height: 200px; background: #ffb800; top: 40%; left: 50%; }
.auth-tpl-fs__card {
  position: relative;
  z-index: 1;
  width: 420px;
  max-width: 100%;
  padding: 32px 28px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}
.auth-tpl-fs__title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}
.auth-tpl-fs__hint {
  margin: 6px 0 22px;
  font-size: 13px;
  color: #555;
}
</style>
