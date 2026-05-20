<script setup lang="ts">
/**
 * 修改密码
 *
 * 字段：原密码、新密码、确认新密码
 * 提交：调 mock 接口 /api/user/change-password；mock 端校验旧密码并写回
 */
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { layer } from '@layui/layui-vue'
import { http } from '@/utils/http'
import { useUserStore } from '@/store/modules/user'
import { useT } from '@/locales'

interface FormState {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const userStore = useUserStore()
const router = useRouter()
const { t } = useT()

const form = reactive<FormState>({ oldPassword: '', newPassword: '', confirmPassword: '' })
const errors = reactive<Record<keyof FormState, string>>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const submitting = ref<boolean>(false)

function validate(): boolean {
  errors.oldPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  if (!form.oldPassword) errors.oldPassword = t('validate.required')
  if (!form.newPassword) errors.newPassword = t('validate.passwordRequired')
  else if (form.newPassword.length < 6 || form.newPassword.length > 20)
    errors.newPassword = t('validate.passwordLength')
  if (form.confirmPassword !== form.newPassword)
    errors.confirmPassword = t('validate.pwdMismatch')
  return !errors.oldPassword && !errors.newPassword && !errors.confirmPassword
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    await http.post<null>('/user/change-password', {
      userId: userStore.userInfo?.id,
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    })
    layer.msg(t('common.success'), { icon: 1 })
    // 同步会话级密码（用于锁屏）
    try {
      sessionStorage.setItem('lva_lock_pw', form.newPassword)
    } catch {
      /* noop */
    }
    void router.replace('/profile')
  } catch {
    /* http 拦截器已弹错 */
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="lva-cp">
    <h2 class="lva-cp__title">{{ t('layout.changePwd') }}</h2>
    <form class="lva-cp__form" @submit.prevent="onSubmit">
      <div class="lva-cp__row">
        <label class="lva-cp__label">{{ t('auth.password') }}</label>
        <div class="lva-cp__field">
          <lay-input v-model="form.oldPassword" type="password" password size="lg" />
          <p v-if="errors.oldPassword" class="lva-cp__err">{{ errors.oldPassword }}</p>
        </div>
      </div>
      <div class="lva-cp__row">
        <label class="lva-cp__label">{{ t('user.initialPassword') }}</label>
        <div class="lva-cp__field">
          <lay-input v-model="form.newPassword" type="password" password size="lg" />
          <p v-if="errors.newPassword" class="lva-cp__err">{{ errors.newPassword }}</p>
        </div>
      </div>
      <div class="lva-cp__row">
        <label class="lva-cp__label">{{ t('auth.confirmPassword') }}</label>
        <div class="lva-cp__field">
          <lay-input v-model="form.confirmPassword" type="password" password size="lg" />
          <p v-if="errors.confirmPassword" class="lva-cp__err">{{ errors.confirmPassword }}</p>
        </div>
      </div>
      <div class="lva-cp__actions">
        <lay-button @click="router.back()">{{ t('common.cancel') }}</lay-button>
        <lay-button type="primary" :loading="submitting" native-type="submit">
          {{ t('common.submit') }}
        </lay-button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.lva-cp { padding: 24px; max-width: 520px; }
.lva-cp__title { margin: 0 0 16px; font-size: 18px; font-weight: 600; }
.lva-cp__form { display: flex; flex-direction: column; gap: 14px; }
.lva-cp__row { display: flex; gap: 12px; align-items: flex-start; }
.lva-cp__label { width: 100px; padding-top: 8px; font-size: 13px; color: #555; }
.lva-cp__field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.lva-cp__err { margin: 0; font-size: 12px; color: #ff5722; }
.lva-cp__actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }
</style>
