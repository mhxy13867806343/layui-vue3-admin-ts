<script setup lang="ts">
/**
 * 权限演示 - 按钮权限
 *
 * 功能：
 * - 角色预设切换（模拟不同角色的权限）
 * - 权限矩阵（复选框交互，按模块分组）
 * - 按钮根据权限 disabled/enabled
 * - 操作日志
 */
import { computed, reactive, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const actionLog = ref<{ time: string; action: string; perm: string }[]>([])

// 权限矩阵定义
interface PermItem { code: string; label: string }
interface PermModule { module: string; icon: string; permissions: PermItem[] }

const permMatrix: PermModule[] = [
  {
    module: '仪表盘', icon: 'layui-icon-home',
    permissions: [{ code: 'dashboard:view', label: '查看' }],
  },
  {
    module: '用户管理', icon: 'layui-icon-username',
    permissions: [
      { code: 'user:view', label: '查看' },
      { code: 'user:create', label: '新增' },
      { code: 'user:update', label: '修改' },
      { code: 'user:delete', label: '删除' },
      { code: 'user:export', label: '导出' },
      { code: 'user:reset-password', label: '重置密码' },
    ],
  },
  {
    module: '角色管理', icon: 'layui-icon-user',
    permissions: [
      { code: 'role:view', label: '查看' },
      { code: 'role:create', label: '新增' },
      { code: 'role:update', label: '修改' },
      { code: 'role:delete', label: '删除' },
      { code: 'role:assign', label: '分配权限' },
    ],
  },
  {
    module: '菜单管理', icon: 'layui-icon-list',
    permissions: [
      { code: 'menu:view', label: '查看' },
      { code: 'menu:create', label: '新增' },
      { code: 'menu:update', label: '修改' },
      { code: 'menu:delete', label: '删除' },
    ],
  },
  {
    module: '系统设置', icon: 'layui-icon-set',
    permissions: [
      { code: 'system:config', label: '配置' },
      { code: 'system:log', label: '日志' },
      { code: 'system:monitor', label: '监控' },
    ],
  },
]

// 角色预设
interface RolePreset { name: string; desc: string; perms: string[] }
const allCodes = permMatrix.flatMap((m) => m.permissions.map((p) => p.code))

const rolePresets: RolePreset[] = [
  { name: 'Super_Admin', desc: '超级管理员 - 全部权限', perms: [...allCodes] },
  { name: 'Admin', desc: '管理员 - 用户/角色/菜单全操作', perms: allCodes.filter((c) => !c.startsWith('system:')) },
  { name: 'Editor', desc: '编辑者 - 查看和编辑，无删除', perms: allCodes.filter((c) => !c.includes('delete') && !c.startsWith('system:')) },
  { name: 'Viewer', desc: '访客 - 仅查看', perms: allCodes.filter((c) => c.includes('view')) },
]

const activePreset = ref('Super_Admin')
const checkedPerms = reactive(new Set<string>(allCodes))

function switchPreset(name: string): void {
  activePreset.value = name
  checkedPerms.clear()
  const preset = rolePresets.find((r) => r.name === name)
  preset?.perms.forEach((p) => checkedPerms.add(p))
}

function togglePerm(code: string): void {
  if (checkedPerms.has(code)) checkedPerms.delete(code)
  else checkedPerms.add(code)
  activePreset.value = '' // 自定义
}

function toggleModuleAll(mod: PermModule): void {
  const allChecked = mod.permissions.every((p) => checkedPerms.has(p.code))
  mod.permissions.forEach((p) => {
    if (allChecked) checkedPerms.delete(p.code)
    else checkedPerms.add(p.code)
  })
  activePreset.value = ''
}

function isModuleAllChecked(mod: PermModule): boolean {
  return mod.permissions.every((p) => checkedPerms.has(p.code))
}

function isModulePartial(mod: PermModule): boolean {
  const n = mod.permissions.filter((p) => checkedPerms.has(p.code)).length
  return n > 0 && n < mod.permissions.length
}

const permCount = computed(() => checkedPerms.size)

function doAction(action: string, perm: string): void {
  if (!checkedPerms.has(perm)) {
    layer.msg(`无权限：${perm}`, { icon: 2 })
    return
  }
  actionLog.value.unshift({ time: new Date().toLocaleTimeString(), action, perm })
  layer.msg(`操作成功：${action}`, { icon: 1 })
}

function clearLog(): void { actionLog.value = [] }
</script>

<template>
  <div class="lva-perm">
    <h2>按钮权限演示</h2>
    <p class="lva-perm__desc">
      演示 <code>v-permission</code> 指令与权限矩阵。通过复选框模拟权限分配，按钮根据权限动态启用/禁用。
    </p>

    <!-- 当前用户 -->
    <section class="lva-perm__card">
      <h3>当前用户</h3>
      <div class="lva-perm__user">
        <span>用户名：<strong>{{ userStore.userInfo?.username ?? '-' }}</strong></span>
        <span>角色：<strong>{{ userStore.roles.join(', ') || '无' }}</strong></span>
        <span>实际权限数：<strong>{{ userStore.permissions.length || '全部（Super_Admin）' }}</strong></span>
      </div>
    </section>

    <!-- 角色预设 -->
    <section class="lva-perm__card">
      <h3>角色预设切换</h3>
      <p class="lva-perm__tip">点击切换不同角色，观察下方权限矩阵和按钮的变化：</p>
      <div class="lva-perm__presets">
        <div
          v-for="p in rolePresets" :key="p.name"
          class="lva-perm__preset"
          :class="{ active: activePreset === p.name }"
          @click="switchPreset(p.name)"
        >
          <div class="lva-perm__preset-name">{{ p.name }}</div>
          <div class="lva-perm__preset-desc">{{ p.desc }}</div>
        </div>
      </div>
      <div class="lva-perm__stat">已选 <strong>{{ permCount }}</strong> / {{ allCodes.length }} 项权限</div>
    </section>

    <!-- 权限矩阵 -->
    <section class="lva-perm__card">
      <h3>权限矩阵（复选框）</h3>
      <p class="lva-perm__tip">勾选/取消权限，按钮区域实时响应。点击模块名可全选/取消该模块。</p>
      <div class="lva-perm__matrix">
        <div v-for="mod in permMatrix" :key="mod.module" class="lva-perm__row">
          <div class="lva-perm__module" @click="toggleModuleAll(mod)">
            <input type="checkbox" :checked="isModuleAllChecked(mod)" :indeterminate="isModulePartial(mod)" @click.stop="toggleModuleAll(mod)" />
            <i class="layui-icon" :class="mod.icon" />
            <span>{{ mod.module }}</span>
          </div>
          <div class="lva-perm__perms">
            <label v-for="p in mod.permissions" :key="p.code" class="lva-perm__perm" @click.prevent="togglePerm(p.code)">
              <input type="checkbox" :checked="checkedPerms.has(p.code)" @click.prevent />
              <span>{{ p.label }}</span>
              <code>{{ p.code }}</code>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 操作按钮 -->
    <section class="lva-perm__card">
      <h3>操作按钮</h3>
      <p class="lva-perm__tip">按钮根据上方权限矩阵动态 enabled/disabled。有权限时点击弹出成功提示。</p>
      <div class="lva-perm__btns">
        <lay-button type="primary" :disabled="!checkedPerms.has('user:create')" @click="doAction('新增用户', 'user:create')">
          <i class="layui-icon layui-icon-addition" /> 新增用户
        </lay-button>
        <lay-button type="normal" :disabled="!checkedPerms.has('user:update')" @click="doAction('编辑用户', 'user:update')">
          <i class="layui-icon layui-icon-edit" /> 编辑用户
        </lay-button>
        <lay-button type="danger" :disabled="!checkedPerms.has('user:delete')" @click="doAction('删除用户', 'user:delete')">
          <i class="layui-icon layui-icon-delete" /> 删除用户
        </lay-button>
        <lay-button type="warm" :disabled="!checkedPerms.has('user:export')" @click="doAction('导出数据', 'user:export')">
          <i class="layui-icon layui-icon-export" /> 导出数据
        </lay-button>
        <lay-button type="primary" :disabled="!checkedPerms.has('role:assign')" @click="doAction('分配权限', 'role:assign')">
          <i class="layui-icon layui-icon-group" /> 分配权限
        </lay-button>
        <lay-button type="normal" :disabled="!checkedPerms.has('role:create')" @click="doAction('新增角色', 'role:create')">
          <i class="layui-icon layui-icon-add-1" /> 新增角色
        </lay-button>
        <lay-button type="normal" :disabled="!checkedPerms.has('menu:create')" @click="doAction('新增菜单', 'menu:create')">
          <i class="layui-icon layui-icon-list" /> 新增菜单
        </lay-button>
        <lay-button type="warm" :disabled="!checkedPerms.has('system:config')" @click="doAction('系统配置', 'system:config')">
          <i class="layui-icon layui-icon-set" /> 系统配置
        </lay-button>
      </div>
    </section>

    <!-- 操作日志 -->
    <section class="lva-perm__card">
      <div class="lva-perm__log-head">
        <h3>操作日志</h3>
        <lay-button v-if="actionLog.length" size="sm" @click="clearLog">清空</lay-button>
      </div>
      <div v-if="actionLog.length" class="lva-perm__log-list">
        <div v-for="(log, i) in actionLog" :key="i" class="lva-perm__log-item">
          <span class="lva-perm__log-time">{{ log.time }}</span>
          <span class="lva-perm__log-action">{{ log.action }}</span>
          <code class="lva-perm__log-code">{{ log.perm }}</code>
        </div>
      </div>
      <div v-else class="lva-perm__log-empty">点击上方按钮查看操作记录</div>
    </section>
  </div>
</template>

<style scoped>
.lva-perm { padding: 4px; }
.lva-perm h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.lva-perm__desc { color: #666; font-size: 13px; margin-bottom: 16px; }
.lva-perm__desc code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; color: #e91e63; }
.lva-perm__tip { font-size: 12px; color: #999; margin: 4px 0 12px; }
.lva-perm__card { background: #fff; padding: 20px 24px; border-radius: 4px; margin-bottom: 14px; }
.lva-perm__card h3 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }

/* User */
.lva-perm__user { display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: #666; margin-top: 8px; }
.lva-perm__user strong { color: #333; }

/* Presets */
.lva-perm__presets { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.lva-perm__preset {
  padding: 12px 16px; border: 2px solid #eee; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.lva-perm__preset:hover { border-color: var(--global-primary-color, #16baaa); }
.lva-perm__preset.active { border-color: var(--global-primary-color, #16baaa); background: rgba(22,186,170,0.04); }
.lva-perm__preset-name { font-size: 14px; font-weight: 600; }
.lva-perm__preset-desc { font-size: 12px; color: #999; margin-top: 4px; }
.lva-perm__stat { margin-top: 12px; font-size: 13px; color: #666; }
.lva-perm__stat strong { color: var(--global-primary-color, #16baaa); font-size: 16px; }

/* Matrix */
.lva-perm__matrix { display: flex; flex-direction: column; }
.lva-perm__row { display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f5f5f5; gap: 16px; }
.lva-perm__row:last-child { border-bottom: none; }
.lva-perm__module {
  min-width: 130px; display: flex; align-items: center; gap: 6px;
  font-weight: 600; font-size: 13px; cursor: pointer; flex-shrink: 0;
}
.lva-perm__module input { accent-color: var(--global-primary-color, #16baaa); width: 16px; height: 16px; cursor: pointer; }
.lva-perm__module i { font-size: 16px; color: #666; }
.lva-perm__perms { display: flex; flex-wrap: wrap; gap: 8px 16px; flex: 1; }
.lva-perm__perm {
  display: inline-flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer; user-select: none;
}
.lva-perm__perm input { accent-color: var(--global-primary-color, #16baaa); width: 15px; height: 15px; cursor: pointer; }
.lva-perm__perm code { font-size: 10px; color: #aaa; background: #f7f8fa; padding: 1px 4px; border-radius: 2px; }

/* Buttons */
.lva-perm__btns { display: flex; flex-wrap: wrap; gap: 10px; }

/* Log */
.lva-perm__log-head { display: flex; align-items: center; justify-content: space-between; }
.lva-perm__log-list { margin-top: 12px; max-height: 200px; overflow-y: auto; }
.lva-perm__log-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
.lva-perm__log-time { color: #999; font-size: 12px; min-width: 70px; }
.lva-perm__log-action { color: #333; }
.lva-perm__log-code { color: #16baaa; font-size: 11px; background: #f0faf9; padding: 2px 6px; border-radius: 3px; }
.lva-perm__log-empty { color: #ccc; font-size: 13px; text-align: center; padding: 30px 0; }

@media (max-width: 768px) {
  .lva-perm__row { flex-direction: column; gap: 8px; }
  .lva-perm__presets { grid-template-columns: 1fr; }
}
</style>
