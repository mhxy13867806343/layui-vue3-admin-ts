<script setup lang="ts">
/**
 * 页面权限演示
 *
 * 功能：
 * - 展示当前用户拥有的页面级权限
 * - 通过复选框模拟权限切换，实时展示哪些页面/操作可访问
 * - 权限矩阵表格：页面 × 操作 的可视化
 */
import { computed, reactive } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { hasPermission } from '@/utils/permission'
import { layer } from '@layui/layui-vue'

const userStore = useUserStore()

// 系统中所有的权限定义
interface PermDef {
  code: string
  name: string
  type: 'menu' | 'button'
  module: string
}

const allPermissions: PermDef[] = [
  { code: 'dashboard:view', name: '仪表盘查看', type: 'menu', module: '仪表盘' },
  { code: 'user:view', name: '用户查看', type: 'menu', module: '用户管理' },
  { code: 'user:create', name: '用户新增', type: 'button', module: '用户管理' },
  { code: 'user:update', name: '用户修改', type: 'button', module: '用户管理' },
  { code: 'user:delete', name: '用户删除', type: 'button', module: '用户管理' },
  { code: 'user:reset-password', name: '重置密码', type: 'button', module: '用户管理' },
  { code: 'role:view', name: '角色查看', type: 'menu', module: '角色管理' },
  { code: 'role:create', name: '角色新增', type: 'button', module: '角色管理' },
  { code: 'role:update', name: '角色修改', type: 'button', module: '角色管理' },
  { code: 'role:delete', name: '角色删除', type: 'button', module: '角色管理' },
  { code: 'role:assign', name: '分配权限', type: 'button', module: '角色管理' },
  { code: 'menu:view', name: '菜单查看', type: 'menu', module: '菜单管理' },
  { code: 'menu:create', name: '菜单新增', type: 'button', module: '菜单管理' },
  { code: 'menu:update', name: '菜单修改', type: 'button', module: '菜单管理' },
  { code: 'menu:delete', name: '菜单删除', type: 'button', module: '菜单管理' },
]

// 模拟权限切换状态
const simPerms = reactive<Record<string, boolean>>({})

// 初始化：根据当前用户实际权限设置
allPermissions.forEach((p) => {
  simPerms[p.code] = hasPermission(p.code)
})

// 按模块分组
const modules = computed(() => {
  const map = new Map<string, PermDef[]>()
  for (const p of allPermissions) {
    if (!map.has(p.module)) map.set(p.module, [])
    map.get(p.module)!.push(p)
  }
  return Array.from(map.entries())
})

// 权限矩阵
const matrixModules = ['仪表盘', '用户管理', '角色管理', '菜单管理']
const matrixOps = ['查看', '新增', '修改', '删除', '其他']

function getMatrixPerm(mod: string, op: string): PermDef | undefined {
  const prefix = mod === '仪表盘' ? 'dashboard' : mod === '用户管理' ? 'user' : mod === '角色管理' ? 'role' : 'menu'
  const suffix = op === '查看' ? 'view' : op === '新增' ? 'create' : op === '修改' ? 'update' : op === '删除' ? 'delete' : ''
  if (!suffix) {
    // "其他" 列：找该模块下不属于 view/create/update/delete 的权限
    return allPermissions.find((p) => p.module === mod && !['view', 'create', 'update', 'delete'].includes(p.code.split(':')[1]))
  }
  return allPermissions.find((p) => p.code === `${prefix}:${suffix}`)
}

// 全选/取消
function selectAll(): void {
  allPermissions.forEach((p) => { simPerms[p.code] = true })
}
function deselectAll(): void {
  allPermissions.forEach((p) => { simPerms[p.code] = false })
}

// 模块全选
function toggleModule(mod: string, checked: boolean): void {
  allPermissions.filter((p) => p.module === mod).forEach((p) => { simPerms[p.code] = checked })
}

function isModuleAllChecked(mod: string): boolean {
  return allPermissions.filter((p) => p.module === mod).every((p) => simPerms[p.code])
}

// 统计
const checkedCount = computed(() => Object.values(simPerms).filter(Boolean).length)

function applyPerms(): void {
  layer.msg(`已模拟应用 ${checkedCount.value} 项权限（仅前端演示，刷新后恢复）`, { icon: 1 })
}
</script>

