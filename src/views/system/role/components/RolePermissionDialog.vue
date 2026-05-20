<script setup lang="ts">
/**
 * RolePermissionDialog —— 角色权限分配
 *
 * - 加载权限全集（来自 mock/_data/permissions —— 此处复用前端硬编码或 props 注入）
 * - 加载该角色已有权限码 → 默认勾选
 * - 保存：调用 saveRolePermissions
 *
 * 注：因 mock 没暴露 /permission/list，前端通过 _data 静态权限项硬编码到 props.permissions。
 *     生产环境应改为 GET /permission/list。
 */
import { computed, ref, watch } from 'vue'
import { layer } from '@layui/layui-vue'
import { getRolePermissions, saveRolePermissions } from '@/api/role'
import type { Permission, Role } from '@/types/domain'
import PermissionTree from '@/components/PermissionTree/index.vue'
import LvaDialog from '@/components/LvaDialog/index.vue'

interface Props {
  modelValue: boolean
  role: Role | null
  permissions: Permission[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const loading = ref<boolean>(false)
const submitting = ref<boolean>(false)
const checked = ref<string[]>([])

watch(
  () => props.modelValue,
  async (open) => {
    if (!open || !props.role) return
    loading.value = true
    try {
      checked.value = await getRolePermissions(props.role.id)
    } catch {
      checked.value = []
    } finally {
      loading.value = false
    }
  },
)

async function onSave(): Promise<void> {
  if (!props.role) return
  submitting.value = true
  try {
    await saveRolePermissions(props.role.id, checked.value)
    layer.msg('权限分配成功', { icon: 1 })
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
  <LvaDialog
    v-model="visible"
    :title="`分配权限：${role?.name ?? ''}`"
    width="520px"
  >
    <div class="lva-role-perm">
      <div v-if="loading" class="lva-role-perm__loading">加载中…</div>
      <PermissionTree v-else v-model="checked" :permissions="permissions" />
    </div>
    <template #footer>
      <lay-button @click="visible = false">取消</lay-button>
      <lay-button type="primary" :loading="submitting" @click="onSave">保存</lay-button>
    </template>
  </LvaDialog>
</template>

<style scoped>
.lva-role-perm { padding: 16px 20px 8px; display: flex; flex-direction: column; gap: 12px; }
.lva-role-perm__loading { padding: 24px 0; text-align: center; color: #999; font-size: 13px; }
</style>
