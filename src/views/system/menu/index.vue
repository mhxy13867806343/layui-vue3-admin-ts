<script setup lang="ts">
/**
 * 菜单管理 / system/menu
 *
 * - 整树展示（递归 + 缩进）
 * - 操作：新增子菜单 / 编辑 / 删除（存在子节点时本地拦截）
 * - 保存后：刷新菜单树 + 触发 useUserStore.fetchUserMenus 重建左侧导航
 */
import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { deleteMenu, getMenuTree } from '@/api/menu'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import type { Menu, MenuType } from '@/types/domain'
import MenuFormDialog from './components/MenuFormDialog.vue'

const userStore = useUserStore()
const permissionStore = usePermissionStore()

const tree = ref<Menu[]>([])
const loading = ref<boolean>(false)
const expanded = ref<Set<number>>(new Set<number>())

interface FlatRow {
  id: number
  parentId: number | null
  name: string
  icon: string
  type: MenuType
  path: string
  component: string
  permission: string
  sort: number
  visible: boolean
  level: number
  hasChildren: boolean
  expanded: boolean
  childrenCount: number
  raw: Menu
}

function flatten(nodes: Menu[], level = 0): FlatRow[] {
  const out: FlatRow[] = []
  for (const node of nodes) {
    const hasChildren = (node.children?.length ?? 0) > 0
    out.push({
      id: node.id,
      parentId: node.parentId,
      name: node.name,
      icon: node.icon ?? '',
      type: node.type,
      path: node.path ?? '',
      component: node.component ?? '',
      permission: node.permission ?? '',
      sort: node.sort,
      visible: node.visible,
      level,
      hasChildren,
      expanded: expanded.value.has(node.id),
      childrenCount: node.children?.length ?? 0,
      raw: node,
    })
    if (hasChildren && expanded.value.has(node.id)) {
      out.push(...flatten(node.children ?? [], level + 1))
    }
  }
  return out
}

const flatRows = computed<FlatRow[]>(() => flatten(tree.value))

/** 父节点候选：所有 directory 类型节点 */
const parentOptions = computed(() => {
  const out: Array<{ id: number; name: string; type: MenuType }> = []
  const walk = (nodes: Menu[]): void => {
    for (const n of nodes) {
      if (n.type === 'directory' || n.type === 'menu') {
        out.push({ id: n.id, name: n.name, type: n.type })
      }
      if (n.children?.length) walk(n.children)
    }
  }
  walk(tree.value)
  return out
})

async function loadTree(): Promise<void> {
  loading.value = true
  try {
    tree.value = await getMenuTree()
    // 默认展开所有目录
    const ids: number[] = []
    const walk = (nodes: Menu[]): void => {
      for (const n of nodes) {
        if (n.type === 'directory' && (n.children?.length ?? 0) > 0) ids.push(n.id)
        if (n.children?.length) walk(n.children)
      }
    }
    walk(tree.value)
    expanded.value = new Set(ids)
  } finally {
    loading.value = false
  }
}

function toggleExpand(row: FlatRow): void {
  const next = new Set(expanded.value)
  if (next.has(row.id)) next.delete(row.id)
  else next.add(row.id)
  expanded.value = next
}

// ===== 弹窗 =====
const dialogVisible = ref<boolean>(false)
const dialogMenu = ref<Menu | null>(null)
const dialogParentId = ref<number | null>(null)

function onCreateRoot(): void {
  dialogMenu.value = null
  dialogParentId.value = null
  dialogVisible.value = true
}

function onCreateChild(row: FlatRow): void {
  dialogMenu.value = null
  dialogParentId.value = row.id
  dialogVisible.value = true
}

function onEdit(row: FlatRow): void {
  dialogMenu.value = row.raw
  dialogParentId.value = row.parentId
  dialogVisible.value = true
}

function onDelete(row: FlatRow): void {
  if (row.hasChildren) {
    layer.msg('请先删除其子节点', { icon: 2 })
    return
  }
  layer.confirm(`确认删除菜单「${row.name}」？`, {
    yes: async () => {
      try {
        await deleteMenu(row.id)
        layer.msg('删除成功', { icon: 1 })
        await afterMutation()
      } catch {
        /* http 拦截器已弹错 */
      }
    },
  })
}

/** 增改删之后：刷新树 + 同步重建左侧菜单 */
async function afterMutation(): Promise<void> {
  await loadTree()
  if (userStore.token) {
    const data = await userStore.fetchUserMenus()
    permissionStore.menus = data.menus
  }
}

const typeColor: Record<MenuType, string> = {
  directory: '#1e9fff',
  menu: '#16baaa',
  button: '#ffb800',
}
const typeLabel: Record<MenuType, string> = {
  directory: '目录',
  menu: '菜单',
  button: '按钮',
}

onMounted(loadTree)
</script>

