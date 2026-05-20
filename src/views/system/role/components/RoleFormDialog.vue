<script setup lang="ts">
/**
 * RoleFormDialog —— 角色新增 / 编辑弹窗
 *
 * - 编辑模式：编码不可改
 * - 业务错误码 40010 → 「角色编码已存在」字段级错误
 */
import { computed, reactive, ref, watch } from 'vue'
import { useT } from '@/locales'
import { layer } from '@layui/layui-vue'
import { createRole, updateRole } from '@/api/role'
import type { Role, Status } from '@/types/domain'
import LvaDialog from '@/components/LvaDialog/index.vue'

interface Props {
  modelValue: boolean
  role: Role | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

interface FormState {
  id: number | null
  code: string
  name: string
  description: string
  status: Status
}

const form = reactive<FormState>({
  id: null,
  code: '',
  name: '',
  description: '',
  status: 1,
})

const errors = reactive<Record<keyof Omit<FormState, 'id'>, string>>({
  code: '',
  name: '',
  description: '',
  status: '',
})

const submitting = ref<boolean>(false)
const { t } = useT()
const isEdit = computed<boolean>(() => form.id !== null)
const title = computed<string>(() => (isEdit.value ? t('role.titleEdit') : t('role.titleAdd')))

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    if (props.role) {
      form.id = props.role.id
      form.code = props.role.code
      form.name = props.role.name
      form.description = props.role.description ?? ''
      form.status = props.role.status
    } else {
      form.id = null
      form.code = ''
      form.name = ''
      form.description = ''
      form.status = 1
    }
    errors.code = ''
    errors.name = ''
    errors.description = ''
    errors.status = ''
  },
)

function validate(): boolean {
  errors.code = ''
  errors.name = ''
  if (!form.code) errors.code = t('validate.codeRequired')
  else if (!/^[A-Za-z][A-Za-z0-9_]{1,30}$/.test(form.code)) errors.code = t('validate.codeFormat')
  if (!form.name) errors.name = t('validate.nameRequired')
  else if (form.name.length > 30) errors.name = t('validate.nameTooLong')
  return !errors.code && !errors.name
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    if (isEdit.value && form.id !== null) {
      await updateRole({
        id: form.id,
        code: form.code,
        name: form.name,
        description: form.description,
        status: form.status,
      })
      layer.msg(t('common.success'), { icon: 1 })
    } else {
      await createRole({
        code: form.code,
        name: form.name,
        description: form.description,
        status: form.status,
      })
      layer.msg(t('common.success'), { icon: 1 })
    }
    emit('saved')
    visible.value = false
  } catch (e) {
    // 业务错误码 40010 → 编码字段级错误
    const body = (e as { code?: number; message?: string } | undefined) ?? undefined
    if (body && body.code === 40010) errors.code = t('role.codeExisted')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <LvaDialog v-model="visible" :title="title" width="480px">
    <form class="lva-role-form" @submit.prevent="onSubmit">
      <div class="lva-role-form__row">
        <label class="lva-role-form__label">{{ t('role.code') }}</label>
        <div class="lva-role-form__field">
          <lay-input v-model="form.code" :placeholder="t('role.inputCode')" :disabled="isEdit" />
          <p v-if="errors.code" class="lva-role-form__err">{{ errors.code }}</p>
        </div>
      </div>
      <div class="lva-role-form__row">
        <label class="lva-role-form__label">{{ t('role.name') }}</label>
        <div class="lva-role-form__field">
          <lay-input v-model="form.name" :placeholder="t('role.inputName')" />
          <p v-if="errors.name" class="lva-role-form__err">{{ errors.name }}</p>
        </div>
      </div>
      <div class="lva-role-form__row">
        <label class="lva-role-form__label">{{ t('role.description') }}</label>
        <div class="lva-role-form__field">
          <lay-input v-model="form.description" :placeholder="t('role.inputDesc')" />
        </div>
      </div>
      <div class="lva-role-form__row">
        <label class="lva-role-form__label">{{ t('user.statusFilter') }}</label>
        <div class="lva-role-form__field">
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
.lva-role-form { display: flex; flex-direction: column; gap: 14px; padding: 16px 20px 8px; }
.lva-role-form__row { display: flex; gap: 12px; align-items: flex-start; }
.lva-role-form__label { width: 80px; padding-top: 8px; font-size: 13px; color: #555; }
.lva-role-form__field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.lva-role-form__err { margin: 0; font-size: 12px; color: #ff5722; }
</style>
