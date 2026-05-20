<script setup lang="ts">
/**
 * Sidebar —— 亮色 + 分组风格的自定义侧边菜单
 *
 * 完全自渲染（不依赖 lay-menu 的 provide/inject），支持任意深度。
 * 数据扁平化时把 type='group' 的节点保留为分组小标题。
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { useAppStore } from '@/store/modules/app'
import type { Menu, MenuType } from '@/types/domain'
import SidebarItem, { type SidebarMenuItem } from './SidebarItem.vue'

const permissionStore = usePermissionStore()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

function buildPath(menu: Menu, basePath: string): string {
  const p = menu.path ?? ''
  if (!p) return basePath
  if (p.startsWith('/')) return p
  return basePath ? `${basePath.replace(/\/$/, '')}/${p}` : `/${p}`
}

const SUPPORTED: ReadonlySet<MenuType | 'group'> = new Set([
  'directory',
  'menu',
  'group',
] as const)

function normalize(nodes: Menu[], basePath: string): SidebarMenuItem[] {
  const out: SidebarMenuItem[] = []
  for (const n of nodes) {
    const t = n.type as MenuType | 'group'
    if (!SUPPORTED.has(t)) continue
    const fullPath = buildPath(n, basePath)
    const item: SidebarMenuItem = {
      id: n.id,
      fullPath,
      name: n.name,
      icon: n.icon,
      type: t === 'group' ? 'group' : (n.type as 'directory' | 'menu'),
    }
    if ((t === 'directory' || t === 'group') && n.children?.length) {
      item.children = normalize(n.children, fullPath)
    }
    out.push(item)
  }
  return out
}

const menuTree = computed<SidebarMenuItem[]>(() => normalize(permissionStore.menus, ''))

const parentMap = computed<Record<string, number[]>>(() => {
  const map: Record<string, number[]> = {}
  const walk = (nodes: SidebarMenuItem[], parents: number[]): void => {
    for (const n of nodes) {
      if (n.type === 'menu') map[n.fullPath] = [...parents]
      if (n.children?.length) {
        const next = n.type === 'directory' ? [...parents, n.id] : parents
        walk(n.children, next)
      }
    }
  }
  walk(menuTree.value, [])
  return map
})

const openIds = ref<Set<number>>(new Set<number>())

watch(
  () => route.fullPath,
  (fp) => {
    const parents = parentMap.value[fp] ?? []
    if (parents.length === 0) return
    const next = new Set(openIds.value)
    for (const id of parents) next.add(id)
    openIds.value = next
  },
  { immediate: true },
)

function onToggle(id: number): void {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}

function onNavigate(fullPath: string): void {
  if (!fullPath || !fullPath.startsWith('/') || fullPath === route.fullPath) return
  void router.push(fullPath)
}
</script>

<template>
  <aside class="lva-sidebar" :class="{ 'is-collapsed': appStore.sidebarCollapsed }">
    <div class="lva-sidebar__logo">
      <i class="layui-icon layui-icon-app lva-sidebar__logo-icon"></i>
      <span v-if="!appStore.sidebarCollapsed" class="lva-sidebar__brand">layui-vue Admin</span>
    </div>
    <nav class="lva-sidebar__nav">
      <SidebarItem
        v-for="m in menuTree"
        :key="m.id"
        :item="m"
        :level="0"
        :open-ids="openIds"
        :collapsed="appStore.sidebarCollapsed"
        @toggle="onToggle"
        @navigate="onNavigate"
      />
    </nav>
    <div v-if="!appStore.sidebarCollapsed" class="lva-sidebar__footer">
      v0.0.1 · layui-vue Admin
    </div>
  </aside>
</template>

<style scoped>
.lva-sidebar {
  background: #fff;
  color: #303133;
  border-right: 1px solid var(--global-neutral-color-3, #ebeef5);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: visible;
}
.lva-sidebar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  font-weight: 700;
  font-size: 15px;
  border-bottom: 1px solid var(--global-neutral-color-3, #ebeef5);
  white-space: nowrap;
  color: #303133;
}
.lva-sidebar__logo-icon {
  font-size: 22px;
  color: var(--global-primary-color, #16baaa);
  flex: none;
}
.lva-sidebar.is-collapsed .lva-sidebar__logo {
  justify-content: center;
  padding: 16px 0;
}
.lva-sidebar.is-collapsed .lva-sidebar__brand { display: none; }

.lva-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: visible;
  padding: 6px 0 12px;
  position: relative;
}
.lva-sidebar__nav::-webkit-scrollbar { width: 6px; }
.lva-sidebar__nav::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.lva-sidebar__footer {
  padding: 12px 18px;
  font-size: 11px;
  color: #c0c4cc;
  border-top: 1px solid var(--global-neutral-color-3, #ebeef5);
  text-align: center;
  white-space: nowrap;
}
</style>