<template>
  <div class="lva-menu-page">
    <section class="lva-menu-page__filter">
      <div class="lva-menu-page__title">菜单结构</div>
      <div class="lva-menu-page__actions">
        <lay-button v-permission="'menu:create'" type="primary" @click="onCreateRoot">
          <i class="layui-icon layui-icon-add-1" /> 新增根菜单
        </lay-button>
        <lay-button @click="loadTree">
          <i class="layui-icon layui-icon-refresh" /> 刷新
        </lay-button>
      </div>
    </section>

    <table class="lva-menu-tree" :class="{ 'is-loading': loading }">
      <thead>
        <tr>
          <th class="lva-menu-tree__th lva-menu-tree__th--name">名称</th>
          <th class="lva-menu-tree__th">类型</th>
          <th class="lva-menu-tree__th">路径</th>
          <th class="lva-menu-tree__th">组件</th>
          <th class="lva-menu-tree__th">权限码</th>
          <th class="lva-menu-tree__th lva-menu-tree__th--sort">排序</th>
          <th class="lva-menu-tree__th">可见</th>
          <th class="lva-menu-tree__th lva-menu-tree__th--op">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="8" class="lva-menu-tree__empty">加载中…</td>
        </tr>
        <tr v-else-if="flatRows.length === 0">
          <td colspan="8" class="lva-menu-tree__empty">暂无菜单</td>
        </tr>
        <tr v-for="row in flatRows" :key="row.id">
          <td class="lva-menu-tree__td">
            <span :style="{ paddingLeft: `${row.level * 24}px` }">
              <span
                v-if="row.hasChildren"
                class="lva-menu-tree__caret"
                @click="toggleExpand(row)"
              >
                <i class="layui-icon" :class="row.expanded ? 'layui-icon-down' : 'layui-icon-right'" />
              </span>
              <span v-else class="lva-menu-tree__caret lva-menu-tree__caret--leaf" />
              <i v-if="row.icon" class="layui-icon" :class="row.icon" />
              <span class="lva-menu-tree__name">{{ row.name }}</span>
            </span>
          </td>
          <td class="lva-menu-tree__td">
            <span :style="{ color: typeColor[row.type] }">{{ typeLabel[row.type] }}</span>
          </td>
          <td class="lva-menu-tree__td">{{ row.path }}</td>
          <td class="lva-menu-tree__td">{{ row.component }}</td>
          <td class="lva-menu-tree__td">{{ row.permission }}</td>
          <td class="lva-menu-tree__td">{{ row.sort }}</td>
          <td class="lva-menu-tree__td">{{ row.visible ? '是' : '否' }}</td>
          <td class="lva-menu-tree__td">
            <a
              v-if="row.type !== 'button'"
              v-permission="'menu:create'"
              class="lva-menu-page__op"
              @click="onCreateChild(row)"
            >新增子项</a>
            <a v-permission="'menu:update'" class="lva-menu-page__op" @click="onEdit(row)">编辑</a>
            <a
              v-permission="'menu:delete'"
              class="lva-menu-page__op lva-menu-page__op--danger"
              @click="onDelete(row)"
            >删除</a>
          </td>
        </tr>
      </tbody>
    </table>

    <MenuFormDialog
      v-model="dialogVisible"
      :menu="dialogMenu"
      :parent-id="dialogParentId"
      :parent-options="parentOptions"
      @saved="afterMutation"
    />
  </div>
</template>

<style scoped>
.lva-menu-page { display: flex; flex-direction: column; gap: 12px; }
.lva-menu-page__filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lva-menu-page__title { font-size: 14px; font-weight: 600; }
.lva-menu-page__actions { display: flex; gap: 8px; }

.lva-menu-tree {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: var(--global-neutral-color-2, #fff);
}
.lva-menu-tree.is-loading { opacity: 0.6; }
.lva-menu-tree__th {
  text-align: left;
  padding: 10px 12px;
  background: var(--global-neutral-color-1, #fafafa);
  border-bottom: 1px solid var(--global-neutral-color-3, #eee);
  font-weight: 600;
}
.lva-menu-tree__th--name { width: 30%; }
.lva-menu-tree__th--sort { width: 64px; }
.lva-menu-tree__th--op { width: 220px; }
.lva-menu-tree__td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--global-neutral-color-3, #f0f0f0);
}
.lva-menu-tree__caret {
  display: inline-block;
  width: 18px;
  cursor: pointer;
  text-align: center;
}
.lva-menu-tree__caret--leaf { cursor: default; opacity: 0.3; }
.lva-menu-tree__name { margin-left: 6px; }
.lva-menu-tree__empty { padding: 24px; text-align: center; color: #999; }
.lva-menu-page__op { cursor: pointer; color: var(--global-primary-color, #16baaa); margin-right: 12px; }
.lva-menu-page__op:hover { text-decoration: underline; }
.lva-menu-page__op--danger { color: #ff5722; }
</style>
