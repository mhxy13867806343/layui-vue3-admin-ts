<script setup lang="ts">
/**
 * LockScreen —— 屏幕锁定遮罩
 *
 * 仅当 useAppStore.locked === true 时渲染；解锁后由 store 自动隐藏。
 */
import { computed, ref, watch } from 'vue'
import { layer } from '@layui/layui-vue'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

const appStore = useAppStore()
const userStore = useUserStore()

const password = ref<string>('')
const submitting = ref<boolean>(false)
const visible = computed<boolean>(() => appStore.locked)

watch(visible, (v) => {
  if (v) password.value = ''
})

const nickname = computed<string>(() => userStore.userInfo?.nickname ?? '当前用户')

function onUnlock(): void {
  if (submitting.value) return
  submitting.value = true
  try {
    const ok = appStore.unlock(password.value)
    if (!ok) layer.msg('密码不正确', { icon: 2 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="visible" class="lva-lock">
    <div class="lva-lock__card">
      <div class="lva-lock__avatar">
        <i class="layui-icon layui-icon-username"></i>
      </div>
      <div class="lva-lock__nickname">{{ nickname }}</div>
      <div class="lva-lock__hint">请输入密码解锁</div>
      <form class="lva-lock__form" @submit.prevent="onUnlock">
        <lay-input
          v-model="password"
          type="password"
          password
          placeholder="解锁密码"
          size="lg"
        />
        <lay-button
          type="primary"
          size="lg"
          fluid
          native-type="submit"
          :loading="submitting"
        >
          解锁
        </lay-button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.lva-lock {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(20, 30, 50, 0.92), rgba(40, 60, 90, 0.92));
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.lva-lock__card {
  width: 320px;
  text-align: center;
  padding: 32px 28px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.lva-lock__avatar {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.lva-lock__nickname {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
}
.lva-lock__hint {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.7;
}
.lva-lock__form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
