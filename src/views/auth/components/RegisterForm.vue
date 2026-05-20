<script setup lang="ts">
/**
 * RegisterForm —— 注册表单
 *
 * - 字段：账号、昵称、密码、确认密码
 * - 校验：账号正则 `^[A-Za-z0-9_]{4,20}$`；昵称 1–20；密码 6–20；确认密码 === 密码
 * - 提交：调用 register API → 写入 store → 跳 /dashboard
 */
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useT } from '@/locales'
import { layer } from '@layui/layui-vue'
import { register } from '@/api/auth'
import { storage } from '@/utils/storage'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

interface FormState {
  username: string
  nickname: string
  password: string
  confirmPassword: string
}

const form = reactive<FormState>({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive<Record<keyof FormState, string>>({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

const submitting = ref<boolean>(false)

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const router = useRouter()
const { t } = useT()

const usernameRegex = /^[A-Za-z0-9_]{4,20}$/

const canSubmit = computed<boolean>(
  () =>
    form.username.length > 0 &&
    form.nickname.length > 0 &&
    form.password.length >= 6 &&
    form.confirmPassword.length >= 6 &&
    !submitting.value,
)

function validate(): boolean {
  errors.username = ''
  errors.nickname = ''
  errors.password = ''
  errors.confirmPassword = ''
  if (!form.username) errors.username = t('validate.usernameRequired')
  else if (!usernameRegex.test(form.username))
    errors.username = t('validate.usernameInvalid')
  if (!form.nickname) errors.nickname = t('validate.nicknameRequired')
  else if (form.nickname.length > 20) errors.nickname = t('validate.nicknameTooLong')
  if (!form.password) errors.password = t('validate.passwordRequired')
  else if (form.password.length < 6 || form.password.length > 20)
    errors.password = t('validate.passwordLength')
  if (!form.confirmPassword) errors.confirmPassword = t('validate.passwordRequired')
  else if (form.confirmPassword !== form.password)
    errors.confirmPassword = t('validate.pwdMismatch')
  return Object.values(errors).every((v) => !v)
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    const data = await register({
      username: form.username,
      nickname: form.nickname,
      password: form.password,
    })
    // 注册成功：写入 token 与用户信息，等同于登录
    userStore.setTokens(data.token, data.refreshToken)
    userStore.userInfo = data.user
    storage.set('user_info', data.user)
    const menus = await userStore.fetchUserMenus()
    await permissionStore.generateRoutes(menus.menus, menus.permissions, menus.roles)
    layer.msg(t('common.success'), { icon: 1 })
    await router.replace('/dashboard')
  } catch {
    /* http 拦截器已统一弹错 */
  } finally {
    submitting.value = false
  }
}

function goLogin(): void {
  void router.push('/login')
}
</script>

<template>
  <form class="lva-reg-form" @submit.prevent="onSubmit">
    <div class="lva-reg-form__field">
      <lay-input v-model="form.username" :placeholder="t('auth.inputUsername')" size="lg" />
      <p v-if="errors.username" class="lva-reg-form__err">{{ errors.username }}</p>
    </div>
    <div class="lva-reg-form__field">
      <lay-input v-model="form.nickname" :placeholder="t('auth.inputNickname')" size="lg" />
      <p v-if="errors.nickname" class="lva-reg-form__err">{{ errors.nickname }}</p>
    </div>
    <div class="lva-reg-form__field">
      <lay-input
        v-model="form.password"
        type="password"
        password
        :placeholder="t('auth.inputPassword')"
        size="lg"
      />
      <p v-if="errors.password" class="lva-reg-form__err">{{ errors.password }}</p>
    </div>
    <div class="lva-reg-form__field">
      <lay-input
        v-model="form.confirmPassword"
        type="password"
        password
        :placeholder="t('auth.inputPasswordAgain')"
        size="lg"
      />
      <p v-if="errors.confirmPassword" class="lva-reg-form__err">{{ errors.confirmPassword }}</p>
    </div>
    <lay-button
      type="primary"
      size="lg"
      fluid
      :loading="submitting"
      :disabled="!canSubmit"
      native-type="submit"
    >
      {{ t('auth.submitRegister') }}
    </lay-button>
    <div class="lva-reg-form__footer">
      <a class="lva-reg-form__link" @click="goLogin">{{ t('auth.toLogin') }}</a>
    </div>
  </form>
</template>

<style scoped>
.lva-reg-form { display: flex; flex-direction: column; gap: 16px; }
.lva-reg-form__field { display: flex; flex-direction: column; gap: 4px; }
.lva-reg-form__err { font-size: 12px; color: #ff5722; margin: 0; }
.lva-reg-form__footer { display: flex; gap: 6px; font-size: 13px; }
.lva-reg-form__link {
  color: var(--global-primary-color, #16baaa);
  cursor: pointer;
}
.lva-reg-form__link:hover { text-decoration: underline; }
</style>
