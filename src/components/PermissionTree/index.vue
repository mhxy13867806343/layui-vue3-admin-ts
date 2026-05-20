<script setup lang="ts">
/**
 * PermissionTree —— 角色权限分配树
 *
 * 设计要点：
 *   - 将 Permission[] 按 `code.split(':')[0]` 分组（dashboard / user / role / menu …）；
 *   - 父节点 id 为 `__group__:<group>`，子节点 id 为 `<code>`；
 *   - 勾选回写时仅保留非分组节点 id，作为权限码集合 emit。
 */
import { computed } from 'vue'
import type { Permission } from '@/types/domain'

interface Props {
  permissions: Permission[]
  modelValue: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

interface PermissionTreeNode {
  id: string
  title: string
  children?: PermissionTreeNode[]
}

const GROUP_PREFIX = '__group__:'

const GROUP_TITLES: Record<string, string> = {
  dashboard: '仪表盘',
  user: '用户',
  role: '角色',
  menu: '菜单',
}

function groupTitle(group: string): string {
  return GROUP_TITLES[group] ?? group
}

const treeData = computed<PermissionTreeNode[]>(() => {
  const groups = new Map<string, Permission[]>()
  for (const p of props.permissions) {
    const group = p.code.split(':')[0] ?? p.code
    const list = groups.get(group)
    if (list) {
      list.push(p)
    } else {
      groups.set(group, [p])
    }
  }
  const result: PermissionTreeNode[] = []
  for (const [group, items] of groups) {
    result.push({
      id: `${GROUP_PREFIX}${group}`,
      title: groupTitle(group),
      children: items.map((item) => ({ id: item.code, title: item.name })),
    })
  }
  return result
})

const checkedKeys = computed<string[]>(() => props.modelValue)

function onCheckedChange(keys: unknown): void {
  if (!Array.isArray(keys)) return
  const codes = keys
    .filter((k): k is string => typeof k === 'string')
    .filter((k) => !k.startsWith(GROUP_PREFIX))
  emit('update:modelValue', codes)
}
</script>

<template>
  <lay-tree
    class="lva-permission-tree"
    :data="treeData"
    :checked-keys="checkedKeys"
    show-checkbox
    default-expand-all
    title-key="title"
    id-key="id"
    children-key="children"
    @update:checked-keys="onCheckedChange"
  />
</template>

<style scoped>
.lva-permission-tree {
  max-height: 480px;
  overflow: auto;
}
</style>
