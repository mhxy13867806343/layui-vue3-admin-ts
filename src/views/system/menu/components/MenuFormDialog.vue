<script setup lang="ts">
/**
 * MenuFormDialog —— 菜单新增 / 编辑弹窗
 *
 * 三类校验差异：
 *   - directory：仅校验名称、图标、排序
 *   - menu：必填路由路径与组件路径
 *   - button：必填权限码，路由 / 组件不参与校验
 */
import { computed, reactive, ref, watch } from 'vue'
import { useT } from '@/locales'
import { layer } from '@layui/layui-vue'
import { createMenu, updateMenu } from '@/api/menu'
import type { Menu, MenuType } from '@/types/domain'
import IconSelect from '@/components/IconSelect/index.vue'
import LvaDialog from '@/components/LvaDialog/index.vue'

interface Props {
  modelValue: boolean
  /** 编辑：传入完整 Menu；新增：null */
  menu: Menu | null
  /** 新增子菜单：父节点 id；新增根菜单：null */
  parentId: number | null
  /** 候选父节点（扁平），用于 select 选择 */
  parentOptions: Array<{ id: number; name: string; type: MenuType }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

interface FormState {
  id: number | null
  parentId: number | null
  name: string
  icon: string
  type: MenuType
  path: string
  component: string
  permission: string
  sort: number
  visible: boolean
}

const form = reactive<FormState>({
  id: null,
  parentId: null,
  name: '',
  icon: '',
  type: 'menu',
  path: '',
  component: '',
  permission: '',
  sort: 0,
  visible: true,
})

const errors = reactive<Record<keyof Omit<FormState, 'id'>, string>>({
  parentId: '',
  name: '',
  icon: '',
  type: '',
  path: '',
  component: '',
  permission: '',
  sort: '',
  visible: '',
})

const submitting = ref<boolean>(false)
const { t } = useT()
const isEdit = computed<boolean>(() => form.id !== null)
const title = computed<string>(() => (isEdit.value ? t('systemMenu.titleEdit') : t('systemMenu.titleAdd')))

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    if (props.menu) {
      form.id = props.menu.id
      form.parentId = props.menu.parentId
      form.name = props.menu.name
      form.icon = props.menu.icon ?? ''
      form.type = props.menu.type
      form.path = props.menu.path ?? ''
      form.component = props.menu.component ?? ''
      form.permission = props.menu.permission ?? ''
      form.sort = props.menu.sort
      form.visible = props.menu.visible
    } else {
      form.id = null
      form.parentId = props.parentId
      form.name = ''
      form.icon = ''
      form.type = 'menu'
      form.path = ''
      form.component = ''
      form.permission = ''
      form.sort = 0
      form.visible = true
    }
    Object.keys(errors).forEach((k) => ((errors as Record<string, string>)[k] = ''))
  },
)

function validate(): boolean {
  Object.keys(errors).forEach((k) => ((errors as Record<string, string>)[k] = ''))
  if (!form.name) errors.name = t('validate.nameRequired')
  else if (form.name.length > 30) errors.name = t('validate.nameTooLong')

  if (form.type === 'menu') {
    if (!form.path) errors.path = t('validate.routePathRequired')
    if (!form.component) errors.component = t('validate.componentRequired')
  } else if (form.type === 'directory') {
    if (!form.path) errors.path = t('validate.routePathRequired')
  } else if (form.type === 'button') {
    if (!form.permission) errors.permission = t('validate.permissionRequired')
  }

  if (typeof form.sort !== 'number' || Number.isNaN(form.sort)) errors.sort = t('validate.sortMustNumber')

  return Object.values(errors).every((v) => !v)
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    const payload = {
      parentId: form.parentId,
      name: form.name,
      icon: form.icon,
      type: form.type,
      path: form.type === 'button' ? '' : form.path,
      component: form.type === 'menu' ? form.component : '',
      permission: form.permission,
      sort: form.sort,
      visible: form.visible,
    }
    if (isEdit.value && form.id !== null) {
      await updateMenu({ id: form.id, ...payload })
      layer.msg(t('common.success'), { icon: 1 })
    } else {
      await createMenu(payload)
      layer.msg(t('common.success'), { icon: 1 })
    }
    emit('saved')
    visible.value = false
  } catch {
    /* http 拦截器已弹错 */
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <LvaDialog v-model="visible" :title="title" width="560px">
    <form class="lva-menu-form" @submit.prevent="onSubmit">
      <div class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.typeLabel') }}</label>
        <div class="lva-menu-form__field">
          <lay-radio v-model="form.type" value="directory">{{ t('systemMenu.typeDirectory') }}</lay-radio>
          <lay-radio v-model="form.type" value="menu">{{ t('systemMenu.typeMenu') }}</lay-radio>
          <lay-radio v-model="form.type" value="button">{{ t('systemMenu.typeButton') }}</lay-radio>
        </div>
      </div>
      <div class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.parent') }}</label>
        <div class="lva-menu-form__field">
          <lay-select v-model="form.parentId" :placeholder="t('systemMenu.parentTop')" allow-clear>
            <lay-select-option
              v-for="o in parentOptions"
              :key="o.id"
              :value="o.id"
              :label="o.name"
            />
          </lay-select>
        </div>
      </div>
      <div class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.rowName') }}</label>
        <div class="lva-menu-form__field">
          <lay-input v-model="form.name" :placeholder="t('systemMenu.nameHelp')" />
          <p v-if="errors.name" class="lva-menu-form__err">{{ errors.name }}</p>
        </div>
      </div>
      <div class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.iconLabel') }}</label>
        <div class="lva-menu-form__field">
          <IconSelect v-model="form.icon" />
        </div>
      </div>
      <div v-if="form.type !== 'button'" class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.routePath') }}</label>
        <div class="lva-menu-form__field">
          <lay-input v-model="form.path" :placeholder="t('systemMenu.pathHint')" />
          <p v-if="errors.path" class="lva-menu-form__err">{{ errors.path }}</p>
        </div>
      </div>
      <div v-if="form.type === 'menu'" class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.componentPath') }}</label>
        <div class="lva-menu-form__field">
          <lay-input v-model="form.component" :placeholder="t('systemMenu.componentHint')" />
          <p v-if="errors.component" class="lva-menu-form__err">{{ errors.component }}</p>
        </div>
      </div>
      <div v-if="form.type !== 'directory'" class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.permissionCode') }}</label>
        <div class="lva-menu-form__field">
          <lay-input v-model="form.permission" :placeholder="t('systemMenu.permissionHint')" />
          <p v-if="errors.permission" class="lva-menu-form__err">{{ errors.permission }}</p>
        </div>
      </div>
      <div class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.sort') }}</label>
        <div class="lva-menu-form__field">
          <lay-input v-model="form.sort" type="number" />
          <p v-if="errors.sort" class="lva-menu-form__err">{{ errors.sort }}</p>
        </div>
      </div>
      <div class="lva-menu-form__row">
        <label class="lva-menu-form__label">{{ t('systemMenu.visible') }}</label>
        <div class="lva-menu-form__field">
          <lay-switch v-model="form.visible" />
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
.lva-menu-form { display: flex; flex-direction: column; gap: 14px; padding: 16px 20px 8px; }
.lva-menu-form__row { display: flex; gap: 12px; align-items: flex-start; }
.lva-menu-form__label { width: 90px; padding-top: 8px; font-size: 13px; color: #555; }
.lva-menu-form__field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.lva-menu-form__err { margin: 0; font-size: 12px; color: #ff5722; }
</style>