<template>
  <div class="lva-page-perm">
    <h2>页面权限演示</h2>
    <p class="lva-page-perm__desc">
      本页面需要 <code>dashboard:view</code> 权限才能访问。
      如果当前用户没有该权限，路由守卫会将其重定向到 403 页面。
    </p>

    <!-- 访问状态 -->
    <section class="lva-page-perm__card lva-page-perm__card--success">
      <i class="layui-icon layui-icon-ok-circle" />
      <span>您拥有访问此页面的权限</span>
    </section>

    <!-- 当前用户信息 -->
    <section class="lva-page-perm__section">
      <h3>当前用户信息</h3>
      <div class="lva-page-perm__user-info">
        <div class="lva-page-perm__info-item">
          <span class="lva-page-perm__label">用户名：</span>
          <span>{{ userStore.userInfo?.username ?? '-' }}</span>
        </div>
        <div class="lva-page-perm__info-item">
          <span class="lva-page-perm__label">角色：</span>
          <span v-for="r in userStore.roles" :key="r" class="lva-page-perm__role-tag">{{ r }}</span>
          <span v-if="!userStore.roles.length">无</span>
        </div>
        <div class="lva-page-perm__info-item">
          <span class="lva-page-perm__label">权限数：</span>
          <span>{{ userStore.permissions.length || 'Super_Admin（全部权限）' }}</span>
        </div>
      </div>
    </section>

    <!-- 权限矩阵 -->
    <section class="lva-page-perm__section">
      <h3>权限矩阵</h3>
      <p class="lva-page-perm__tip">展示各模块的操作权限状态，绿色表示拥有该权限。</p>
      <div class="lva-table-wrap">
        <table class="lva-page-perm__matrix">
          <thead>
            <tr>
              <th>模块</th>
              <th v-for="op in matrixOps" :key="op">{{ op }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in matrixModules" :key="mod">
              <td class="lva-page-perm__matrix-mod">{{ mod }}</td>
              <td v-for="op in matrixOps" :key="op">
                <template v-if="getMatrixPerm(mod, op)">
                  <span
                    class="lva-page-perm__dot"
                    :class="simPerms[getMatrixPerm(mod, op)!.code] ? 'is-active' : ''"
                    :title="getMatrixPerm(mod, op)!.code"
                  />
                </template>
                <span v-else class="lva-page-perm__na">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 权限配置（复选框） -->
    <section class="lva-page-perm__section">
      <div class="lva-page-perm__config-header">
        <h3>权限配置（模拟）</h3>
        <div class="lva-page-perm__config-actions">
          <lay-button size="sm" @click="selectAll">全选</lay-button>
          <lay-button size="sm" @click="deselectAll">取消全选</lay-button>
          <lay-button size="sm" type="primary" @click="applyPerms">
            应用（已选 {{ checkedCount }}/{{ allPermissions.length }}）
          </lay-button>
        </div>
      </div>
      <p class="lva-page-perm__tip">
        通过复选框模拟权限分配，勾选/取消后上方矩阵实时变化。实际项目中由后端接口控制。
      </p>

      <div class="lva-page-perm__modules">
        <div v-for="[mod, perms] in modules" :key="mod" class="lva-page-perm__module">
          <div class="lva-page-perm__module-header">
            <label class="lva-page-perm__checkbox">
              <input
                type="checkbox"
                :checked="isModuleAllChecked(mod)"
                @change="toggleModule(mod, ($event.target as HTMLInputElement).checked)"
              />
              <strong>{{ mod }}</strong>
            </label>
          </div>
          <div class="lva-page-perm__module-perms">
            <label
              v-for="p in perms"
              :key="p.code"
              class="lva-page-perm__checkbox"
              :class="{ 'is-menu': p.type === 'menu' }"
            >
              <input v-model="simPerms[p.code]" type="checkbox" />
              <span>{{ p.name }}</span>
              <code>{{ p.code }}</code>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 页面访问列表 -->
    <section class="lva-page-perm__section">
      <h3>页面访问控制</h3>
      <p class="lva-page-perm__tip">根据上方勾选的权限，展示各页面的可访问状态。</p>
      <div class="lva-page-perm__page-list">
        <div class="lva-page-perm__page-item">
          <span class="lva-page-perm__page-name">仪表盘 /dashboard</span>
          <span class="lva-page-perm__page-perm">dashboard:view</span>
          <span :class="simPerms['dashboard:view'] ? 'lva-page-perm__status--ok' : 'lva-page-perm__status--no'">
            {{ simPerms['dashboard:view'] ? '✓ 可访问' : '✗ 无权限' }}
          </span>
        </div>
        <div class="lva-page-perm__page-item">
          <span class="lva-page-perm__page-name">用户管理 /system/user</span>
          <span class="lva-page-perm__page-perm">user:view</span>
          <span :class="simPerms['user:view'] ? 'lva-page-perm__status--ok' : 'lva-page-perm__status--no'">
            {{ simPerms['user:view'] ? '✓ 可访问' : '✗ 无权限' }}
          </span>
        </div>
        <div class="lva-page-perm__page-item">
          <span class="lva-page-perm__page-name">角色管理 /system/role</span>
          <span class="lva-page-perm__page-perm">role:view</span>
          <span :class="simPerms['role:view'] ? 'lva-page-perm__status--ok' : 'lva-page-perm__status--no'">
            {{ simPerms['role:view'] ? '✓ 可访问' : '✗ 无权限' }}
          </span>
        </div>
        <div class="lva-page-perm__page-item">
          <span class="lva-page-perm__page-name">菜单管理 /system/menu</span>
          <span class="lva-page-perm__page-perm">menu:view</span>
          <span :class="simPerms['menu:view'] ? 'lva-page-perm__status--ok' : 'lva-page-perm__status--no'">
            {{ simPerms['menu:view'] ? '✓ 可访问' : '✗ 无权限' }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lva-page-perm { padding: 4px; }
.lva-page-perm h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-page-perm__desc { color: #666; font-size: 13px; margin-bottom: 16px; }
.lva-page-perm__desc code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; color: #e91e63; }
.lva-page-perm__tip { font-size: 12px; color: #999; margin: 0 0 12px; }

.lva-page-perm__card {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; border-radius: 4px; margin-bottom: 14px;
}
.lva-page-perm__card--success {
  background: #f6ffed; border: 1px solid #b7eb8f; color: #52c41a;
}
.lva-page-perm__card--success i { font-size: 20px; }

.lva-page-perm__section {
  background: #fff; padding: 20px 24px; border-radius: 4px; margin-bottom: 14px;
}
.lva-page-perm__section h3 { font-size: 15px; font-weight: 600; margin: 0 0 12px; }

/* User info */
.lva-page-perm__user-info { display: flex; flex-wrap: wrap; gap: 20px; }
.lva-page-perm__info-item { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.lva-page-perm__label { color: #999; }
.lva-page-perm__role-tag {
  background: #ecf5ff; color: #1e9fff; padding: 2px 8px; border-radius: 3px; font-size: 12px;
}

/* Matrix */
.lva-table-wrap { overflow-x: auto; }
.lva-page-perm__matrix {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.lva-page-perm__matrix th,
.lva-page-perm__matrix td {
  padding: 10px 16px; border: 1px solid #eee; text-align: center;
}
.lva-page-perm__matrix th { background: #f7f8fa; font-weight: 600; }
.lva-page-perm__matrix-mod { text-align: left; font-weight: 500; }
.lva-page-perm__dot {
  display: inline-block; width: 12px; height: 12px; border-radius: 50%;
  background: #eee; transition: background 0.2s;
}
.lva-page-perm__dot.is-active { background: #52c41a; }
.lva-page-perm__na { color: #ddd; }

/* Config */
.lva-page-perm__config-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
}
.lva-page-perm__config-actions { display: flex; gap: 8px; }

.lva-page-perm__modules { display: flex; flex-direction: column; gap: 16px; }
.lva-page-perm__module {
  border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden;
}
.lva-page-perm__module-header {
  background: #fafafa; padding: 10px 16px; border-bottom: 1px solid #f0f0f0;
}
.lva-page-perm__module-perms {
  display: flex; flex-wrap: wrap; gap: 8px 20px; padding: 12px 16px;
}
.lva-page-perm__checkbox {
  display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;
}
.lva-page-perm__checkbox input[type="checkbox"] {
  accent-color: var(--global-primary-color, #16baaa); width: 15px; height: 15px;
}
.lva-page-perm__checkbox code {
  font-size: 11px; color: #999; background: #f5f5f5; padding: 1px 5px; border-radius: 2px;
}
.lva-page-perm__checkbox.is-menu span { font-weight: 500; color: #333; }

/* Page list */
.lva-page-perm__page-list { display: flex; flex-direction: column; }
.lva-page-perm__page-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 0;
  border-bottom: 1px solid #f5f5f5; font-size: 13px;
}
.lva-page-perm__page-item:last-child { border-bottom: none; }
.lva-page-perm__page-name { flex: 1; font-weight: 500; }
.lva-page-perm__page-perm { color: #999; font-size: 12px; font-family: monospace; }
.lva-page-perm__status--ok { color: #52c41a; font-weight: 500; }
.lva-page-perm__status--no { color: #ff5722; font-weight: 500; }
</style>
