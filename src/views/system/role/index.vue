<script setup lang="ts">
/**
 * 角色管理 / system/role
 *
 * - 列表：编码 / 名称 / 描述 / 状态 / 创建时间
 * - 操作：新增 / 编辑 / 分配权限 / 删除
 * - 业务错误：删除返回 40020 时提示「该角色正在被使用，无法删除」
 */
import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layui-vue'
import { useTable } from '@/hooks/useTable'
import { useDict } from '@/hooks/useDict'
import { deleteRole, getRolePage, type RolePageParams } from '@/api/role'
import { getAllPermissions } from '@/api/permission'
import type { Permission, Role } from '@/types/domain'
import RoleFormDialog from './components/RoleFormDialog.vue'
import RolePermissionDialog from './components/RolePermissionDialog.vue'

const statusDict = useDict('status')

interface Query extends Record<string, unknown> {
  code: string
  name: string
  status: '' | 0 | 1
}

const initialQuery: Query = { code: '', name: '', status: '' }

const table = useTable<Role, Query>(
  async (params) => {
    const apiParams: RolePageParams = {
      page: params.page,
      pageSize: params.pageSize,
    }
    if (params.code) apiParams.code = params.code
    if (params.name) apiParams.name = params.name
    if (params.status !== '') apiParams.status = params.status as 0 | 1
    return getRolePage(apiParams)
  },
  { initialQuery, immediate: true },
)

// ===== 弹窗 =====
const formVisible = ref<boolean>(false)
const formRole = ref<Role | null>(null)
const permVisible = ref<boolean>(false)
const permRole = ref<Role | null>(null)
const permissions = ref<Permission[]>([])

async function loadPermissions(): Promise<void> {
  permissions.value = await getAllPermissions()
}

function onCreate(): void {
  formRole.value = null
  formVisible.value = true
}

function onEdit(row: Role): void {
  formRole.value = row
  formVisible.value = true
}

function onAssign(row: Role): void {
  permRole.value = row
  permVisible.value = true
}

function onDelete(row: Role): void {
  layer.confirm(`确认删除角色「${row.name}」？`, {
    yes: async () => {
      try {
        await deleteRole(row.id)
        layer.msg('删除成功', { icon: 1 })
        table.remove((r) => r.id === row.id)
      } catch (e) {
        const body = (e as { code?: number; message?: string } | undefined) ?? undefined
        // 业务错误码 40020：角色被引用，由 http 拦截器已弹错；这里不再 layer.msg
        if (!body || body.code !== 40020) {
          /* silent */
        }
      }
    },
  })
}

function onSearch(): void { void table.search() }
function onReset(): void { void table.reset() }

type PageLayout = ('count' | 'prev' | 'page' | 'next' | 'limits' | 'refresh' | 'skip')[]
const pageLayout = computed<PageLayout>(() => ['count', 'prev', 'page', 'next', 'limits', 'refresh', 'skip'])

const columns = computed(() => [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '编码', key: 'code' },
  { title: '名称', key: 'name' },
  { title: '描述', key: 'description' },
  { title: '状态', key: 'status', width: '100px', customSlot: 'statusCol' },
  { title: '创建时间', key: 'createdAt', width: '180px' },
  { title: '操作', key: 'op', width: '240px', customSlot: 'opCol' },
])

onMounted(() => {
  void loadPermissions()
})
</script>

<template>
  <div class="lva-role-page">
    <section class="lva-role-page__filter">
      <div class="lva-role-page__row">
        <lay-input
          v-model="table.query.value.code"
          placeholder="编码"
          allow-clear
          style="width: 180px"
        />
        <lay-input
          v-model="table.query.value.name"
          placeholder="名称"
          allow-clear
          style="width: 180px"
        />
        <lay-select
          v-model="table.query.value.status"
          placeholder="状态"
          allow-clear
          style="width: 140px"
        >
          <lay-select-option
            v-for="opt in statusDict.items.value"
            :key="String(opt.value)"
            :value="opt.value"
            :label="opt.label"
          />
        </lay-select>
        <lay-button type="primary" @click="onSearch">搜索</lay-button>
        <lay-button @click="onReset">重置</lay-button>
      </div>
      <div class="lva-role-page__actions">
        <lay-button v-permission="'role:create'" type="primary" @click="onCreate">
          <i class="layui-icon layui-icon-add-1" /> 新增角色
        </lay-button>
      </div>
    </section>

    <lay-table
      :data-source="table.list.value"
      :columns="columns"
      :loading="table.loading.value"
    >
      <template #statusCol="{ row }">
        <span :style="{ color: statusDict.color(row.status) === 'green' ? '#16baaa' : '#999' }">
          {{ statusDict.label(row.status) }}
        </span>
      </template>
      <template #opCol="{ row }">
        <a v-permission="'role:update'" class="lva-role-page__op" @click="onEdit(row)">编辑</a>
        <a v-permission="'role:assign'" class="lva-role-page__op" @click="onAssign(row)">分配权限</a>
        <a
          v-permission="'role:delete'"
          class="lva-role-page__op lva-role-page__op--danger"
          @click="onDelete(row)"
        >删除</a>
      </template>
    </lay-table>

    <div class="lva-role-page__pager">
      <lay-page
        :total="table.total.value"
        :current-page="table.page.value"
        :limit="table.pageSize.value"
        :limits="[10, 20, 50]"
        :layout="pageLayout"
        @change="(p: number) => (table.page.value = p)"
        @limit-change="(s: number) => { table.pageSize.value = s; table.page.value = 1 }"
      />
    </div>

    <RoleFormDialog v-model="formVisible" :role="formRole" @saved="table.refresh()" />
    <RolePermissionDialog
      v-model="permVisible"
      :role="permRole"
      :permissions="permissions"
    />
  </div>
</template>

<style scoped>
.lva-role-page { display: flex; flex-direction: column; gap: 12px; }
.lva-role-page__filter { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.lva-role-page__row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.lva-role-page__actions { display: flex; gap: 8px; }
.lva-role-page__pager { display: flex; justify-content: flex-end; }
.lva-role-page__op {
  cursor: pointer;
  color: var(--global-primary-color, #16baaa);
  margin-right: 12px;
}
.lva-role-page__op:hover { text-decoration: underline; }
.lva-role-page__op--danger { color: #ff5722; }
</style>
