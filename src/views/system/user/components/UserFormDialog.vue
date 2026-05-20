<script setup lang="ts">
/**
 * UserFormDialog —— 用户新增 / 编辑弹窗
 *
 * - 编辑模式（modelUser != null）：预填字段，不显示密码
 * - 新增模式：显示「初始密码」字段
 * - 校验：账号 ^[A-Za-z0-9_]{4,20}$；昵称 1–20；密码 6–20；至少一个角色
 * - 角色多选：通过 lay-select 多选框；options 由父组件传入（避免本组件再发请求）
 */
import { computed, reactive, ref, watch } from 'vue'
import { useT } from '@/locales'
import { layer } from '@layui/layui-vue'
import { createUser, updateUser } from '@/api/user'
import type { Role, Status, User } from '@/types/domain'
import LvaDialog from '@/components/LvaDialog/index.vue'

interface Props {
  modelValue: boolean
  /** 编辑时传入；新增传 null */
  user: User | null
  /** 角色列表（来自父组件） */
  roleOptions: Role[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

interface FormState {
  id: number | null
  username: string
  nickname: string
  password: string
  roleCodes: string[]
  status: Status
}

const form = reactive<FormState>({
  id: null,
  username: '',
  nickname: '',
  password: '',
  roleCodes: [],
  status: 1,
})

const errors = reactive<Record<keyof Omit<FormState, 'id'>, string>>({
  username: '',
  nickname: '',
  password: '',
  roleCodes: '',
  status: '',
})

const submitting = ref<boolean>(false)
const usernameRegex = /^[A-Za-z0-9_]{4,20}$/
const { t } = useT()

const isEdit = computed<boolean>(() => form.id !== null)
const title = computed<string>(() => (isEdit.value ? t('user.titleEdit') : t('user.titleAdd')))

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    if (props.user) {
      form.id = props.user.id
      form.username = props.user.username
      form.nickname = props.user.nickname
      form.password = ''
      form.roleCodes = [...(props.user.roleCodes ?? [])]
      form.status = props.user.status
    } else {
      form.id = null
      form.username = ''
      form.nickname = ''
      form.password = '123456'
      form.roleCodes = []
      form.status = 1
    }
    errors.username = ''
    errors.nickname = ''
    errors.password = ''
    errors.roleCodes = ''
    errors.status = ''
  },
)

function validate(): boolean {
  errors.username = ''
  errors.nickname = ''
  errors.password = ''
  errors.roleCodes = ''
  if (!form.username) errors.username = t('validate.usernameRequired')
  else if (!usernameRegex.test(form.username)) errors.username = t('validate.usernameInvalid')
  if (!form.nickname) errors.nickname = t('validate.nicknameRequired')
  else if (form.nickname.length > 20) errors.nickname = t('validate.nicknameTooLong')
  if (!isEdit.value) {
    if (!form.password) errors.password = t('validate.passwordRequired')
    else if (form.password.length < 6 || form.password.length > 20)
      errors.password = t('validate.passwordLength')
  }
  if (form.roleCodes.length === 0) errors.roleCodes = t('validate.pickAtLeastOneRole')
  return Object.values(errors).every((v) => !v)
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    if (isEdit.value && form.id !== null) {
      await updateUser({
        id: form.id,
        username: form.username,
        nickname: form.nickname,
        roleCodes: form.roleCodes,
        status: form.status,
      })
      layer.msg(t('common.success'), { icon: 1 })
    } else {
      await createUser({
        username: form.username,
        nickname: form.nickname,
        password: form.password,
        roleCodes: form.roleCodes,
        status: form.status,
      })
      layer.msg(t('common.success'), { icon: 1 })
    }
    emit('saved')
    visible.value = false
  } catch {
    /* http 拦截器已统一弹错 */
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <LvaDialog v-model="visible" :title="title" width="480px">
    <form class="lva-user-form" @submit.prevent="onSubmit">
      <div class="lva-user-form__row">
        <label class="lva-user-form__label">{{ t('auth.username') }}</label>
        <div class="lva-user-form__field">
          <lay-input v-model="form.username" :placeholder="t('auth.inputUsername')" :disabled="isEdit" />
          <p v-if="errors.username" class="lva-user-form__err">{{ errors.username }}</p>
        </div>
      </div>
      <div class="lva-user-form__row">
        <label class="lva-user-form__label">{{ t('auth.nickname') }}</label>
        <div class="lva-user-form__field">
          <lay-input v-model="form.nickname" :placeholder="t('auth.inputNickname')" />
          <p v-if="errors.nickname" class="lva-user-form__err">{{ errors.nickname }}</p>
        </div>
      </div>
      <div v-if="!isEdit" class="lva-user-form__row">
        <label class="lva-user-form__label">{{ t('user.initialPassword') }}</label>
        <div class="lva-user-form__field">
          <lay-input v-model="form.password" type="password" password :placeholder="t('user.pwdHint')" />
          <p v-if="errors.password" class="lva-user-form__err">{{ errors.password }}</p>
        </div>
      </div>
      <div class="lva-user-form__row">
        <label class="lva-user-form__label">{{ t('user.role') }}</label>
        <div class="lva-user-form__field">
          <lay-select v-model="form.roleCodes" multiple :placeholder="t('user.pickRole')">
            <lay-select-option
              v-for="r in roleOptions"
              :key="r.code"
              :value="r.code"
              :label="r.name"
            />
          </lay-select>
          <p v-if="errors.roleCodes" class="lva-user-form__err">{{ errors.roleCodes }}</p>
        </div>
      </div>
      <div class="lva-user-form__row">
        <label class="lva-user-form__label">{{ t('user.statusFilter') }}</label>
        <div class="lva-user-form__field">
          <lay-radio v-model="form.status" :value="1">{{ t('common.enable') }}</lay-radio>
          <lay-radio v-model="form.status" :value="0">{{ t('common.disable') }}</lay-radio>
        </div>
      </div>
    </form>
    <template #footer>
      <lay-button @click="visible = false">{{ t('common.cancel') }}</lay-button>
      <lay-button type="primary" :loading="submitting" @click="onSubmit">{{ t('common.save') }}</lay-button>
    </template>
  </LvaDialog>
</template>

<style scoped>
.lva-user-form { display: flex; flex-direction: column; gap: 14px; padding: 16px 20px 8px; }
.lva-user-form__row { display: flex; gap: 12px; align-items: flex-start; }
.lva-user-form__label { width: 80px; padding-top: 8px; font-size: 13px; color: #555; }
.lva-user-form__field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.lva-user-form__err { margin: 0; font-size: 12px; color: #ff5722; }
</style>
